import {Vector3} from "./Vector3";
import {angle_vector, canvas_arrow, read_raw_stream} from "./utils";

export function Sound(name, options) {
    options = {
        volume: 1,
        loop: false,
        streaming: true,
        spatialized: false,
        oriented: false,
        position: Vector3(0, 0, 0),
        orientation: Vector3(0, 0, -1),
        cone_inner_angle: 90,
        cone_outer_gain: 0.2,
        ...options
    };

    async function init(audio_context) {
        const gain_node = audio_context.createGain();
        const panner = audio_context.createPanner();

        if (options.spacialized) {
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.rolloffFactor = 1;
            if (options.oriented) {
                panner.coneInnerAngle = options.cone_inner_angle;
                panner.coneOuterGain = options.cone_outer_gain;
            }

            gain_node.connect(panner);
            panner.connect(audio_context.destination);

            panner.setPosition(...options.position.to_array());
            panner.setOrientation(...options.orientation.to_array());
        } else {
            gain_node.connect(audio_context.destination);
        }
        gain_node.gain.setValueAtTime(options.volume, audio_context.currentTime);

        const response = await fetch(options.url);
        const stream = await response.body.getReader();

        const loaded_chunks = [];
        read_raw_stream(stream, function (buffer) {
            audio_context.decodeAudioData(buffer).then((audio_buffer) => {
                loaded_chunks.push({
                    audio_buffer,
                    order: buffer.order
                });
                loaded_chunks.sort((a, b) => a.order - b.order);
            });
        });

        let sources = [];
        function play() {
            let t = audio_context.currentTime + 0.01;
            sources = loaded_chunks.map(chunk => {
                const source = audio_context.createBufferSource();
                source.buffer = chunk.audio_buffer;
                source.connect(gain_node);
                source.start(t);
                t += chunk.audio_buffer.duration;
                return source;
            });
            sources[sources.length - 1].onended = () => {
                if(options.loop) {
                    play();
                }
            }
        }

        return {
            play,
            stop() {
                let t = audio_context.currentTime - 0.01;
                sources.forEach(source => {
                    source.stop(t);
                    source.disconnect();
                    t += source.buffer.duration;
                });
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
                gain_node.gain.setValueAtTime(volume, audio_context.currentTime)
            },
            set_loop(loop) {
                options.loop = loop;
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

export function sound_debugger(ctx, canvas, options, name) {
    const canvas_center = Vector3(canvas.width / 2, 0, canvas.height / 2);
    const sound_position = options.position
        .multiply_scalar(canvas.width / 3 - 5)
        .add(canvas_center);

    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgb(0,0,0)";

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
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.ellipse(sound_position.x, sound_position.z, 5, 5, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.font = "14px 'Fira Sans'";
        ctx.fillText(name, sound_position.x, sound_position.z + 30);
        ctx.fill();
        ctx.closePath();
    } else {
        ctx.beginPath();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.ellipse(sound_position.x, sound_position.z, 20, 20, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.font = "14px 'Fira Sans'";
        ctx.textAlign = "center";
        ctx.fillText(name, sound_position.x + 45, sound_position.z + 5);
        ctx.fill();
        ctx.closePath();
    }

}
