<script>
import {createEventDispatcher} from "svelte";
import { afterUpdate } from 'svelte';
import * as PIXI from "pixi.js";

const dispatch = createEventDispatcher();
export let appProperties = {
    transparent: true,
    antialias: true,
    legacy: true
};
export let canvasSize;

let {currentWidth, canvasWidth, currentHeight, canvasHeight} = canvasSize;

let Application = PIXI.Application;
let app;
let canvas;

//in order to get canvasWidth and canvasHeight
afterUpdate(() => {
   if (!app) {
     let properties = {...appProperties, width: canvasWidth, height: canvasHeight, view: canvas};
     app = new Application(properties);
     dispatch('pixiApp', {app, canvasWidth, canvasHeight});
   }
});

$: {
    let {currentWidth, canvasWidth, currentHeight, canvasHeight} = canvasSize;
    if (app) {
        let ratio = Math.min(currentWidth / canvasWidth, currentHeight / canvasHeight);
        app.stage.scale.set(ratio);
        app.renderer.resize(canvasWidth * ratio, canvasHeight * ratio);
    }
}
</script>

<canvas style="z-index: 1000;" bind:this="{canvas}"></canvas>
