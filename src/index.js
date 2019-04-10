import peter_sound_url from "./assets/sounds/music.wav";
import {Sound} from "./lib/SoundKit";

(async function () {

    const peter_sound = await Sound({
        url: peter_sound_url,
        spacialized: true,
        oriented: true,
        orientation: [0, 0, 1],
        loop: true,
        volume: 0.5,
    });
    peter_sound.play();
    document
        .getElementById("play")
        .addEventListener("click", () => peter_sound.play());

    const canvas = document.getElementById("viewer");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    console.log("SPR", dpr);
    ctx.scale(dpr, dpr);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    (function loop(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const freq_peter = 1 / 500;
        const pos_peter = [
            Math.cos(2 * Math.PI * t * freq_peter),
            0,
            Math.sin(2 * Math.PI * t * freq_peter),
        ];


        ctx.beginPath();
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.ellipse(150, 150, 5, 5, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        peter_sound.set_position(pos_peter);
        //peter_sound.set_orientation([-pos_peter[0], 0, -pos_peter[2]]);
        peter_sound.canvas_helper(ctx);

        requestAnimationFrame(loop.bind({}, t + 1));
    })(0);

})();
