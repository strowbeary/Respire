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
	import Box from "assets/images/pilule/Box.png";
	import Pill from "assets/images/pilule/Pill.png";
	import Ticket from "assets/images/pilule/Ticket.png";

    const carton_data = {
        titleName: "Noctambule",
        timeContext: "7 heures avant l'examen",
        spaceContext: "Chambre"
    };

    let display_carton = true;
    let is_ready = false;

    export let canvasProps;

    const appProperties = {
       backgroundColor: 0xffffff,
       antialias: true
    };

    let loader = PIXI.loader,
        resources = PIXI.loader.resources,
        Sprite = PIXI.Sprite,
        Container = PIXI.Container;

    let app, canvasWidth, canvasHeight;
    let container = new Container();
    const imgAssets = {
        Box,
        Pill,
        Ticket
    };

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

    function setPosition(sprite, keyName) {
        switch (keyName) {
            case "Box":
                sprite.scale.set(canvasWidth/sprite.width);
                sprite.position.set(canvasWidth/2, canvasHeight/2);
                break;
            case "Ticket":
                sprite.scale.set(canvasWidth/sprite.width);
                sprite.position.set(canvasWidth/2, canvasHeight/2);
                break;
            default:
                sprite.scale.set(canvasWidth/sprite.width * 0.3);
                sprite.position.set(canvasWidth/2, canvasHeight/2);
                break;
        }
    }

    async function setup() {
        await Object.values(imgAssets).forEach((key) => {
            let keyName = Object.keys(imgAssets).find(keyName => imgAssets[keyName] === key);
            let sprite = generateSprite(key);
            setPosition(sprite, keyName);
            if (keyName === "Ticket") { //these sprites will be used for hit test
                let sprite2 = generateSprite(key);
                sprite2.scale.set(canvasWidth/sprite2.width);
                sprite2.position.set(canvasWidth/2 + sprite2, canvasHeight/2);
                container.addChild(sprite2);
                let sprite3 = generateSprite(key);
                sprite3.scale.set(canvasWidth/sprite3.width);
                sprite3.position.set(canvasWidth/2 - sprite3, canvasHeight/2);
                container.addChild(sprite3);
            }
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
                <Carton {...carton_data} visible={display_carton} ready={is_ready} sandLevel="30" on:next={() => {
                    display_carton = false;
                }}></Carton>
            <Canvas {appProperties} {canvasSize} on:pixiApp="{init}"></Canvas>
        {/if}
    </span>
</AppWrapper>
