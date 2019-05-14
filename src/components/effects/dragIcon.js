import * as PIXI from "pixi.js";
import {Animate, Easing, Keyframes} from "lib/TimingKit";

let Graphics = PIXI.Graphics;

function createIconAnim(from_value, to_value) {
    return Animate(from_value, to_value, Easing.easeInCubic, 0.05);
}

function createSlideAnim(from_value, to_value) {
    return Animate(from_value, to_value, Easing.easeOutCubic, 0.01);
}

export function DragIcon(app) {
    const interactiveIcon = new Graphics();
    const lineWidth = 100;
    let alpha = 0;
    let iconAnim;
    let finalPosition = 0;
    let slideAnim = createSlideAnim(0, 1);
    slideAnim.start();
    interactiveIcon.lineStyle(2, 0xFFFFFF, 1);
    interactiveIcon.drawCircle(0, 0, 20);
    interactiveIcon.alpha = alpha;

    app.stage.addChild(interactiveIcon);

    function draw(newPos) {
        interactiveIcon.clear();
        interactiveIcon.lineStyle(2, 0xFFFFFF, 1);
        interactiveIcon.drawCircle(newPos, 0, 20);
    }

    return {
        startIconAnim() {
            iconAnim.start();
        },
        initIconAnim(from_value, to_value) {
            iconAnim = createIconAnim(from_value, to_value)
        },
        setPosition(x, y) {
            interactiveIcon.position.set(x, y);
        },
        setDirection(direction) {
            finalPosition = direction * lineWidth;
        },
        loop () {
            if (iconAnim && iconAnim.is_running) {
                interactiveIcon.alpha = iconAnim.tick();
            }
            if (slideAnim && slideAnim.is_running) {
                draw(finalPosition * slideAnim.tick());
            } else {
                slideAnim = createSlideAnim(0, 1);
                slideAnim.start()
            }
        }
    }
}
