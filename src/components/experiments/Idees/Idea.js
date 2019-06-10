import {Vector3} from "lib/SoundKit";
import {Animate, Easing, Sequence} from "lib/TimingKit";

let idea_number = 0;
const MAX_IDEA = 30;

function create_position_animation (from, to) {
    return {
        x: Animate(
            from.x,
            to.x,
            Easing.easeInOutQuad,
            0.01
        ),
        y: Animate(
            from.y,
            to.y,
            Easing.easeInOutQuad,
            0.01
        )
    };
}

export function Idea ({canvasWidth, canvasHeight}, parent) {

    idea_number++;

    const values = {
        ejection_direction: null,
        position: null,
        ejection_strength: null,
        allowed_self_division: 2,
        self_division: 0,
        descendants_number: 0,
        dismissed: false,
        opacity: 1,
        line_event_bus: null,
        spriteWidth: null,
        spriteHeight: null,
        display_offset: Vector3(0, 0, 0),
        ...parent
    };

    values.line_event_bus.addEventListener("divide", () => {
        values.descendants_number++;
    });

    values.line_event_bus.addEventListener("death", () => {
        values.descendants_number--;
    });

    const get_new_final_position = () => values.position
        .add(values.ejection_direction.multiply_scalar(values.ejection_strength));

    let final_position = get_new_final_position();

    let position_animation = create_position_animation(
        values.position,
        final_position.limit(0, canvasWidth, 0, canvasHeight, 0, 0)
    );

    position_animation.x.start();
    position_animation.y.start();

    let opacity_animation = Animate(
        values.opacity,
        1,
        Easing.linear,
        0.03
    );

    function create_child () {
        if ((values.self_division < values.allowed_self_division || values.descendants_number === 0) && !values.dismissed) {
            values.ejection_direction = Vector3(0, 1, 0).rotateXY(Math.random() * Math.PI * 2);
            final_position = get_new_final_position();
            values.self_division++;

            const new_child = Idea({canvasWidth, canvasHeight}, {
                position: values.position,
                ejection_direction: values.ejection_direction.multiply_scalar(-1),
                ejection_strength: values.ejection_strength + (Math.random() * 200 - 100),
                line_event_bus: values.line_event_bus
            });

            values.line_event_bus.dispatchEvent(new CustomEvent("divide", {
                detail: {
                    new_child
                }
            }));
        }
    }
    const reproduction_seq = Sequence();
    for(let i = values.allowed_self_division; i > 0; i--) {
        reproduction_seq.add(4000 + Math.random() * 4000, () => (idea_number < MAX_IDEA) && create_child())
    }
    function trigger_whisper() {
        setTimeout(() => {
            if(idea_number === MAX_IDEA) {
                values.line_event_bus.dispatchEvent(new CustomEvent("whisper", {
                    detail: values
                }));
            }
            trigger_whisper();
        }, 4000 + Math.random() * 6000)
    }

    reproduction_seq.add(0, trigger_whisper);
    reproduction_seq.start();

    function tick (container, sprite) {
        values.opacity = opacity_animation.tick();
        if(opacity_animation.is_ended_signal) {
            values.line_event_bus.dispatchEvent(new CustomEvent("death"));
            container.removeChild(sprite);
        }
        values.position = Vector3(position_animation.x.tick(), position_animation.y.tick(), 0).add(values.display_offset);
    }

    function kill() {
        opacity_animation = Animate(
            1,
            0,
            Easing.linear,
            0.03
        );
        opacity_animation.start();
        values.dismissed = true;
    }

    function set_display_offset(v) {
        values.display_offset = v;
    }


    return {
        tick,
        kill,
        values,
        set_display_offset,
        get final_position() {
            return final_position.limit(0, canvasWidth, 0, canvasHeight, 0, 0)
        }
    }
}
