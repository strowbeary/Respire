import {Scene, Sound, Vector3} from "lib/SoundKit";
import hum_sound_url from "assets/sounds/global/hum.flac";
import earthquake_sound_url from "assets/sounds/global/earthquake.flac";
import harp_sound_url from "assets/sounds/global/harp.flac";
import wind_sound_url from "assets/sounds/global/wind.flac";
import sable_sound_url from "assets/sounds/global/sand.flac";
import audio_test_sound_url from "assets/sounds/test_sonore.wav";
import {Animate, Easing, Keyframes} from "lib/TimingKit";

export default (async () => {
    const global_scene = await Scene({
        debug: false
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

    const hum_sound = init_scene.get_children_by_name("hum");
    const earthquake_sound = init_scene.get_children_by_name("earthquake");
    const wind_sound = init_scene.get_children_by_name("wind");
    const sable_sound = init_scene.get_children_by_name("sable");
    const audio_test_sound = init_scene.get_children_by_name("audio_test");

    hum_sound.play();
    earthquake_sound.play();
    wind_sound.play();
    sable_sound.play();

    let req_id = null;
    let hum_animation = Animate(0, 0, t => t, 0.01);
    let earthquake_animation = Animate(0, 0, t => t, 0.01);
    let wind_animation = Animate(0, 0, t => t, 0.01);
    let sable_animation = Animate(0, 0, t => t, 0.01);

    //hum_animation.start();

    (function loop(t) {
        if(sable_animation.is_running) {
            let volume_sable = sable_animation.tick();
            sable_sound.set_volume(volume_sable);
        }
        if(hum_animation.is_running) {
            hum_sound.set_volume(hum_animation.tick());
        } else {
            console.log("end", hum_animation.tick())
        }
        if(earthquake_animation.is_running) {
            earthquake_sound.set_volume(earthquake_animation.tick());
        }
        if(wind_animation.is_running) {
            wind_sound.set_volume(wind_animation.tick());
        }
        req_id = requestAnimationFrame(loop.bind({}, t + 1))
    })(0);

    return {
        async start() {
            return await init_scene.play();
        },
        fade_out_sable() {
            sable_animation = Animate(1, 0, Easing.easeInQuad, 0.05);
            sable_animation.start();
        },
        fade_in_sable() {
            sable_animation = Animate(0, 1, Easing.easeInQuad, 0.05);
            sable_animation.start();
        },
        fade_in_nappe() {
            hum_animation = Animate(0, 4, Keyframes([
                {
                    t: 0,
                    value: 0
                },
                {
                    t: 0.2,
                    value: 0.15
                },
                {
                    t: 0.4,
                    value: 0.30
                },
                {
                    t: 0.6,
                    value: 0.45
                },
                {
                    t: 0.8,
                    value: 0.55
                },
                {
                    t: 1,
                    value: 1
                }
            ], Easing.linear), 0.00025);
            earthquake_animation = Animate(0, 0.4, Easing.linear, 0.0001);
            wind_animation = Animate(0, 0.05, Easing.linear, 0.0001);
            hum_animation.start();
            earthquake_animation.start();
            wind_animation.start();
        },
        fade_out_nappe() {
            hum_animation = Animate(4, 0, Easing.easeInQuad, 0.006);
            earthquake_animation = Animate(0.4, 0, Easing.easeInQuad, 0.006);
            wind_animation = Animate(0.05, 0, Easing.easeInQuad, 0.006);

            hum_animation.start();
            earthquake_animation.start();
            wind_animation.start();
        },
        get audio_test_sound() {
            return audio_test_sound;
        }
    }
})();
