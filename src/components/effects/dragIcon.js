import * as PIXI from "pixi.js";
import icon from "assets/images/logo-gobelins.png";

let loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;

export function DragIcon() {
    if (!resources[icon]) {
        loader.add(icon)
    }
    this.alpha = 0;
}

DragIcon.prototype.setup = function(app) {
    this.interactiveIcon = new Sprite(resources[icon].texture);
    this.interactiveIcon.anchor.x = 0.5;
    this.interactiveIcon.anchor.y = 0.5;
    this.interactiveIcon.scale.set(0.5);
    this.interactiveIcon.alpha = this.alpha;
    app.stage.addChild(this.interactiveIcon);
};

DragIcon.prototype.loop = function() {
    if (this.alpha === 1 && this.interactiveIcon.alpha < 1) {
        this.interactiveIcon.alpha += 0.1;
        if (this.interactiveIcon.alpha + 0.1 >= this.alpha) {
            this.interactiveIcon.alpha = 1;
        }
    }
    if (this.interactiveIcon === 0 && this.interactiveIcon.alpha > 0) {
        this.interactiveIcon.alpha -= 0.1;
        if (this.interactiveIcon.alpha - 0.1 <= this.alpha) {
            this.interactiveIcon.alpha = 0;
        }
    }
};