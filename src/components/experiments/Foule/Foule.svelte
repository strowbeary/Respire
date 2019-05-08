<script>
    import Canvas from "components/Canvas.svelte";
    import AppWrapper from "components/AppWrapper.svelte";
    import peopleImg from "assets/images/silhouette.png";
    import * as PIXI from "pixi.js";

    function onDragStart(event) {
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        this.data = event.data;
        this.alpha = 0.5;
        this.dragging = true;
    }

    function onDragEnd() {
        this.alpha = 1;
        this.dragging = false;
        // set the interaction data to null
        this.data = null;
    }

    function onDragMove(event) {
        if (this.dragging) {
            this.x +=  event.data.originalEvent.movementX;
            this.y += event.data.originalEvent.movementY;
        }
    }
    import {MaskedSprite} from "../../../utils/MaskedSprite.pixi";





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

        if (!resources[peopleImg]) {
            loader
                .add(peopleImg)
                .load(setup);
        } else {
            setup()
        }
    }


    let scale;

    function setup() {
        graphics.beginFill(0xFFFFFF, 0.1);
        graphics.drawRect(0, 0, app.renderer.width, app.renderer.height);
        graphics.endFill();

        let {width} = resources[peopleImg].texture.baseTexture;
        scale = canvasWidth/width;

        people = new MaskedSprite(resources[peopleImg].texture, app);
        people.anchor.x = 0.5;
        people.alpha = 0.5;
        people.scale.set(scale + scale/2);
        people.position.set(0, 0);
        container.push(people);
        app.stage.addChild(people);

        people = new MaskedSprite(resources[peopleImg].texture, app);

        people.anchor.x = 0.5;
        people.anchor.y = 0.3;
        people.alpha = 0.5;
        people.scale.set(scale);
        people.position.set(canvasWidth, people.height/2);
        people.interactive = true;
        people.buttonMode = true;
        people.on('pointerdown', onDragStart)
              .on('pointerup', onDragEnd)
              .on('pointerupoutside', onDragEnd)
              .on('pointermove', onDragMove);



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
