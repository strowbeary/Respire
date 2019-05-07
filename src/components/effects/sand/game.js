import Worker from 'worker-loader!./sand.worker';

import {Draw2D} from "./draw2d";
let pixData, particles;
const times = [];
let fps;

export function Game(canvas) {
    this.canvas = canvas;
    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;
    this.context = this.canvas.getContext('2d');
    this.draw2d = new Draw2D(this.context, this.gameWidth, this.gameHeight);
    this.started = false;

    this.worker = new Worker();
    this.worker.onmessage = (e) => {
        if (e.data.name === "pixUpdate") {
            ({pixData, particles} = e.data.details);
            this.draw2d.update(pixData);
            this.draw();
            this.started = false;
        }
        if (e.data.name === "started") {
            this.started = true;
        }
    };

    this.setup();

    let setupDraw = () => {
        if (this.worker && !this.started) {
            this.worker.postMessage({name: "update"});
        }
        fps = this.getFramePerSeconds();
        window.requestAnimationFrame(setupDraw);
    };

    window.requestAnimationFrame(setupDraw);
}

Game.prototype.getFramePerSeconds = function () {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
    }
    times.push(now);
    return times.length;
};

Game.prototype.draw = function () {
    this.draw2d.doneDraw();
    this.context.fillStyle = "rgb(0,0,0)";
    this.draw2d.text("Objects: " + particles, 0, 24);
    this.draw2d.text("FPS: " + fps, 0, 12);
};

Game.prototype.setup = function () {
    this.worker.postMessage({
        name: "setup",
        details: {
            gameWidth: this.gameWidth,
            gameHeight: this.gameHeight,
            pixData: this.draw2d.getImageData()
        }
    });
};
