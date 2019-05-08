export class MaskedSprite extends PIXI.Sprite {
    constructor(texture, app) {
        super(texture);
        this.pixels = app.renderer.extract.pixels(this);
    }

    containsPoint(point) {
        point.set(point.x - (this.x - this.width * this.anchor.x), point.y - (this.y - this.height * this.anchor.y));
        const alpha_pixel = this.point(
            Math.min(Math.max(0, Math.round(point.x * 1/this.scale.x)), this._texture.orig.width),
            Math.min(Math.max(0, Math.round(point.y  * 1/this.scale.y)), this._texture.orig.height)
        );
        return alpha_pixel > 20;
    }

    point(x, y) {
        const index = x * 4 + y * 4 * this._texture.orig.width;
        return this.pixels[index + 3]
    }
}
