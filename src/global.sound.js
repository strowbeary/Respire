import {Scene, Sound} from "lib/SoundKit";
import nappe_sound_url from "assets/sounds/nappe.wav";
import {Animate, Easing} from "lib/TimingKit";

export default (async () => {
    const global_scene = await Scene({
        debug: true
    });
    global_scene.add(
        Sound("nappe", {
            url: nappe_sound_url,
            volume: 0.7,
            loop: true
        })
    );

    const init_scene = await global_scene.init();
    const nappe_sound = init_scene.get_children_by_name("nappe");
    nappe_sound.play();

    let req_id = null;
    let nappe_animation = Animate(0, 0, t => t, 0.01);
    nappe_animation.start();
    (function loop(t) {

        nappe_sound.set_volume(nappe_animation.tick());
        req_id = requestAnimationFrame(loop.bind({}, t + 1))
    })(0);

    return {
        fade_out_nappe() {
            nappe_animation = Animate(1, 0, Easing.easeInQuad, 0.01);
            nappe_animation.start();
        },
        fade_in_nappe() {
            nappe_animation = Animate(0, 1, Easing.easeInQuad, 0.01);

        }
    }
})();
