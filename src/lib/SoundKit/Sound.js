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

    async function init(audio_context, main_node) {
        const gain_node = audio_context.createGain();
        const streamer = audio_context.createScriptProcessor(4096, 0, 1);
        const source = audio_context.createBufferSource();
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
            gain_node.connect(main_node);
        }
        gain_node.gain.setValueAtTime(options.volume, audio_context.currentTime);

        source.connect(streamer);
        streamer.connect(gain_node);


        function schedule_chunks(iterator, t) {
            const {value, done} = iterator.next();
            !done && (() => {
                const chunk = value[1];
                const source = audio_context.createBufferSource();
                source.buffer = chunk.audio_buffer;
                source.connect(gain_node);
                source.start(t);
                t += chunk.audio_buffer.duration;
                schedule_chunks(iterator, t);
            })();
        }

        async function play() {
            const response = await fetch(options.url);
            const wave_header_length = 44;
            source.buffer = audio_context.createBuffer(
                2,
                parseInt(response.headers.get("Content-Length")) - wave_header_length,
                audio_context.sampleRate
            );
            source.buffer.getChannelData(0).map(() => 0);
            source.buffer.getChannelData(1).map(() => 0);

            const stream = await response.body.getReader();
            const audio_buffer_list = [];
            let buffer_to_read = 0;
            let read_buffer_length = 0;

            read_raw_stream(stream, async buffer => {
                const audio_buffer = await audio_context.decodeAudioData(buffer);
                audio_buffer_list.push(audio_buffer);
            });

            streamer.onaudioprocess = function (audioProcessingEvent) {
                const output_buffer = audioProcessingEvent.outputBuffer;
                const input_buffer = audio_buffer_list[buffer_to_read];

                const output_data = output_buffer.getChannelData(0);

                if (audio_buffer_list.length === 0) {
                    for (let sample = 0; sample < output_data.length; sample++) {
                        output_data[sample] = 0;
                    }
                    return;
                }

                const remaining_length_to_read = audio_buffer_list[buffer_to_read].length - read_buffer_length;
                for (let sample = 0; sample < output_data.length; sample++) {
                    // make output equal to the same as the input
                    output_data[sample] = audio_buffer_list[buffer_to_read].getChannelData(0)[read_buffer_length];
                    read_buffer_length++;
                    if (remaining_length_to_read === sample) {
                        buffer_to_read++;
                        read_buffer_length = 0;
                    }
                }

                console.log(buffer_to_read, audio_buffer_list.length);
            };
            source.start();
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
        ctx.textAlign = "center";
        ctx.fillText(name, sound_position.x + 45, sound_position.z + 5);
        ctx.fill();
        ctx.closePath();
    }

}
