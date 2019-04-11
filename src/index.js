import peter_sound_url from "./assets/sounds/peter pan.wav";
import music_sound_url from "./assets/sounds/music.wav";
import {Scene, Sound, SoundKit_debugger} from "./lib/SoundKit";

(async function () {
    const scene = Scene();
    const peter_sound = await Sound({
        url: music_sound_url,
        spacialized: true,
        oriented: true,
        orientation: [0, 0, 1],
        loop: true,
        volume: 0.8,
    });
    const music_sound = await Sound({
        url: peter_sound_url,
        loop: true,
        volume: 0.3,
    });
    scene.add_child(peter_sound);
    scene.add_child(music_sound);
    const sk_debugger = SoundKit_debugger(scene);
    document
        .getElementById("play")
        .addEventListener("click", () => {
            peter_sound.play();
            music_sound.play();
            sk_debugger.play();
        });
    const freq_peter = 1 / 500;
    (function loop(t) {
        const pos_peter = [
            Math.cos(2 * Math.PI * t * freq_peter),
            0,
            Math.sin(2 * Math.PI * t * freq_peter),
        ];

        peter_sound.set_position(pos_peter);
        peter_sound.set_orientation([Math.cos(t / 2), 0, Math.sin(t / 2)]);
        requestAnimationFrame(loop.bind({}, t + 1));
    })(0);


})();
