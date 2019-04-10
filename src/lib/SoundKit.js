import {angle_vector, read_raw_stream, canvas_arrow} from "./utils";


const audio_context = new (window.AudioContext || window.webkitAudioContext)();

window.addEventListener("focus", () => {
    audio_context.resume();
});

window.addEventListener("blur", () => {
    audio_context.suspend();
});

if (!document.hasFocus()) {
    audio_context.suspend();
}

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
    let next_time = 0;

    const gain_node = audio_context.createGain();
    const panner = audio_context.createPanner();

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
    gain_node.gain.setValueAtTime(default_options.volume, audio_context.currentTime);

    const loaded_chunks = [];
    function schedule_chunk(t) {
        const chunk = loaded_chunks.shift();
        const source = chunk.source;
        source.connect(gain_node);
        source.start(t);
        if(loaded_chunks.length > 0) {
            schedule_chunk(t + source.buffer.duration);
        }
    }
    const response = await fetch(options.url);
    const stream = await response.body.getReader();
    read_raw_stream(stream,  function (buffer) {
        audio_context.decodeAudioData(buffer).then((audio_buffer) => {
            const source = audio_context.createBufferSource();
            source.buffer = audio_buffer;

            loaded_chunks.push({
                source,
                order: buffer.order
            });
            loaded_chunks.sort((a, b) => a.order-b.order);
        });
    });




    return {
        async play() {
            schedule_chunk(audio_context.currentTime + 0.01);
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

            ctx.strokeStyle = "rgb(0, 0, 0)";
            ctx.lineWidth = 2;
            ctx.fillStyle = "rgb(0,0,0)";

            ctx.beginPath();
            const angle = (panner.coneInnerAngle / 2) / 360 * 2 * Math.PI;
            const oriented_angle = -angle_vector([1, 0, 0], [panner.orientationX.value, 0, panner.orientationZ.value]);
            ctx.ellipse(coords.x, coords.y, 20, 20, oriented_angle, -angle, angle);
            ctx.stroke();
            ctx.closePath();
            if (options.spacialized) {
                if (options.oriented) {
                    ctx.beginPath();
                    canvas_arrow(ctx, coords.x, coords.y, panner.orientationX.value * 75, panner.orientationZ.value * 75);
                    ctx.stroke();
                    ctx.closePath();
                }
                ctx.beginPath();
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

