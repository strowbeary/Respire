import crowd_left_sound_url from "assets/sounds/STE-001.wav";
import crowd_right_sound_url from "assets/sounds/STE-002.wav";
import {Scene, Sound, Vector3} from "lib/SoundKit";

export async function init_foule_sound_scene() {

    const scene = await Scene({
        debug: true
    });

    scene.add(
        Sound("crowd_left", {
            url: crowd_left_sound_url,
            volume: 0.5,
            spacialized: true,
            oriented: false,
            loop: true,
            position: Vector3(-0.5, 0, 0)
        }),
        Sound("crowd_right", {
            url: crowd_right_sound_url,
            volume: 0.5,
            spacialized: true,
            oriented: false,
            loop: true,
            position: Vector3(0.5, 0, 0)
        })
    );

    const init_scene = await scene.init();
    const crowd_left_sound = init_scene.get_children_by_name("crowd_left");
    const crowd_right_sound = init_scene.get_children_by_name("crowd_right");
    crowd_left_sound.play();
    crowd_right_sound.play();
    return {
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
