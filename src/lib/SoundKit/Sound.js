import {Vector3} from "./Vector3";
import {angle_vector, canvas_arrow} from "./utils";

export function Sound(name, options) {
    options = {
        volume: 1,
        loop: false,
        streaming: true,
        spacialized: false,
        oriented: false,
        position: Vector3(0, 0, 0),
        orientation: Vector3(0, 0, -1),
        cone_inner_angle: 90,
        cone_outer_gain: 0.2,
        ...options
    };

    async function init(audio_context, main_node) {
        const gain_node = audio_context.createGain();


        let panner = null;

        if (options.spacialized) {
            panner = audio_context.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.rolloffFactor = 1;
            if (options.oriented) {
                panner.coneInnerAngle = options.cone_inner_angle;
                panner.coneOuterGain = options.cone_outer_gain;
            }

            gain_node.connect(panner);
            panner.connect(main_node);

            panner.setPosition(...options.position.to_array());
            panner.setOrientation(...options.orientation.to_array());
        } else {

            options.position = Vector3(0, 0, 0);
            options.orientation = Vector3(0, 0, 0);
            gain_node.connect(main_node);
        }
        gain_node.gain.setValueAtTime(options.volume, audio_context.currentTime);


        const response = await fetch(options.url);
        const audio_raw_data = await response.arrayBuffer();
        let source;
        const buffer = await audio_context.decodeAudioData(audio_raw_data);
        return {
            async play() {
                source = audio_context.createBufferSource();
                source.buffer = buffer;
                source.connect(gain_node);
                source.loop = options.loop;
                source.start(0);
            },
            async stop(cb) {
                const buffer = source.buffer;
                source.disconnect();
                source = audio_context.createBufferSource();
                source.loop = options.loop;
                source.buffer = buffer;
                await source.connect(gain_node);
            },
            set_position(position) {
                if (options.spacialized) {
                    options.position = position;
                    panner.setPosition(...position.to_array());
                }
            },
            set_orientation(orientation) {
                if (options.oriented) {
                    options.orientation = orientation;
                    panner.setOrientation(...orientation.to_array());
                }
            },
            set_volume(volume) {
                options.volume = volume;
                gain_node.gain.setValueAtTime(volume, audio_context.currentTime);
            },
            set_loop(loop) {
                options.loop = loop;
                source.loop = loop;
            },
            get name() {
                return name;
            },
            get options() {
                return options;
            }
        }
    }

    return {
        init,
        get name() {
            return name;
        },
        get options() {
            return options;
        }
    }
}

export function sound_debugger(ctx, canvas, options, name, non_spacialized_debbuger_id) {
    const canvas_center = Vector3(canvas.width / 2, 0, canvas.height / 2);
    const sound_position = options.position
        .multiply_scalar(canvas.width / 3 - 5)
        .add(canvas_center);

    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgb(255, 255, 255)";

    if (options.spacialized) {
        if (options.oriented) {
            ctx.beginPath();
            const angle = (options.cone_inner_angle / 2) / 360 * 2 * Math.PI;
            const oriented_angle = -angle_vector([1, 0, 0], [options.orientation.x, 0, options.orientation.z]);
            ctx.ellipse(sound_position.x, sound_position.z, 20, 20, oriented_angle, -angle, angle);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            canvas_arrow(ctx, sound_position.x, sound_position.z, options.orientation.x * 50, options.orientation.z * 50);
            ctx.stroke();
            ctx.closePath();
        }
        ctx.beginPath();
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.ellipse(sound_position.x, sound_position.z, 5, 5, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.font = "14px 'Fira Sans'";
        ctx.textAlign = "center";
        ctx.fillText(name, sound_position.x, sound_position.z + 30);
        ctx.fill();
        ctx.closePath();
    } else {
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.ellipse(sound_position.x, sound_position.z, 20, 20, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.font = "14px 'Fira Sans'";
        ctx.textAlign = "left";
        ctx.fillText("- " + name, sound_position.x + 25, sound_position.z + 5 + (non_spacialized_debbuger_id * 15));
        ctx.fill();
        ctx.closePath();
    }
}
