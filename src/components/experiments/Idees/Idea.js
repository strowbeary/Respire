import {Vector3} from "lib/SoundKit";
import {Animate, Easing, Sequence} from "lib/TimingKit";

export let idea_number = 0;

export const LEFT = -1;
export const RIGHT = 1;

const get_random_initial_options = side => ({
    side,
    position: Vector3(
        side < 0 ? -spriteWidth / 2 : canvasWidth + spriteWidth / 2,
        Math.round(Math.random() * canvasHeight),
        0
    ),
    ejection_direction: Vector3(-side, 0, 0),
    opacity: 1,
    ejection_strength: Math.random() * spriteWidth + spriteWidth / 2
});

function create_position_animation (from, to) {
    return {
        x: Animate(
            from.x,
            to.x,
            Easing.linear,
            0.03
        ),
        y: Animate(
            from.y,
            to.y,
            Easing.linear,
            0.03
        )
    };
}

export function Idea (constants, parent) {
    const {
        canvasWidth,
        canvasHeight,
        spriteWidth,
        spriteHeight
    } = constants;

    const values = {
        ejection_direction: null,
        position: null,
        ejection_strength: null,
        allowed_self_division: 1,
        self_division: 0,
        descendants_number: 0,
        dismissed: false,
        opacity: 0,
        ...parent
    };

    const get_new_final_position = () => values.position
        .add(values.ejection_direction.multiply_scalar(values.ejection_strength))
        .limit(0, canvasWidth, 0, canvasHeight, 0, 0);

    let final_position = get_new_final_position();

    let position_animation = create_position_animation(values.position, final_position);

    const opacity_animation = Animate(
        values.opacity,
        1,
        Easing.linear,
        0.03
    );
    opacity_animation.start();

    let division_hook = () => {};
    let death_hook = () => {};

    function on_division(hook) {
        division_hook = hook;
    }

    function on_death(hook) {
        death_hook = hook;
    }

    function create_child () {
        if (values.self_division < values.allowed_self_division || values.descendants_number === 0) {
            values.ejection_direction = Vector3(Math.random(), Math.random(), 0);
            final_position = get_new_final_position();
            position_animation = create_position_animation(values.position, final_position);

            values.self_division++;
            values.descendants_number++;
            division_hook();

            const new_child = Idea(options, {
                position: values.position,
                ejection_direction: values.ejection_direction.multiply_scalar(-1),
                ejection_strength: values.ejection_strength
            });
            new_child.on_division(() => {
                values.descendants_number++;
                division_hook();
            });
            new_child.on_death(() => {
                values.descendants_number--;
                death_hook();
            });

            return new_child;
        }
    }

    function tick () {
        values.opacity = opacity_animation.tick();
        values.position = Vector3(position_animation.x.tick(), position_animation.y.tick(), 0);
        if (position_animation.x.is_ended_signal) {
            values.ejection_direction = Vector3(Math.random(), Math.random(), 0);
        }
    }

    function kill() {
        death_hook();
    }


    return {
        on_division,
        on_death,
        tick,
        kill
    }
}
