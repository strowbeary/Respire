import { Scene, Sound, Vector3 } from "lib/SoundKit";
import whisper_01_sound_url from "assets/sounds/Ideas/whipser_01.wav";
import whisper_02_sound_url from "assets/sounds/Ideas/whipser_02.wav";
import whisper_03_sound_url from "assets/sounds/Ideas/whipser_03.wav";
import whisper_04_sound_url from "assets/sounds/Ideas/whipser_04.wav";
import whisper_05_sound_url from "assets/sounds/Ideas/whipser_05.wav";
import cours_litterature_sound_url from "assets/sounds/Ideas/cours_litterature.wav";
import {LowPassEffect} from "lib/SoundKit/effects/LowPassEffect";

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
        Sound("cours_litterature", {
            url: cours_litterature_sound_url,
            volume: 1,
            spacialized: true,
            position: Vector3(0, -0.6, 0),
            orientation: Vector3(1, 0, 0)
        }),
    );

    const init_scene = await scene.init();
    const whispers = [
        init_scene.get_children_by_name("whisper_01"),
        init_scene.get_children_by_name("whisper_02"),
        init_scene.get_children_by_name("whisper_03"),
        init_scene.get_children_by_name("whisper_04"),
        init_scene.get_children_by_name("whisper_05"),
    ];
    const course_sound = init_scene.get_children_by_name("cours_litterature");
    const low_pass_filter = course_sound.add_effect(LowPassEffect);
    let current_whisper = 0;
    low_pass_filter.set_frequency(9000);
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
        set_prof_freq(f) {
            low_pass_filter.set_frequency(f);
        }
    }
}
