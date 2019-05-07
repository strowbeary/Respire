<script>
    import Canvas from "components/Canvas.svelte";
    import AppWrapper from "components/AppWrapper.svelte";
    import {smokeImg, createFog, moveFog} from "components/effects/fog";
    import * as PIXI from "pixi.js";

    export let canvasProps;

    const appProperties = {
       transparent: true,
       antialias: true
    };

    let loader = PIXI.loader,
        resources = PIXI.loader.resources;

    let app, canvasWidth, canvasHeight;

    function init(data) {
        app = data.detail.app;
        canvasWidth = data.detail.canvasWidth;
        canvasHeight = data.detail.canvasHeight;

        if (!resources[smokeImg]) {
            loader
                .add(smokeImg)
                .load(setup)
        } else {
            setup()
        }

    }

    function setup() {
        createFog(resources[smokeImg].texture, canvasWidth, canvasHeight, app);
        app.ticker.add(delta => gameLoop(delta));
    }

    function gameLoop(delta) {
        moveFog(canvasWidth, canvasHeight);
    }
</script>

<AppWrapper>
    <span slot="canvas" let:canvasSize={canvasSize}>
        {#if canvasSize.canvasWidth}
            <Canvas {appProperties} {canvasSize} on:pixiApp="{init}"></Canvas>
        {/if}
    </span>
</AppWrapper>
