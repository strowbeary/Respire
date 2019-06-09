import {Scene, Sound, Vector3} from "lib/SoundKit";
import hum_sound_url from "assets/sounds/global/hum.flac";
import earthquake_sound_url from "assets/sounds/global/earthquake.flac";
import harp_sound_url from "assets/sounds/global/harp.flac";
import wind_sound_url from "assets/sounds/global/wind.flac";
import sable_sound_url from "assets/sounds/global/sand.flac";
import audio_test_sound_url from "assets/sounds/test_sonore.wav";
import {Animate, Easing} from "lib/TimingKit";

export default (async () => {
    const global_scene = await Scene({
        debug: true
    });
    global_scene.add(
        Sound("hum", {
            url: hum_sound_url,
            volume: 0,
            loop: true
        }),
        Sound("earthquake", {
            url: earthquake_sound_url,
            volume: 0,
            loop: true
        }),
        Sound("wind", {
            url: wind_sound_url,
            volume: 0.2,
            loop: true
        }),
        Sound("harp", {
            url: harp_sound_url,
            volume: 0.2,
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
    const hum_sound = init_scene.get_children_by_name("hum");
    const earthquake_sound = init_scene.get_children_by_name("earthquake");
    const wind_sound = init_scene.get_children_by_name("wind");
    const harp_sound = init_scene.get_children_by_name("harp");
    const sable_sound = init_scene.get_children_by_name("sable");
    const audio_test_sound = init_scene.get_children_by_name("audio_test");
    hum_sound.play();
    earthquake_sound.play();
    wind_sound.play();
    harp_sound.play();

    sable_sound.play();

    let req_id = null;
    let hum_animation = Animate(0, 0, t => t, 0.01);
    let earthquake_animation = Animate(0, 0, t => t, 0.01);
    let wind_animation = Animate(0, 0, t => t, 0.01);
    let harp_animation = Animate(0, 0, t => t, 0.01);
    let sable_animation = Animate(0, 0, t => t, 0.01);
    hum_animation.start();
    (function loop(t) {
        if(sable_animation.is_running) {
            let volume_sable = sable_animation.tick();
            sable_sound.set_volume(volume_sable);
        }
        if(hum_animation.is_running) {
            hum_sound.set_volume(hum_animation.tick());
        }
        if(earthquake_animation.is_running) {
            earthquake_sound.set_volume(earthquake_animation.tick());
        }
        if(wind_animation.is_running) {
            wind_sound.set_volume(wind_animation.tick());
        }
        if(harp_animation.is_running) {
            harp_sound.set_volume(harp_animation.tick());
        }
        req_id = requestAnimationFrame(loop.bind({}, t + 1))
    })(0);

    return {
        async start() {
            return await init_scene.play();
        },
        fade_out_sable() {
            sable_animation = Animate(0.7, 0, Easing.easeInQuad, 0.05);
            sable_animation.start();
        },
        fade_in_sable() {
            sable_animation = Animate(0, 0.7, Easing.easeInQuad, 0.05);
            sable_animation.start();
        },
        fade_in_nappe() {
            hum_animation = Animate(0, 3, Easing.easeInQuad, 0.006);
            earthquake_animation = Animate(0, 0.8, Easing.linear, 0.0001);
            wind_animation = Animate(0, 0.2, Easing.linear, 0.0001);
            harp_animation = Animate(0, 0.2, Easing.linear, 0.0001);
            hum_animation.start();
            earthquake_animation.start();
            wind_animation.start();
            harp_animation.start();
        },
        fade_out_nappe() {
            hum_animation = Animate(3, 0, Easing.easeInQuad, 0.006);
            earthquake_animation = Animate(0.8, 0, Easing.linear, 0.006);
            wind_animation = Animate(0.2, 0, Easing.linear, 0.006);
            harp_animation = Animate(0.2, 0, Easing.linear, 0.006);
            hum_animation.start();
            earthquake_animation.start();
            wind_animation.start();
            harp_animation.start();
        },
        get audio_test_sound() {
            return audio_test_sound;
        }
    }
})();
