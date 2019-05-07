import peter_sound_url from "./assets/sounds/peter pan.wav";
import music_sound_url from "./assets/sounds/music.wav";
import {Scene, Sound, Vector3} from "./lib/SoundKit";

import { update } from './rust_wasm/src/lib.rs'

console.log(update());

(async function () {

    const scene = await Scene({
        debug: true
    });

    scene.add(
        Sound("music", {
            url: music_sound_url,
            volume: 0.5,
            spacialized: true,
            oriented: true,
        }),
        Sound("crowd", {
            url: peter_sound_url,
            loop: true,
            volume: 1,
        })
    );


    document.getElementById("start_scene")
        .addEventListener("click", async function() {
            const init_scene = await scene.init();
            const crowd_sound = init_scene.get_children_by_name("crowd");
            const music_sound = init_scene.get_children_by_name("music");
            crowd_sound.play();
            music_sound.play();
            const freq_peter = 1 / 500;
            (function loop(t) {
                const pos_peter = Vector3(
                    Math.cos(2 * Math.PI * t * freq_peter),
                    0,
                    Math.sin(2 * Math.PI * t * freq_peter),
                );

                music_sound.set_position(pos_peter);
                requestAnimationFrame(loop.bind({}, t + 1));
            })(0);
        });
})();
