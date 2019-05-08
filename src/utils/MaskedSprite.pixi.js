export class MaskedSprite extends PIXI.Sprite {
    constructor(texture, app, name) {
        super(texture);
        this.pixels = app.renderer.extract.pixels(this);
        this.name = name;
    }

    containsPoint(point) {

        point.set(point.x - (this.x - this.width * this.anchor.x), point.y - (this.y - this.height * this.anchor.y));
        point.set(
            Math.min(Math.max(-1, Math.round(point.x * 1 / this.scale.x)), this._texture.orig.width + 1),
            Math.min(Math.max(-1, Math.round(point.y * 1 / this.scale.y)), this._texture.orig.height + 1)
        );
        if (point.x >= 0 && point.y >= 0 && point.x <= this._texture.orig.width && point.y <= this._texture.orig.height) {
            return this.get_pixel_alpha(point.x, point.y) > 0;
        }
        return false
    }

    get_pixel_alpha(x, y) {
        const index = x * 4 + y * 4 * this._texture.orig.width;
        return this.pixels[index + 3]
    }
}
