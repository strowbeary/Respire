import {html} from "lighterhtml";
import * as dat from "dat.gui";
import {sound_debugger} from "./Sound";
import {scene_debugger} from "./Scene";
import {Vector3} from "./Vector3";

function coord_controller(folder, v) {

    let callback = () => {
    };
    const vector = {
        x: v.x,
        y: v.y,
        z: v.z
    };
    folder
        .add(vector, 'x', -1, 1, 0.01)
        .onChange(() => {
            callback(Vector3(vector.x, vector.y, vector.z))
        });

    folder
        .add(vector, 'y', -1, 1, 0.01)
        .onChange(() => {
            callback(Vector3(vector.x, vector.y, vector.z))
        });
    folder
        .add(vector, 'z', -1, 1, 0.01)
        .onChange(() => {
            callback(Vector3(vector.x, vector.y, vector.z))
        });

    return {
        onChange(fn) {
            callback = fn;
        }
    }
}

export function sk_debugger(audio_context, listener, children) {
    const sk_id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    document.body.appendChild(html`
        <div id="${'sk_helper_' + sk_id}" class="sk_helper">
            <canvas id="${'sk_canvas_' + sk_id}" width="300" height="300"></canvas>
        </div>
    `);

    const canvas = document.getElementById("sk_canvas_" + sk_id);
    const ctx = canvas.getContext("2d");


    let raf = null;
    const gui = new dat.GUI();
    gui.show();
    gui.domElement.style.margin = 0;
    document
        .getElementById('sk_helper_' + sk_id)
        .appendChild(gui.domElement);
    const scene_folder = gui.addFolder("Scene");
    coord_controller(scene_folder, listener.position)
        .onChange((v) => {
            listener.set_position(v);
        });
    const children_folder = gui.addFolder("Children");
    children.forEach(c => {
        const child_folder = children_folder.addFolder(`${c.name} ${c.options.spacialized ? '(Spacialized)' : ''}`);
        const volume = child_folder.add(c.options, 'volume', 0, 1, 0.01);
        volume.onChange(v => {
            c.set_volume(v);
        });

        const loop = child_folder.add({loop: c.options.loop}, 'loop');
        loop.onChange(loop => {
            c.set_loop(loop);
        });
        if (c.options.spacialized) {
            const orientation = child_folder.add({orientation: 0}, 'orientation', -Math.PI, Math.PI, 0.01);
            orientation.onChange(angle => {
                const new_orientation = Vector3(0, 0, -1).rotate(angle);
                c.set_orientation(new_orientation);
            });
            coord_controller(child_folder, c.options.position)
                .onChange((v) => {
                    c.set_position(v);
                });
        }
    });

    (function loop(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        children.forEach(c => {
            sound_debugger(ctx, canvas, c.options, c.name);
        });

        scene_debugger(ctx, canvas, listener);

        raf = requestAnimationFrame(loop.bind({}, t + 1));
    })(0);
    return {
        destroy() {
            cancelAnimationFrame(raf);
        }
    }
}
