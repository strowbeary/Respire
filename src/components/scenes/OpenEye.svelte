<script>
    import Canvas from "components/Canvas.svelte";
    import AppWrapper from "components/AppWrapper.svelte";
    import backgroundImg from "assets/images/background.jpg";
    import {EasingFunctions} from "lib/easing";
    import * as PIXI from "pixi.js";

    export let canvasProps;

    const appProperties = {
       transparent: true,
       antialias: true
    };

    let Graphics = PIXI.Graphics,
        loader = PIXI.loader,
        resources = PIXI.loader.resources,
        Sprite = PIXI.Sprite,
        filters = PIXI.filters;

    let graphics = new Graphics();
    let app, background, canvasWidth, canvasHeight;
    let increment = 0;
    let height = 0;
    let scale = 1;

    function init(data) {
        app = data.detail.app;
        canvasWidth = data.detail.canvasWidth;
        canvasHeight = data.detail.canvasHeight;
        app.stage.addChild(graphics);

        if (!resources[backgroundImg]) {
            loader
                .add(backgroundImg)
                .load(setup);
        } else {
            setup();
        }

    }

    function setup() {
        background = new Sprite(resources[backgroundImg].texture);
        app.stage.addChild(background);
        background.position.set(-background.width/2, 0);

        graphics.beginFill(0x000000);
        graphics.moveTo(0, 0);
        graphics.bezierCurveTo(50, -100, canvasWidth - 50, -100, canvasWidth, 0);
        graphics.moveTo(0, 0);
        graphics.bezierCurveTo(50, 100, canvasWidth - 50, 100, canvasWidth, 0);
        graphics.position.set(0, canvasHeight/2);
        graphics.endFill();

        app.stage.addChild(graphics);

        background.mask = graphics;
        background.filters = [new filters.BlurFilter()];

        app.ticker.add(delta => gameLoop(delta));
    }

    function gameLoop(delta) {
        if (height < 2 || scale < 8.5) {
            if (increment <= 1) {
                height = EasingFunctions.bounceOut(increment) * 2;
                scale = EasingFunctions.bounceOut(increment) * 8.5;
            }
            increment += 0.005;
            graphics.clear();
            graphics.beginFill(0x000000);
            graphics.moveTo(0, 0);
            graphics.bezierCurveTo(50, -100 * height, canvasWidth - 50, -100 * height, canvasWidth, 0);
            graphics.moveTo(0, 0);
            graphics.bezierCurveTo(50, 100 * height, canvasWidth - 50, 100 * height, canvasWidth, 0);
            graphics.position.set(canvasWidth/2, canvasHeight/2);
            graphics.pivot.set(canvasWidth/2, height/2);
            graphics.scale.set(scale);
            graphics.endFill();

            background.filters = [new filters.BlurFilter(EasingFunctions.bounceOut(1 - increment) * 16, 4)];
        } else if (background.filters.length > 0) {
            background.filters = [];
        }
    }
</script>

<AppWrapper>
    <span slot="scene" let:canvasSize={canvasSize}>
        {#if canvasSize.canvasWidth}
            <Canvas {appProperties} {canvasSize} on:pixiApp="{init}"></Canvas>
        {/if}
    </span>
</AppWrapper>
