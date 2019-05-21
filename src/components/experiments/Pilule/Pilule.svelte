<script>
    /*
    * MODULES
    * */
    import Canvas from "components/Canvas.svelte";
    import AppWrapper from "components/AppWrapper.svelte";
    import * as PIXI from "pixi.js";
    import {Animate, Easing} from "lib/TimingKit";
    import {DragIcon} from "components/effects/dragIcon";
    import Carton from "components/Carton.svelte";
	/*
	* RESSOURCES
	* */

    const carton_data = {
        titleName: "Noctambule",
        timeContext: "7 heures avant l'examen",
        spaceContext: "Chambre"
    };

    let display_carton = true;
    let is_ready = false;

    export let canvasProps;

    const appProperties = {
       transparent: true,
       antialias: true
    };

    let loader = PIXI.loader,
        resources = PIXI.loader.resources,
        Sprite = PIXI.Sprite,
        Container = PIXI.Container;

    let app, canvasWidth, canvasHeight;
    let container = new Container();
    const imgAssets = {};

    let dragIcon;

    function init(data) {
        app = data.detail.app;
        canvasWidth = data.detail.canvasWidth;
        canvasHeight = data.detail.canvasHeight;
        app.stage.addChild(container);

        dragIcon = DragIcon(app);

        let imgToAdd = Object.values(imgAssets).filter(key => !resources[key]);
        if (imgToAdd.length > 0) {
            loader
                .add(imgToAdd)
                .load(setup);
        } else {
            setup()
        }
    }

    let scale;
    let person;

    function generateSprite(resourceKey) {
        let texture = resources[resourceKey].texture;
        let sprite = new Sprite(texture);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        return sprite;
    }

    function positionFromCanvasWidth(number) {
        return number * canvasWidth;
    }

    function setPosition(keyName) {
        switch (keyName) {
            default:
                break;
        }
    }

    async function setup() {

        await Object.values(imgAssets).forEach((key) => {
            let keyName = Object.keys(imgAssets).find(keyName => imgAssets[keyName] === key);
            let sprite = generateSprite(key);

            /*people[keyName] = sprite;
            setPosition(keyName);
            if (keyName === "Xindi") {
                setInteractive();
            }*/
            container.addChild(sprite);
        });
        app.ticker.add(delta => gameLoop(delta));
        is_ready = true;
    }

    function gameLoop() {

    }
</script>

<AppWrapper>
    <span slot="scene" let:canvasSize={canvasSize}>
        {#if canvasSize.canvasWidth}
                <Carton {...carton_data} visible={display_carton} ready={is_ready} sandLevel="70" on:next={() => {
                    display_carton = false;
                    start_audio()
                }}></Carton>
            <Canvas {appProperties} {canvasSize} on:pixiApp="{init}"></Canvas>
        {/if}
    </span>
</AppWrapper>
