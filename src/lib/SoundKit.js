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

export function Scene(options) {
    options = {
        position: [0, 0, 0],
        ...options
    };
    audio_context.listener.setPosition(...options.position);
    console.log(audio_context.listener);

    const children = [];

    return {
        set_position(position) {
            options.position = position;
            audio_context.listener.setPosition(...position);
        },
        add_child(child) {
            children.push(child);
        },
        _debug: {
            canvas_helper(ctx, canvas) {
                const coords = {
                    x: canvas.width / 2 + options.position[0] * (canvas.width / (2 * window.devicePixelRatio) - 5),
                    y: canvas.height / 2 + options.position[2] * (canvas.height / (2 * window.devicePixelRatio) - 5)
                };
                ctx.beginPath();
                ctx.fillStyle = "rgb(255,0,0)";
                ctx.ellipse(coords.x, coords.y, 10, 10, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            }
        },
        children
    }
}

export function SoundKit_debugger(scene, options) {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;

    document.body.appendChild(canvas);
    let raf = null;


    return {
        play() {

            const ctx = canvas.getContext("2d");
            (function loop(t) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                scene._debug.canvas_helper(ctx, canvas);
                scene.children.forEach(c => c._debug.canvas_helper(ctx, canvas));

                raf = requestAnimationFrame(loop.bind({}, t + 1));
            })(0);
        },
        destroy() {
            cancelAnimationFrame(raf);
        }
    }
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

    function schedule_chunk(t, chunk_iterator) {
        const {value, done} = chunk_iterator.next();
        if (!done) {
            const source = value[1].source;
            source.connect(gain_node);
            source.start(t);
            schedule_chunk(t + source.buffer.duration, chunk_iterator);
        }
    }

    const response = await fetch(options.url);
    const stream = await response.body.getReader();
    read_raw_stream(stream, function (buffer) {
        audio_context.decodeAudioData(buffer).then((audio_buffer) => {
            const source = audio_context.createBufferSource();
            source.buffer = audio_buffer;

            loaded_chunks.push({
                source,
                order: buffer.order
            });
            loaded_chunks.sort((a, b) => a.order - b.order);
        });
    });


    return {
        play() {
            console.log(options.url, loaded_chunks);
            schedule_chunk(audio_context.currentTime + 0.01, loaded_chunks.entries());
        },
        pause() {
            console.log(gain_node);
        },
        stop() {

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
        _debug: {
            canvas_helper(ctx, canvas) {
                const coords = {
                    x: canvas.width / 2 + panner.positionX.value * (canvas.width / (2 * window.devicePixelRatio) - 5),
                    y: canvas.height / 2 + panner.positionZ.value * (canvas.height / (2 * window.devicePixelRatio) - 5)
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
                    ctx.beginPath();
                    ctx.font = "14px Arial";
                    ctx.textAlign = Math.sign(panner.positionX.value) === 1 ? "left" : "right";
                    ctx.fillText(options.url, coords.x + Math.sign(panner.positionX.value) * 20, coords.y + 5);
                    ctx.fill();
                    ctx.closePath();
                } else {
                    ctx.beginPath();
                    ctx.font = "14px Arial";
                    ctx.textAlign = "left";
                    ctx.fillText(options.url, canvas.width / 2 + 30, canvas.height / 2 + 5);
                    ctx.fill();
                    ctx.closePath();

                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                    ctx.ellipse(coords.x, coords.y, 15, 15, 0, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.closePath();
                }

            },

        }
    }
}

