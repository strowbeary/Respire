import {angle_vector, canvas_arrow, concat, pad, wavify} from "./utils";

function init_context() {
    return new (window.AudioContext || window.webkitAudioContext)();
}

const audio_context = init_context();

window.addEventListener("focus", () => {
    audio_context.resume();
});

window.addEventListener("blur", () => {
    audio_context.suspend();
});



export async function Sound(options) {
    const default_options = {
        volume: 1,
        loop: false,
        position: [0, 0, 0],
        orientation: [1, 0, 0],
        spacialized: false,
        oriented: false,
        ...options
    };


    const source = audio_context.createBufferSource();

    const response = await fetch(options.url);
    const buffer = await response.arrayBuffer();
    source.buffer = await audio_context.decodeAudioData(buffer);
    const gain_node = audio_context.createGain();

    const panner = audio_context.createPanner();


    source.connect(gain_node);
    if (options.spacialized) {
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.rolloffFactor = 1;
        if (options.oriented) {
            panner.coneInnerAngle = 90;
            panner.coneOuterGain = 0.2;
        }

        gain_node.connect(panner);
        panner.connect(audio_context.destination);

        panner.setPosition(...default_options.position);
        panner.setOrientation(...default_options.orientation);
    } else {
        gain_node.connect(audio_context.destination);
    }
    source.loop = default_options.loop;
    gain_node.gain.setValueAtTime(default_options.volume, audio_context.currentTime);

    return {
        play() {
            source.start(0)
        },
        set_position(position) {
            if (options.spacialized) {
                panner.setPosition(...position);
            }
        },
        set_orientation(orientation) {
            if (options.oriented) {
                panner.setOrientation(...orientation);
            }
        },
        set_volume(volume) {
            gain_node.gain.setValueAtTime(volume, audio_context.currentTime)
        },
        canvas_helper(ctx) {
            const coords = {
                x: 150 + panner.positionX.value * 145,
                y: 150 + panner.positionZ.value * 145
            };
            ctx.beginPath();
            ctx.strokeStyle = "3px rgba(0, 0, 255, 0.3)";
            const angle = (panner.coneInnerAngle / 2) / 360 * 2 * Math.PI;
            const oriented_angle = -angle_vector([1, 0, 0], [panner.orientationX.value, 0, panner.orientationZ.value]);
            ctx.ellipse(coords.x, coords.y, 20, 20, oriented_angle, -angle, angle);
            ctx.stroke();
            ctx.closePath();
            if (options.spacialized) {
                if (options.oriented) {
                    ctx.beginPath();
                    ctx.strokeStyle = "rgb(0,0,0)";
                    canvas_arrow(ctx, coords.x, coords.y, panner.orientationX.value * 75, panner.orientationZ.value * 75);
                    ctx.stroke();
                    ctx.closePath();
                }
                ctx.beginPath();
                ctx.fillStyle = "rgb(0,0,0)";
                ctx.ellipse(coords.x, coords.y, 5, 5, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            } else {
                ctx.beginPath();
                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.ellipse(coords.x, coords.y, 15, 15, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            }

        }
    }
}

