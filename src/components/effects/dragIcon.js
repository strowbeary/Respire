import * as PIXI from "pixi.js";
import {Animate, Easing, Keyframes} from "lib/TimingKit";

let Graphics = PIXI.Graphics;

function createIconAnim(from_value, to_value) {
    return Animate(from_value, to_value, Easing.easeInCubic, 0.1);
}

function createSlideAnim(from_value, to_value) {
    return Animate(from_value, to_value, Easing.easeOutCubic, 0.01);
}

export function DragIcon(container, isVertical, color = 0xFFFFFF) {
    const interactiveIcon = new Graphics();
    const lineWidth = 100;
    let alpha = 0;
    let iconAnim;
    let finalPosition = 0;
    let slideAnim = createSlideAnim(0, 1);
    let vertical = isVertical;
    let lineColor = color;
    slideAnim.start();
    interactiveIcon.lineStyle(1, lineColor, 1);
    interactiveIcon.drawCircle(0, 0, 35);
    interactiveIcon.alpha = alpha;

    container.addChild(interactiveIcon);

    function draw(newPos) {
        interactiveIcon.clear();
        interactiveIcon.lineStyle(1, lineColor, 1);
        if (!vertical) {
            interactiveIcon.drawCircle(newPos, 0, 35);
        } else {
            interactiveIcon.drawCircle(0, -newPos, 35);
        }
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
            if (slideAnim && slideAnim.is_running && interactiveIcon.alpha > 0) {
                const p = slideAnim.tick();
                draw(finalPosition * p);
            } else {
                slideAnim = createSlideAnim(0, 1);
                slideAnim.start()
            }
        }
    }
}
