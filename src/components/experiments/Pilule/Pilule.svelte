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

    let boxHeight = 0;
    let boxWidth = 0;

    function setPosition(sprite, keyName) {
        switch (keyName) {
            case "Box":
                sprite.scale.set(canvasWidth/sprite.width * 0.5);
                boxHeight = sprite.height;
                boxWidth = sprite.width;
                break;
            case "Ticket":
                sprite.scale.set(canvasWidth/sprite.width * 0.5);
                break;
            default:
                sprite.scale.set(canvasWidth/sprite.width * 0.05);
                break;
        }
    }

    function generateBorderSprite(isHorizontal) {
        let sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        sprite.tint = 0xff0000; //Change with the color wanted
        if (!isHorizontal) {
            sprite.width = 1;
            sprite.height = canvasHeight;
        } else {
            sprite.width = canvasWidth;
            sprite.height = 1;
        }
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.rotation = -Math.PI/13.5;
        return sprite;
    }

    function generateBoxBorder() {
        let borderLeft = generateBorderSprite();
        let borderRight = generateBorderSprite();
        let borderBottom = generateBorderSprite(true);
        borderRight.position.set((boxWidth/2)*0.7, 0);
        borderLeft.position.set(-(boxWidth/2)*0.65, 0);
        borderBottom.position.set(0, (boxHeight/2)*0.7);

        container.addChild(borderLeft);
        container.addChild(borderRight);
        container.addChild(borderBottom);
    }

    async function setup() {
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;
        container.x = canvasWidth / 2;
        container.y = canvasHeight / 2;

        await Object.values(imgAssets).forEach((key) => {
            let keyName = Object.keys(imgAssets).find(keyName => imgAssets[keyName] === key);
            let sprite = generateSprite(key);
            setPosition(sprite, keyName);
            container.addChild(sprite);
        });

        generateBoxBorder();

        app.ticker.add(delta => gameLoop(delta));
        is_ready = true;
    }

    function gameLoop() {
        //container.rotation -= 0.01 * delta;
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
