import rock_sound_url from "./assets/sounds/RŮDE - Forever Lotus EP - 01 Forever Lotus.wav";
import heart_sound_url from "./assets/sounds/crowd.wav";
import {Sound} from "./lib/SoundKit";
import {AssetLoader} from "./lib/AssetKit";

(async function() {
    const loader = AssetLoader();
    loader.addEventListener("progress", (e) => console.log(e.detail));
    const [
        test_sound,
        heart_sound
    ] = await loader
        .load([
        Sound({
            url: rock_sound_url,
            spacialized: true,
            loop: true,
            volume: 0.5,
        }),
        Sound({
            url: heart_sound_url,
            loop: true,
            position: [0.5, 0.5, 0],
            spacialized: true,
            oriented: true,
            volume: 0.5,
        })
    ]);
    test_sound.play();
    heart_sound.play();

    const canvas = document.getElementById("viewer");
    const ctx = canvas.getContext("2d");


    (function loop(t) {
        ctx.clearRect(0, 0, 300, 500);
        const freq = 1 / 500;
        const pos = [
            Math.cos(2 * Math.PI * t * freq),
            0,
            Math.sin(2 * Math.PI * t * freq),
        ];


        ctx.beginPath();
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.ellipse(150, 150, 5, 5, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        test_sound.set_position(pos);
        test_sound.set_orientation([-pos[0], 0, -pos[2]]);
        heart_sound.set_orientation([-pos[0], 0, -pos[2]]);
        test_sound.canvas_helper(ctx);
        heart_sound.canvas_helper(ctx);

        requestAnimationFrame(loop.bind({}, t + 1));
    })(0);

})();
