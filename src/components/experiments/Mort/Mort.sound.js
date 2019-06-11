import { Scene, Sound, Vector3 } from "lib/SoundKit";
import steps_slow_sound_url from "assets/sounds/Mort/steps_slow.flac";
import steps_fast_sound_url from "assets/sounds/Mort/steps_fast.flac";
import breathing_sound_url from "assets/sounds/Mort/breathing.flac";
import heart_normal_sound_url from "assets/sounds/Mort/Heart beat normal.wav";
import heart_fast_sound_url from "assets/sounds/Mort/Heart beat fast.wav";
import {Animate} from "lib/TimingKit";

export async function init_mort_sound_scene() {

    const scene = await Scene({
        debug: true
    });

    scene.add(
        Sound("steps_slow", {
            url: steps_slow_sound_url,
            volume: 0,
            loop: true
        }),
        Sound("steps_fast", {
            url: steps_fast_sound_url,
            volume: 0,
            loop: true
        }),
        Sound("breathing", {
            url: breathing_sound_url,
            volume: 0,
            loop: true
        }),
        Sound("heart_normal", {
            url: heart_normal_sound_url,
            volume: 0,
            loop: true
        }),
        Sound("heart_fast", {
            url: heart_fast_sound_url,
            volume: 0,
            loop: true
        }),
    );

    const init_scene = await scene.init();
    const steps_slow_sound = init_scene.get_children_by_name("steps_slow");
    const steps_fast_sound = init_scene.get_children_by_name("steps_fast");
    const breathing_sound = init_scene.get_children_by_name("breathing");
    const heart_normal_sound = init_scene.get_children_by_name("heart_normal");
    const heart_fast_sound = init_scene.get_children_by_name("heart_fast");
    steps_slow_sound.play();
    steps_fast_sound.play();
    breathing_sound.play();
    heart_normal_sound.play();
    heart_fast_sound.play();

    let steps_slow_animation = Animate(0, 0.6, t => t, 0.01);
    let steps_fast_animation = Animate(0, 0, t => t, 0.01);
    let breathing_animation = Animate(0, 0.3, t => t, 0.01);
    let heart_normal_animation = Animate(0, 0.4, t => t, 0.01);
    let heart_fast_animation = Animate(0, 0, t => t, 0.01);

    let req_id = null;
    (function loop(t) {
        if(steps_slow_animation.is_running) {
            steps_slow_sound.set_volume(steps_slow_animation.tick());
        }
        if(steps_fast_animation.is_running) {
            steps_fast_sound.set_volume(steps_fast_animation.tick());
        }
        if(breathing_animation.is_running) {
            breathing_sound.set_volume(breathing_animation.tick());
        }
        if(heart_normal_animation.is_running) {
            heart_normal_sound.set_volume(heart_normal_animation.tick());
        }
        if(heart_fast_animation.is_running) {
            heart_fast_sound.set_volume(heart_fast_animation.tick());
        }
        req_id = requestAnimationFrame(loop.bind({}, t + 1))
    })(0);

    steps_slow_animation.start();
    breathing_animation.start();
    heart_normal_animation.start();
    return {
        async start_audio() {
            await init_scene.play();
        },
        destroy() {
            init_scene.destroy();
        },
        go_faster() {
            steps_slow_animation = Animate(0.6, 0, t => t, 0.1);
            steps_fast_animation = Animate(0, 0.6, t => t, 0.1);
            breathing_animation = Animate(0.3, 0.5, t => t, 0.1);
            heart_normal_animation = Animate(0.4, 0, t => t, 0.1);
            heart_fast_animation = Animate(0, 0.5, t => t, 0.1);

            steps_slow_animation.start();
            steps_fast_animation.start();
            breathing_animation.start();
            heart_normal_animation.start();
            heart_fast_animation.start();
        },
        go_slower() {
            steps_slow_animation = Animate(0, 0.6, t => t, 0.1);
            steps_fast_animation = Animate(0.6, 0, t => t, 0.1);
            breathing_animation = Animate(0.5, 0.3, t => t, 0.1);
            heart_normal_animation = Animate(0, 0.4, t => t, 0.1);
            heart_fast_animation = Animate(0.5, 0, t => t, 0.1);

            steps_slow_animation.start();
            steps_fast_animation.start();
            breathing_animation.start();
            heart_normal_animation.start();
            heart_fast_animation.start();
        }
    }
}
