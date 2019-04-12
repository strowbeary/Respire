import {Vector3} from "./Vector3";

function Listener(audio_context) {
    const listener = audio_context.listener;
    let position = Vector3(0, 0, 0);

    function set_position(v) {
        position = v;
        listener.setPosition(...v.to_array())
    }

    return {
        set_position,
        get position() {
            return position
        }
    }
}

export async function Scene(options) {
    options = {
        debug: false,
        ...options
    };

    const audio_context = new (window.AudioContext || window.webkitAudioContext)();
    const listener = Listener(audio_context);
    const main_gain_node = audio_context.createGain();
    const children = [];

    async function init() {
        const initialized_children = await Promise.all(children.map(async function(c) {
            return c.init(audio_context);
        }));

        function set_volume(volume) {
            main_gain_node.gain.setValueAtTime(volume, audio_context.currentTime)
        }

        async function play() {
            await audio_context.resume();
        }

        async function pause() {
            await audio_context.suspend();
        }

        function get_children_by_name(name) {
            return initialized_children.find(c => c.name === name);
        }

        if(options.debug) {
            const {sk_debugger} = await import('./Debugger.js');
            sk_debugger(audio_context, listener, initialized_children);
        }

        return {
            set_volume,
            play,
            pause,
            get_children_by_name,
            get volume() {
                return main_gain_node.gain;
            },
            get listener() {
                return listener;
            },
            get children() {
                return initialized_children;
            }
        }
    }

    function add(...child) {
        children.push(...child);
    }


    return {
        add,
        init
    }

}

export function scene_debugger(ctx, canvas, listener) {
    const canvas_center = Vector3(canvas.width / 2, 0, canvas.height / 2);
    const listener_position = listener.position
        .multiply_scalar(canvas.width / 2 - 5)
        .add(canvas_center);

    ctx.beginPath();
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.ellipse(listener_position.x, listener_position.z, 5, 5, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

}
