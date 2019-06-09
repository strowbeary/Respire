import { Scene, Sound, Vector3 } from "lib/SoundKit";
import whisper_01_sound_url from "assets/sounds/Ideas/whipser_01.flac";
import whisper_02_sound_url from "assets/sounds/Ideas/whipser_02.flac";
import whisper_03_sound_url from "assets/sounds/Ideas/whipser_03.flac";
import whisper_04_sound_url from "assets/sounds/Ideas/whipser_04.flac";
import whisper_05_sound_url from "assets/sounds/Ideas/whipser_05.flac";
import whisper_06_sound_url from "assets/sounds/Ideas/whipser_06.flac";
import whisper_07_sound_url from "assets/sounds/Ideas/whipser_07.flac";
import cours_litterature_sound_url from "assets/sounds/Ideas/cours_litterature.flac";
import {LowPassEffect} from "lib/SoundKit/effects/LowPassEffect";
import {Easing, Keyframes} from "lib/TimingKit";

export async function init_ideas_sound_scene() {

    const scene = await Scene({
        debug: false
    });

    scene.add(
        Sound("whisper_01", {
            url: whisper_01_sound_url,
            volume: 1,
            spacialized: true,
            position: Vector3(0, 0, 0),
            orientation: Vector3(1, 0, 0)
        }),
        Sound("whisper_02", {
            url: whisper_02_sound_url,
            volume: 1,
            spacialized: true,
            position: Vector3(0, 0, 0),
            orientation: Vector3(1, 0, 0)
        }),
        Sound("whisper_03", {
            url: whisper_03_sound_url,
            volume: 1,
            spacialized: true,
            position: Vector3(0, 0, 0),
            orientation: Vector3(1, 0, 0)
        }),
        Sound("whisper_04", {
            url: whisper_04_sound_url,
            volume: 1,
            spacialized: true,
            position: Vector3(0, 0, 0),
            orientation: Vector3(1, 0, 0)
        }),
        Sound("whisper_05", {
            url: whisper_05_sound_url,
            volume: 1,
            spacialized: true,
            position: Vector3(0, 0, 0),
            orientation: Vector3(1, 0, 0)
        }),
        Sound("whisper_06", {
            url: whisper_06_sound_url,
            volume: 1,
            spacialized: true,
            position: Vector3(0, 0, 0),
            orientation: Vector3(1, 0, 0)
        }),
        Sound("whisper_07", {
            url: whisper_07_sound_url,
            volume: 1,
            spacialized: true,
            position: Vector3(0, 0, 0),
            orientation: Vector3(1, 0, 0)
        }),
        Sound("cours_litterature", {
            url: cours_litterature_sound_url,
            volume: 0.8,
            spacialized: true,
            position: Vector3(0, -0.6, 0),
            orientation: Vector3(1, 0, 0)
        }),
    );

    const init_scene = await scene.init();
    const whispers = [
        init_scene.get_children_by_name("whisper_02"),
        init_scene.get_children_by_name("whisper_01"),
        init_scene.get_children_by_name("whisper_03"),
        init_scene.get_children_by_name("whisper_04"),
        init_scene.get_children_by_name("whisper_05"),
        init_scene.get_children_by_name("whisper_06"),
        init_scene.get_children_by_name("whisper_07"),
    ];
    const course_sound = init_scene.get_children_by_name("cours_litterature");
    const low_pass_filter = course_sound.add_effect(LowPassEffect);
    let current_whisper = 0;
    low_pass_filter.set_frequency(20000);

    return {
        async start_audio() {
            await init_scene.play();
        },
        play_course() {
            course_sound.play();
        },
        play_a_whisper(position) {
            whispers[current_whisper].set_position(position);
            whispers[current_whisper].play();
            current_whisper = (current_whisper + 1) % whispers.length;
        },
        destroy() {
            init_scene.destroy();
        },
        set_prof_filter_ratio(r) {
            r = Keyframes([
                {
                    t: 0,
                    value: 0.5
                },
                {
                    t: 0.7,
                    value: 0.5
                },
                {
                    t: 1,
                    value: 1
                }
            ], Easing.easeInOutQuad)(r);
            const freq = Math.pow(10, r * 4) * 2;
            low_pass_filter.set_frequency(freq);
        },
        set_prof_volume(v) {
            course_sound.set_volume(v);
        }
    }
}
