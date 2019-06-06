import { Scene, Sound, Vector3 } from "lib/SoundKit";
import alarm_clock_sound_url from "assets/sounds/Cauchemar/alarm_clock.wav";
import preparation_sound_url from "assets/sounds/Cauchemar/STE-005.flac";

export async function init_cauchemar_sound_scene() {
    const scene = await Scene({
        debug: false
    });

    scene.add(
        Sound("alarm_clock", {
            url: alarm_clock_sound_url,
            volume: 0.8,
            loop: true
        }),
        Sound("preparation", {
            url: preparation_sound_url,
            volume: 1.7
        }),
    );

    const init_scene = await scene.init();
    const alarm_clock_sound = init_scene.get_children_by_name("alarm_clock");
    const preparation_sound = init_scene.get_children_by_name("preparation");

    return {
        async start_audio() {
            await init_scene.play();
        },
        trigger_alarm_clock() {
            alarm_clock_sound.play();
        },
        stop_alarm_clock() {
            alarm_clock_sound.stop();

        },
        play_preparation_sound() {
            preparation_sound.play();
        },
        destroy() {
            init_scene.destroy();
        },
        set_preparation_volume(volume) {
            preparation_sound.set_volume(volume);
        }
    }

}
