<script>
    import Canvas from "components/Canvas.svelte";
    import AppWrapper from "components/AppWrapper.svelte";
    import backgroundImg from "assets/images/pilule/Cours.jpg";
    import {Animate, Easing} from "lib/TimingKit";
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
    let scaleAnim, heightAnim, blurAnim;

    function init(data) {
        app = data.detail.app;
        canvasWidth = data.detail.canvasWidth;
        canvasHeight = data.detail.canvasHeight;

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
        background.scale.set(canvasWidth/background.width);
        app.stage.addChild(background);
        app.stage.addChild(graphics);

        initCloseEye();

        app.ticker.add(delta => gameLoop(delta));
    }

    function initOpenEye() {
        graphics.beginFill(0x000000);
        graphics.moveTo(0, 0);
        graphics.bezierCurveTo(50, -100, canvasWidth - 50, -100, canvasWidth, 0);
        graphics.moveTo(0, 0);
        graphics.bezierCurveTo(50, 100, canvasWidth - 50, 100, canvasWidth, 0);
        graphics.position.set(canvasWidth/2, canvasHeight/2);
        graphics.endFill();
        background.mask = graphics;
        background.filters = [new filters.BlurFilter()];

        scaleAnim = Animate(1, 8.5, Easing.bounceOut, 0.005);
        heightAnim = Animate(0, 2, Easing.bounceOut, 0.005);
        blurAnim = Animate(4, 0, Easing.bounceOut, 0.005);
        scaleAnim.start();
        heightAnim.start();
        blurAnim.start();
    }

    function initCloseEye() {
        graphics.beginFill(0x000000);
        graphics.moveTo(0, 0);
        graphics.bezierCurveTo(50, -100 * 2, canvasWidth - 50, -100 * 2, canvasWidth, 0);
        graphics.moveTo(0, 0);
        graphics.bezierCurveTo(50, 100 * 2, canvasWidth - 50, 100 * 2, canvasWidth, 0);
        graphics.position.set(canvasWidth/2, canvasHeight/2);
        graphics.pivot.set(canvasWidth/2, height/2);
        graphics.scale.set(4);
        graphics.endFill();
        background.mask = graphics;
        background.filters = [new filters.BlurFilter(4, 4)];

        scaleAnim = Animate(6, 1, Easing.bounceOut, 0.0025);
        heightAnim = Animate(1.5, 0, Easing.bounceOut, 0.0025);
        blurAnim = Animate(0, 4, Easing.bounceOut, 0.0025);
        scaleAnim.start();
        heightAnim.start();
        blurAnim.start();
    }

    function gameLoop(delta) {

        if (scaleAnim.is_running || heightAnim.is_running) {
            height = heightAnim.tick();
            scale = scaleAnim.tick();
            console.log(height, scale);
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
        }

        if (blurAnim.is_running) {
            background.filters = [new filters.BlurFilter(blurAnim.tick(), 4)];
        }
        if (blurAnim.is_ended_signal) {
            //background.filters = [];
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
