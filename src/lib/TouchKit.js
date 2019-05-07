export function Swiper(custom_options) {
    const options = {
        el: window,
        ...custom_options
    };
    const event_bus = new EventTarget();

    let touch;
    let start;
    let is_move_enabled = false;
    let distance = 0;
    let direction = {horizontal: "left", vertical: "top"};

    function swipestart(e) {
        touch = e.type === "touchstart";
        start = touch? e.targetTouches[0] : e;
        is_move_enabled = true;

        event_bus.dispatchEvent(new CustomEvent("swipestart", {
            detail: event
        }));
    }

    function swipemove(e) {
        if (is_move_enabled) {
            touch = e.type === "touchmove";
            let t = touch? e.targetTouches[0] : e;

            let dx = t.clientX - start.clientX;
            let dy = t.clientY - start.clientY;

            distance = Math.sqrt(dx * dx + dy * dy);
            let event = {
                deltaX: dx,
                deltaY: dy
            };

            direction.horizontal = dx < 0? "left": "right";
            direction.vertical = dy < 0? "top": "bottom";

            event_bus.dispatchEvent(new CustomEvent("swipemove", {
                detail: event
            }));
        }
    }

    function swipeend(e) {
        if (is_move_enabled) {
            event_bus.dispatchEvent(new CustomEvent("swipeend", {
                detail: {direction, distance}
            }));
            distance = 0;
            is_move_enabled = false;
        }
    }

    options.el.addEventListener("touchstart", swipestart, {passive: true});
    options.el.addEventListener("touchmove", swipemove, {passive: true});
    window.addEventListener("touchend", swipeend, {passive: true});
    options.el.addEventListener("mousedown", swipestart);
    options.el.addEventListener("mousemove", swipemove, {passive: true});
    window.addEventListener("mouseup", swipeend);

    return {
        addEventListener(...params) {
            event_bus.addEventListener(...params);
        },
        removeEventListener(...params) {
            event_bus.removeEventListener(...params);
        }
    }
}