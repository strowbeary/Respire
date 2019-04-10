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


    const source = audio_context.createBufferSource();
    source.buffer = audio_context.createBuffer(2, 4096, audio_context.sampleRate);
    source.loop = default_options.loop;

    const gain_node = audio_context.createGain();
    const panner = audio_context.createPanner();
    const scheduler_node = audio_context.createScriptProcessor(4096, 2, 2);

    source.connect(scheduler_node);
    scheduler_node.connect(gain_node);

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
    const response = await fetch(options.url);
    const stream = await response.body.getReader();
    await read_raw_stream(stream, async function (buffer) {
        const audio_buffer = await audio_context.decodeAudioData(buffer);
        loaded_chunks.push(audio_buffer);
    });

    let chunk_index = 0;
    let consumed_data = 0;

    scheduler_node.onaudioprocess = async function (e) {

        const channel_left_data = e.outputBuffer.getChannelData(0);
        const channel_right_data = e.outputBuffer.getChannelData(1);
        for(let i = 0; i < channel_left_data.length; i++) {
            const chunk = loaded_chunks[chunk_index];
            channel_left_data[i] = chunk.getChannelData(0)[consumed_data];
            channel_right_data[i] = chunk.getChannelData(1)[consumed_data];
            consumed_data++;
            if(consumed_data > chunk.length) {
                chunk_index++;
                consumed_data = 0;
            }
        }
    };

    return {
        async play() {
            source.start(audio_context.currentTime);
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

