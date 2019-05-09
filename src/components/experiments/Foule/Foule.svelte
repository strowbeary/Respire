<script>
    import Canvas from "components/Canvas.svelte";
    import AppWrapper from "components/AppWrapper.svelte";
    import peopleImg from "assets/images/silhouette.png";
    import * as PIXI from "pixi.js";



    import {MaskedSprite} from "../../../utils/MaskedSprite.pixi"; import {init_foule_sound_scene} from "components/experiments/Foule/Foule.sound";

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
    let app, people, canvasWidth, canvasHeight;

    function init(data) {
        app = data.detail.app;
        canvasWidth = data.detail.canvasWidth;
        canvasHeight = data.detail.canvasHeight;
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

    async function setup() {
        const {set_z_position} = await init_foule_sound_scene();
        graphics.beginFill(0xFFFFFF, 0.1);
        graphics.drawRect(0, 0, app.renderer.width, app.renderer.height);
        graphics.endFill();

        let {width} = resources[peopleImg].texture.baseTexture;
        scale = canvasWidth/width;

        people = new MaskedSprite(resources[peopleImg].texture, app, "prem");
        people.anchor.x = 0.5;
        people.scale.set(1);
        people.position.set(0, 0);
         people.interactive = true;
                people.buttonMode = true;
                people.on('pointerdown', function(event) {
                    this.data = event.data;
                    this.dragging = true;
                    container.forEach(child => child.zIndex = 1);
                    this.zIndex = 2;
                })
                .on('pointerup', function() {
                    this.dragging = false;
                    this.data = null;
                })
                .on('pointerupoutside', function(){
                    this.dragging = false;
                    this.data = null;
                })
                .on('pointermove', function(event){
                    if (this.dragging) {
                        this.x +=  event.data.originalEvent.movementX;
                        this.y += event.data.originalEvent.movementY;
                        set_z_position(Math.min(Math.max(0, (canvasHeight - this.y) / canvasHeight), 1));
                    }
                });

        container.push(people);
        app.stage.addChild(people);

        people = new MaskedSprite(resources[peopleImg].texture, app, "sec");

        people.anchor.x = 0.5;
        people.anchor.y = 0.3;
        people.scale.set(1);
        people.position.set(canvasWidth, people.height/2);
        people.interactive = true;
        people.buttonMode = true;
        people.on('pointerdown', function(event) {
            this.data = event.data;
            this.dragging = true;
            container.forEach(child => child.zIndex = 1);
            this.zIndex = 2;
        })
        .on('pointerup', function() {
            this.dragging = false;
            this.data = null;
        })
        .on('pointerupoutside', function(){
            this.dragging = false;
            this.data = null;
        })
        .on('pointermove', function(event){
            if (this.dragging) {
                this.x +=  event.data.originalEvent.movementX;
                this.y += event.data.originalEvent.movementY;
                set_z_position(Math.max(0, (canvasHeight - this.y) / canvasHeight));
            }
        });




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
