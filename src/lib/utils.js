export function canvas_arrow(context, fromx, fromy, dx, dy) {
    const head_length = 10;   // length of head in pixels
    const tox = fromx + dx;
    const toy = fromy + dy;
    const angle = Math.atan2(toy - fromy, tox - fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - head_length * Math.cos(angle - Math.PI / 6), toy - head_length * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - head_length * Math.cos(angle + Math.PI / 6), toy - head_length * Math.sin(angle + Math.PI / 6));
}

export function angle_vector(vec1, vec2) {
    const vec1_magnitude = Math.sqrt(Math.pow(vec1[0], 2) + Math.pow(vec1[2], 2));
    const vec2_magnitude = Math.sqrt(Math.pow(vec2[0], 2) + Math.pow(vec2[2], 2));
    const vec3_magnitude = vec1[0] * vec2[0] + vec1[2] * vec2[2];
    const dot_product = vec3_magnitude / vec1_magnitude * vec2_magnitude;
    return -Math.acos(dot_product) * Math.sign(vec2[2]);
}

export function concat_typed_buffer( a, b ) {
    const c = new Int8Array(a.byteLength + b.byteLength);
    c.set(a, 0);
    c.set(b, a.byteLength);
    return c;
}
export async function read_raw_stream(stream, onDataCB) {
    let is_done = false;
    let header = null;
    let is_first_chunk = true;
    const buffer_pile = new Proxy([], {
        set(target, p, value) {
            if(p !== "length") {
                if(!is_first_chunk) {
                    onDataCB(concat_typed_buffer(header, value).buffer);
                } else {
                    onDataCB(value.buffer);
                }
            }


            target[p] = value;
            return true;
        }
    });

    while (!is_done) {
        const {value, done} = await stream.read();
        if (!done) {
            if (header === null) {
                header = value.slice(0, 44);
                is_first_chunk = false;
            }
                buffer_pile.push(value);
        }
        is_done = done;
    }
}
