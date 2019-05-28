import {Vector3} from "lib/SoundKit";
import {Animate, Easing, Sequence} from "lib/TimingKit";

export let idea_number = 0;

export const LEFT = 1;
export right

export function Idea(constants, options) {
    const {
        canvasWidth,
        canvasHeight,
        spriteWidth,
        spriteHeight
    } = constants;

    const final_position = Vector3(Math.round(Math.random() * canvasWidth), Math.round(Math.random() * canvasHeight), 0);
    const values = {
        apparition_side: 1,
        position: Vector3(-spriteWidth / 2, final_position.y, 0),
        ejection_direction: Vector3(Math.random(), Math.random(), 0),
        allowed_division: 1,
        successful_division: 0,
        dismissed: false,
        opacity: 0,
        ...options
    };

        /*
        values.position
        .add(values.ejection_direction.multiply_scalar(Math.random() * spriteWidth + spriteWidth / 2))
        .limit(0, canvasWidth, 0, canvasHeight, 0, 0);
        */

    const x_position_animation = Animate(
        values.position.x,
        final_position.x,
        Easing.linear,
        0.03
    );
    const y_position_animation = Animate(
        values.position.y,
        end_position.y,
        Easing.linear,
        0.03
    );

    const opacity_animation = Animate(
        values.opacity,
        1,
        Easing.linear,
        0.03
    );

    function divide() {
        if(values.successful_division < values.allowed_division) {
            values.successful_division++;
            return Idea(options, {
                position: values.position,
                opacity: 1
            });
        }
    }

    function appear() {

    }

    function tick() {
        values.opacity = opacity_animation.tick();
        values.position = Vector3(x_position_animation.tick(), y_position_animation.tick(), 0);
    }

    Sequence()
        .add(Math.random() * 800, () => {
            appear();
        })
        .start();

    return {
        divide,
        values
    }
}
