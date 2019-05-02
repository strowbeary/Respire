export function canvas_arrow(context, fromx, fromy, dx, dy) {
    const head_length = 10;   // length of head in pixels
    const tox = fromx + dx;
    const toy = fromy + dy;
    const angle = Math.atan2(toy - fromy, tox - fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - head_length * Math.cos(angle - Math.PI / 4), toy - head_length * Math.sin(angle - Math.PI / 4));
    context.moveTo(tox, toy);
    context.lineTo(tox - head_length * Math.cos(angle + Math.PI / 4), toy - head_length * Math.sin(angle + Math.PI / 4));
}

export function angle_vector(vec1, vec2) {
    const vec1_magnitude = Math.sqrt(Math.pow(vec1[0], 2) + Math.pow(vec1[2], 2));
    const vec2_magnitude = Math.sqrt(Math.pow(vec2[0], 2) + Math.pow(vec2[2], 2));
    const vec3_magnitude = vec1[0] * vec2[0] + vec1[2] * vec2[2];
    const dot_product = vec3_magnitude / vec1_magnitude * vec2_magnitude;
    return -Math.acos(dot_product) * Math.sign(vec2[2]);
}

export function append_buffer(buffer1, buffer2) {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
}

export function read_raw_stream(stream, onDataCB) {
    return new Promise(async function (resolve) {
        let is_done = false;
        let header = null;
        let order = 0;
        while (!is_done) {
            const {value, done} = await stream.read();
            if (!done) {
                if (header === null) {
                    header = value.buffer.slice(0, 44);
                    value.buffer.order = order;
                    await onDataCB(value.buffer);
                    resolve();
                } else {
                    const buffer = append_buffer(header, value.buffer);
                    buffer.order = order;
                    onDataCB(buffer);
                }
                order++;
            }
            is_done = done;

        }
    })
}

export function* claim_chunk(tableau){
    let nextIndex = 0;

    while(nextIndex < tableau.length){
        yield tableau[nextIndex++];
    }
}
