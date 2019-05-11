import crowd_left_sound_url from "assets/sounds/Foule/crowd_left.wav";
import crowd_right_sound_url from "assets/sounds/Foule/crowd_right.wav";
import excuse_sound_url from "assets/sounds/Foule/excusez_moi.wav";
import pardon_sound_url from "assets/sounds/Foule/Pardon.wav";
import ouch_sound_url from "assets/sounds/Foule/Ouch.wav";
import { Scene, Sound, Vector3 } from "lib/SoundKit";

export async function init_foule_sound_scene() {

    const scene = await Scene({
        debug: true
    });

    scene.add(
        Sound("crowd_left", {
            url: crowd_left_sound_url,
            volume: 0.5,
            spacialized: true,
            oriented: true,
        }),
        Sound("crowd_right", {
            url: crowd_right_sound_url,
            volume: 0.5,
            spacialized: true,
            oriented: true,
            loop: true,
            position: Vector3(0.5, 0, -1.5),
            orientation: Vector3(-1, 0, 0)
        }),
        Sound("ouch", {
            url: ouch_sound_url,
        }),
        Sound("excuse", {
            url: excuse_sound_url,
        }),
        Sound("pardon", {
            url: pardon_sound_url,
        })
    );

    const init_scene = await scene.init();
    const crowd_left_sound = init_scene.get_children_by_name("crowd_left");
    const crowd_right_sound = init_scene.get_children_by_name("crowd_right");
    const ouch_sound = init_scene.get_children_by_name("ouch");
    const pardon_sound = init_scene.get_children_by_name("pardon");
    const excuse_sound = init_scene.get_children_by_name("excuse");
    const sounds = [ouch_sound, pardon_sound, excuse_sound];
    crowd_left_sound.play();
    crowd_right_sound.play();
    let sound_to_play = 0;
    let prev_sound = null;
    return {
        async start_audio() {
            await init_scene.play();
        },
        async play_interaction_sound() {
            const sound = sounds[sound_to_play];
            sound.stop();
            sound.play();
            prev_sound = sound;
            sound_to_play = (sound_to_play + 1) % sounds.length;

        },
        set_z_position(z) {
            crowd_left_sound.set_position(
                Vector3(crowd_left_sound.options.position.x, crowd_left_sound.options.position.y, -z)
            );
            crowd_right_sound.set_position(
                Vector3(crowd_right_sound.options.position.x, crowd_right_sound.options.position.y, -z)
            );
        }
    };
}
