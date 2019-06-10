import { Scene, Sound } from "lib/SoundKit";
import loop_sound_url from "assets/sounds/Pillules/Boucle.flac";
import pop_sound_url from "assets/sounds/Pillules/pop.flac";
import writing_sound_url from "assets/sounds/Pillules/writing.flac";
import clock_sound_url from "assets/sounds/Pillules/clock tick.wav";
import {Animate, Easing} from "lib/TimingKit";


export async function init_pillule_sound_scene() {

    const scene = await Scene({
        debug: true
    });

    scene.add(
        Sound("pill_shake", {
            url: loop_sound_url,
            volume: 1,
            loop: true,
        }),
        Sound("pop", {
            url: pop_sound_url,
            volume: 1,
        }),
        Sound("writing", {
            url: writing_sound_url,
            volume: 1,
            loop: true,
        }),
        Sound("clock", {
            url: clock_sound_url,
            volume: 1,
            loop: true,
        }),
    );

    const init_scene = await scene.init();

    const writing_sound = init_scene.get_children_by_name("writing");
    const clock_sound = init_scene.get_children_by_name("clock");
    const pill_shake_sound = init_scene.get_children_by_name("pill_shake");
    writing_sound.play();
    clock_sound.play();

    let writing_animation = Animate(0, 1, Easing.linear, 0.006);
    let pill_shake_animation = Animate(0, 1, Easing.linear, 0.03);
    let req_id = null;
    (function loop(t) {
        if(writing_animation.is_running) {
            writing_sound.set_volume(writing_animation.tick());
            clock_sound.set_volume(writing_animation.tick());
        }
        if(pill_shake_animation.is_running) {
            pill_shake_sound.set_volume(pill_shake_animation.tick());
        }

        req_id = requestAnimationFrame(loop.bind({}, t + 1))
    })(0);

    return {
        async start_audio() {
            await init_scene.play();
            writing_animation.start()
        },
        destroy() {
            cancelAnimationFrame(req_id);
            init_scene.destroy();
        },
        fade_out_writing() {
            writing_animation = Animate(1, 0, Easing.linear, 0.001);
            writing_animation.start();
        },
        fade_in_writing() {
            writing_animation = Animate(0, 1, Easing.linear, 0.002);
            writing_animation.start();
        },
        start_pills_shake() {
            pill_shake_sound.play();
            pill_shake_animation.start();
        },
        stop_pills_shake() {
            pill_shake_animation = Animate(1, 0, Easing.linear, 0.03);
            pill_shake_animation.start();
        }
    }
}
