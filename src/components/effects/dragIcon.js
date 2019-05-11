import * as PIXI from "pixi.js";
import {Animate, Easing} from "lib/TimingKit";

let Graphics = PIXI.Graphics;
const lineWidth = 100;
let newPos;

export function DragIcon() {
    this.alpha = 0;
}

DragIcon.prototype.initIconAnim = function(from_value, to_value) {
    this.iconAnim = this.createIconAnim(from_value, to_value);
};

DragIcon.prototype.startIconAnim = function() {
    this.iconAnim.start();
};

DragIcon.prototype.createIconAnim = function(from_value, to_value) {
    return Animate(from_value, to_value, Easing.easeInCubic, 0.01);
};

DragIcon.prototype.initSlideAnim = function(from_value, to_value) {
    this.slideAnim = this.createIconAnim(from_value, to_value);
};

DragIcon.prototype.startSlideAnim = function() {
    this.slideAnim.start();
};

DragIcon.prototype.setPosition = function(x, y) {
    this.interactiveIcon.position.set(x, y);
};

DragIcon.prototype.setDirection = function(direction) {
    this.finalPosition = direction * lineWidth;
};

DragIcon.prototype.setup = function(app) {
    this.interactiveIcon = new Graphics();

    this.interactiveIcon.lineStyle(2, 0xFFFFFF, 1);
    this.interactiveIcon.drawCircle(0, 0, 15);
    this.interactiveIcon.alpha = this.alpha;

    app.stage.addChild(this.interactiveIcon);
};

DragIcon.prototype.draw = function(newPos) {
    this.interactiveIcon.clear();
    this.interactiveIcon.lineStyle(2, 0xFFFFFF, 1);
    this.interactiveIcon.drawCircle(newPos, 0, 15);
    if (this.finalPosition > 0) {
        if (newPos > 15) {
            this.interactiveIcon.moveTo(0, 0);
            this.interactiveIcon.lineTo(newPos - 15, 0);
        }
        if (newPos + 15 < this.finalPosition) {
            this.interactiveIcon.moveTo(newPos + 15, 0);
            this.interactiveIcon.lineTo(this.finalPosition, 0);
        }
    } else if (this.finalPosition < 0) {
        if (newPos < -15) {
            this.interactiveIcon.moveTo(0, 0);
            this.interactiveIcon.lineTo(newPos + 15, 0);
        }
        if (newPos - 15 > this.finalPosition) {
            this.interactiveIcon.moveTo(newPos - 15, 0);
            this.interactiveIcon.lineTo(this.finalPosition, 0);
        }
    }
};

DragIcon.prototype.loop = function() {
    if (this.iconAnim && this.iconAnim.is_running) {
        this.interactiveIcon.alpha = this.iconAnim.tick();
    }
    if (this.slideAnim && this.slideAnim.is_running) {
        newPos = this.finalPosition * this.slideAnim.tick();
        this.draw(newPos);
    } else {
        this.initSlideAnim(0, 1);
        this.startSlideAnim();
    }
};
