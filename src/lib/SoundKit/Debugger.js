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
let debugger_number = 0;
export function sk_debugger(audio_context, listener, children, scene_volume) {
    const sk_id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    const debbuger_index = debugger_number.valueOf();
    document.body.appendChild(html`
        <style>
            ${() => {
                return `
                #${'sk_helper_' + sk_id}.sk_helper {
                border: 2px solid #333;
                border-radius: 8px;
                position: fixed;
                top: 16px;
                right: ${16 + 316 * debbuger_index}px;
                overflow: hidden;
                width: 300px;
                display: flex;
                flex-direction: column;
                background: black;
                transform: scale(0.5);
                transform-origin: top right;
                transition: transform 250ms, border 250ms;
            }
            #${'sk_helper_' + sk_id}.sk_helper:hover {
                transform: scale(1);
                border: 1px solid #333;
            }
            .sk_helper .inspector {
                border-top: 1px solid #333;
            }
            .sk_helper .scene_controls {
                padding: 8px;
                background: black;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
            }
            .sk_helper .scene_controls button {
                border: none;
                color: white;
                font-size: 10pt;
                border-radius: 4px;
                background: transparent;
                padding: 6px 12px;
            }
            .sk_helper .scene_controls button:hover {
                background: rgba(255, 255, 255, 0.3);
            }
                `;
    }}
        </style>
        <div id="${'sk_helper_' + sk_id}" class="sk_helper">
            <div class="scene_controls">
                <button onclick="${() => audio_context.resume()}">Play</button>
                <button onclick="${() => audio_context.suspend()}">Pause</button>
            </div>
            <canvas id="${'sk_canvas_' + sk_id}" width="300" height="300"></canvas>
            <div class="inspector"></div>
        </div>
    `);





    debugger_number++;
    const canvas = document.getElementById("sk_canvas_" + sk_id);
    const ctx = canvas.getContext("2d");


    let raf = null;
    const gui = new dat.GUI();
    gui.show();
    gui.domElement.style.margin = 0;
    document
        .getElementById('sk_helper_' + sk_id)
        .children[2]
        .appendChild(gui.domElement);
    gui.width = 301;
    const inspector = gui.addFolder("Inspector");
    const scene_folder = inspector.addFolder("Scene");
    const volume = scene_folder.add(scene_volume.options, 'volume', 0, 1, 0.01);
    volume.onChange(v => {
        scene_volume.set_volume(v);
    });
    coord_controller(scene_folder, listener.position)
        .onChange((v) => {
            listener.set_position(v);
        });
    const children_folder = inspector.addFolder("Children");
    children.forEach(c => {
        const child_folder = children_folder.addFolder(`${c.name} ${c.options.spacialized ? '(Spacialized)' : ''}`);
        const volume = child_folder.add(c.options, 'volume', 0, 1, 0.01).listen();
        volume.onChange(v => {
            c.set_volume(v);
        });

        const loop = child_folder.add({loop: c.options.loop}, 'loop');
        loop.onChange(loop => {
            c.set_loop(loop);
        });
        if (c.options.spacialized) {
            if(c.options.oriented) {
                const orientation = child_folder.add({orientation: 0}, 'orientation', -Math.PI, Math.PI, 0.01);
                orientation.onChange(angle => {
                    const new_orientation = Vector3(0, 0, -1).rotate(angle);
                    c.set_orientation(new_orientation);
                });
            }

            coord_controller(child_folder, c.options.position)
                .onChange((v) => {
                    c.set_position(v);
                });
        }
    });

    gui.open();
    (function loop(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let non_spacialized_debbuger_id = 0;
        children.forEach(c => {
            sound_debugger(ctx, canvas, c.options, c.name, non_spacialized_debbuger_id);
            if(!c.options.spacialized){
                non_spacialized_debbuger_id++;
            }
        });

        scene_debugger(ctx, canvas, listener);

        raf = requestAnimationFrame(loop.bind({}, t + 1));
    })(0);
    return {
        destroy_debugger() {
            cancelAnimationFrame(raf);
            document.getElementById('sk_helper_' + sk_id).remove();
        }
    }

}
