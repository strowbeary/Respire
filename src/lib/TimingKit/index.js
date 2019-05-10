export function Sequence() {
    const sequence = [];

    function start() {
        let scheduled_time = 0;
        sequence.forEach(step => {
            scheduled_time += step.delay;
            setTimeout(step.cb, scheduled_time);
        });
    }

    function add(delay, cb) {
        sequence.push({delay, cb});
        return {
            add,
            start
        };
    }

    return {
        add
    }
}

export function Animate(from_value, to_value, easing_function, step) {
    let increment = 0;
    let is_running = false;
    let is_ended = false;
    return {
        get is_running() {
            return is_running
        },
        get is_ended_signal() {
            const old =  is_ended;
            is_ended = false;
            return old;
        },
        start() {
            is_running = true;
            is_ended = false;
            increment = 0;
        },
        tick() {
            if(is_running) {
                if(increment <= 1) {
                    const progress = easing_function(increment);
                    const new_value = (1 - progress) * from_value + progress * to_value;
                    increment += step;
                    return new_value;
                } else {
                    is_running = false;
                    is_ended = true;
                }
            }
            return to_value;
        }
    }
}


export const Easing = {
    // no easing, no acceleration
    linear: function (t) {
        return t
    },
    // accelerating from zero velocity
    easeInQuad: function (t) {
        return t * t
    },
    // decelerating to zero velocity
    easeOutQuad: function (t) {
        return t * (2 - t)
    },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) {
        return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    },
    // accelerating from zero velocity
    easeInCubic: function (t) {
        return t * t * t
    },
    // decelerating to zero velocity
    easeOutCubic: function (t) {
        return (--t) * t * t + 1
    },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) {
        return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    },
    // accelerating from zero velocity
    easeInQuart: function (t) {
        return t * t * t * t
    },
    // decelerating to zero velocity
    easeOutQuart: function (t) {
        return 1 - (--t) * t * t * t
    },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) {
        return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
    },
    // accelerating from zero velocity
    easeInQuint: function (t) {
        return t * t * t * t * t
    },
    // decelerating to zero velocity
    easeOutQuint: function (t) {
        return 1 + (--t) * t * t * t * t
    },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function (t) {
        return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
    },
    bounceOut(t) {
        return t * Math.abs(Math.sin(t * Math.PI * 2.5) + t)
    }
};
