export function Vector3(x, y, z) {

    function clone() {
        return Vector3(x, y, z);
    }

    function add(v) {
        return Vector3(x + v.x, y, z + v.z);
    }

    function sub(v) {
        return Vector3(x - v.x, y, z - v.z);
    }

    function invert() {
        return Vector3(-x, y, -z);
    }

    function multiply_scalar(s) {
        return Vector3(x * s, y, z * s);
    }

    function divide_scalar(s) {
        if(s === 0) {
            throw Error("Can't divide by zero");
        }
        return Vector3(x / s, y, z / s);
    }

    function dot(v) {
        return x * v.x + z * v.z;
    }

    function norm() {
        return Math.sqrt(x * x + z * z);
    }
    function length_sq() {
        return x * x + z * z;
    }
    function normalize() {
        return divide_scalar(norm())
    }
    function distance_to_sq(v) {
        const dx = x - v.x;
        const dz = z - v.z;
        return dx * dx + dz * dz;
    }
    function distance_to(v) {
        return Math.sqrt(distance_to_sq(v));
    }

    function lerp(v, alpha) {
        return Vector3(x + ((v.x - this.x) * alpha), z + ((v.z - this.z) * alpha))
    }
    function to_rad() {
        return Math.atan2(x, z);
    }
    function to_deg() {
        return to_rad() * 180 / Math.PI;
    }
    function is_equal_to(v) {
        return x === v.x && y === v.y && z === v.z;
    }
    function rotate(theta) {
        return Vector3(
            x * Math.cos(theta) - z * Math.sin(theta),
            y,
            x * Math.sin(theta) + z * Math.cos(theta)
        )
    }
    function to_array() {
        return [x, y, z];
    }
    function limit(x_min, x_max, y_min, y_max, z_min, z_max) {
        return Vector3(
            Math.max(x_min, Math.min(x , x_max)),
            Math.max(y_min, Math.min(y , y_max)),
            Math.max(z_min, Math.min(z , z_max)),
        )
    }
    return {
        clone,
        add,
        sub,
        invert,
        multiply_scalar,
        divide_scalar,
        dot,
        norm,
        length_sq,
        normalize,
        distance_to,
        distance_to_sq,
        lerp,
        to_rad,
        to_deg,
        is_equal_to,
        rotate,
        to_array,
        limit,
        get x() {
            return x;
        },
        get y() {
            return y;
        },
        get z() {
            return z;
        },
    }
}
