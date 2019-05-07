import {setup, update} from "./sandbox";

self.addEventListener("message", (e) => {
    if (e.data.name === "setup") {
        setup(e.data.details);
    }
    if (e.data.name === "update") {
        update();
    }
});

