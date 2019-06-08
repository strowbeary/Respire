import {writable} from 'svelte/store';

function createCount(number) {
    const {subscribe, update} = writable(number);

    return {
        subscribe,
        increment: () => update(n => n + 1)
    };
}

function createBoolean() {
    const {subscribe, set} = writable(false);

    return {
        subscribe,
        setToTrue: () => set(true),
        setToFalse: () => set(false)
    };
}


export const scene_index = createCount(0);
export const carton_index = createCount(-1);
export const carton_ready = createBoolean();
export const carton_visible = createBoolean();