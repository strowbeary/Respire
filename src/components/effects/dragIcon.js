import * as PIXI from "pixi.js";
import {Animate, Easing} from "lib/TimingKit";

let Graphics = PIXI.Graphics;

export function DragIcon() {
    this.alpha = 0;
    this.direction = 1;
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
    this.directionLine.position.set(x, y);
    this.interactiveIcon.position.set(x, y);
    this.startPosition = x;
    this.finalPosition = this.direction * 100;
};

DragIcon.prototype.setDirection = function(direction) {
    this.direction = direction;
    this.directionLine.clear();
    this.directionLine.lineStyle(2, 0xFFFFFF, 1);
    if (direction === -1) {
        this.directionLine.moveTo(-15, 0);
        this.directionLine.lineTo(-100, 0);
    } else if (direction === 1) {
        this.directionLine.moveTo(15, 0);
        this.directionLine.lineTo(100, 0);
    }
    this.directionLine.alpha = this.alpha;
};

DragIcon.prototype.setup = function(app) {
    this.interactiveIcon = new Graphics();
    this.directionLine = new Graphics();

    this.interactiveIcon.lineStyle(2, 0xFFFFFF, 1);
    this.interactiveIcon.drawCircle(0, 0, 15);
    this.interactiveIcon.alpha = this.alpha;

    app.stage.addChild(this.directionLine);
    app.stage.addChild(this.interactiveIcon);
};

DragIcon.prototype.loop = function() {
    if (this.iconAnim && this.iconAnim.is_running) {
        this.interactiveIcon.alpha = this.iconAnim.tick();
        this.directionLine.alpha = this.iconAnim.tick();
    }
    if (this.slideAnim && this.slideAnim.is_running) {
        this.interactiveIcon.position.set(this.finalPosition * this.slideAnim.tick() + this.startPosition, this.interactiveIcon.position.y);
    } else {
        this.initSlideAnim(0, 1);
        this.startSlideAnim();
    }
};