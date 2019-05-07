function Sequence() {
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

let start_time = Date.now();
Sequence()
    .add(100, () => console.log(start_time-Date.now()))
    .add(1000, () => console.log(start_time-Date.now()))
    .add(500, () => console.log(start_time-Date.now()))
    .add(0, () => console.log(start_time-Date.now()))
    .add(0, () => console.log(start_time-Date.now()))
    .add(100, () => console.log(start_time-Date.now()))
    .start();
