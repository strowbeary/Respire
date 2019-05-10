import * as PIXI from "pixi.js";
import icon from "assets/images/logo-gobelins.png";
import {Animate, Easing} from "lib/TimingKit";

let loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;

export function DragIcon() {
    if (!resources[icon]) {
        loader.add(icon)
    }
    this.alpha = 0;
}

DragIcon.prototype.initIconAnim = function(from_value, to_value) {
    this.iconAnim = this.createIconAnim(from_value, to_value);
};

DragIcon.prototype.startIconAnim = function() {
    this.iconAnim.start();
};

DragIcon.prototype.createIconAnim = function(from_value, to_value) {
    return Animate(from_value, to_value, Easing.easeInCubic, 0.1);
};

DragIcon.prototype.setPosition = function(x, y) {
    this.interactiveIcon.position.set(x, y);
};

DragIcon.prototype.setup = function(app) {
    this.interactiveIcon = new Sprite(resources[icon].texture);
    this.interactiveIcon.anchor.x = 0.5;
    this.interactiveIcon.anchor.y = 0.5;
    this.interactiveIcon.scale.set(0.5);
    this.interactiveIcon.alpha = this.alpha;
    app.stage.addChild(this.interactiveIcon);
};

DragIcon.prototype.loop = function() {
    if (this.iconAnim && this.iconAnim.is_running) {
        this.interactiveIcon.alpha = this.iconAnim.tick();
    }
};