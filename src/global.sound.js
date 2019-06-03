import {Scene, Sound, Vector3} from "lib/SoundKit";
import nappe_sound_url from "assets/sounds/nappe.wav";
import sable_sound_url from "assets/sounds/sand.wav";
import audio_test_sound_url from "assets/sounds/test_sonore.wav";
import {Animate, Easing, Sequence} from "lib/TimingKit";

export default (async () => {
    const global_scene = await Scene({
        debug: false
    });
    global_scene.add(
        Sound("nappe", {
            url: nappe_sound_url,
            volume: 0,
            loop: true
        }),
        Sound("sable", {
            url: sable_sound_url,
            volume: 0,
            loop: true
        }),
        Sound("audio_test", {
            url: audio_test_sound_url,
            volume: 0.8,
            spacialized: true,
            oriented: false,
            position: Vector3(0, 0, -0.5),
            orientation: Vector3(0, 0, 1)
        })
    );

    const init_scene = await global_scene.init();
    const nappe_sound = init_scene.get_children_by_name("nappe");
    const sable_sound = init_scene.get_children_by_name("sable");
    const audio_test_sound = init_scene.get_children_by_name("audio_test");
    nappe_sound.play();
    sable_sound.play();

    let req_id = null;
    let nappe_animation = Animate(0, 0, t => t, 0.01);
    let sable_animation = Animate(0, 0, t => t, 0.01);
    nappe_animation.start();
    (function loop(t) {
        let volume_nappe = nappe_animation.tick();
        let volume_sable = sable_animation.tick();
        nappe_sound.set_volume(volume_nappe);
        sable_sound.set_volume(volume_sable);
        req_id = requestAnimationFrame(loop.bind({}, t + 1))
    })(0);

    return {
        async start() {
            console.log("Play global");
            return await init_scene.play();
        },
        fade_out_sable() {
            sable_animation = Animate(0.7, 0, Easing.easeInQuad, 0.05);
            sable_animation.start();
        },
        fade_in_nappe() {
            console.log("start_sound");
            sable_animation = Animate(0, 0.7, Easing.easeInQuad, 0.006);
            sable_animation.start();
            nappe_animation = Animate(0, 0.7, Easing.easeInQuad, 0.006);
            nappe_animation.start();
        },
        get audio_test_sound() {
            return audio_test_sound;
        }
    }
})();
