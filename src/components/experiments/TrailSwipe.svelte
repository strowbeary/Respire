<script>
    import Canvas from "components/Canvas.svelte";
    import AppWrapper from "components/AppWrapper.svelte";
    import peopleImg from "assets/images/silhouette.png";
    import {Swiper} from "lib/TouchKit";
    import * as PIXI from "pixi.js";
    export let canvasProps;

    const appProperties = {
       transparent: true,
       clearBeforeRender: false,
       preserveDrawingBuffer: true,
       antialias: true
    };

    let Graphics = PIXI.Graphics,
        loader = PIXI.loader,
        resources = PIXI.loader.resources,
        Sprite = PIXI.Sprite;

    let graphics = new Graphics();
    let container = [];
    let initialPos = [];
    let initialScale = [];
    let app, people, canvasWidth;

    function init(data) {
        app = data.detail.app;
        canvasWidth = data.detail.canvasWidth;
        app.stage.addChild(graphics);
        initSwiper();

        if (!resources[peopleImg]) {
            loader
                .add(peopleImg)
                .load(setup);
        } else {
            setup()
        }
    }

    function initSwiper() {
            let swiper = Swiper({el: app.view});
            swiper.addEventListener("swipestart", () => {
                initialPos = container.map(people => people.x);
                initialScale = container.map(people => people.scale.x);
            });

            swiper.addEventListener("swipemove", (e) => {
               let {deltaX} = e.detail;
               let abs = Math.abs(deltaX);
               for (let i = 0; i < container.length; i++) {
                   container[i].scale.set(initialScale[i] + (abs/(100 + (i * 100))));
                   if (i%2 === 0) {
                       container[i].position.set(initialPos[i] - abs + (abs/(100 + (i * 100))), container[i].position.y);
                   } else {
                       container[i].position.set(initialPos[i] + abs - (abs/(100 + (i * 100))), container[i].position.y);
                   }
               }
            });

            swiper.addEventListener("swipeend", (e) => {
                let {direction, distance} = e.detail;

            });
        }

    let scale;

    function setup() {
        graphics.beginFill(0xFFFFFF, 0.1);
        graphics.drawRect(0, 0, app.renderer.width, app.renderer.height);
        graphics.endFill();

        let {width} = resources[peopleImg].texture.baseTexture;
        scale = canvasWidth/width;

        people = new Sprite(resources[peopleImg].texture);
        people.anchor.x = 0.5;
        people.alpha = 0.5;
        people.scale.set(scale + scale/2);
        people.position.set(0, 0);
        container.push(people);
        app.stage.addChild(people);

        people = new Sprite(resources[peopleImg].texture);
        people.anchor.x = 0.5;
        people.anchor.y = 0;
        people.alpha = 0.5;
        people.scale.set(scale);
        people.position.set(canvasWidth, 0);
        container.push(people);
        app.stage.addChild(people);

        app.ticker.add(delta => gameLoop(delta));
    }

    function gameLoop(delta) {

    }
</script>

<AppWrapper>
    <span slot="canvas" let:canvasSize={canvasSize}>
        {#if canvasSize.canvasWidth}
            <Canvas {appProperties} {canvasSize} on:pixiApp="{init}"></Canvas>
        {/if}
    </span>
</AppWrapper>
