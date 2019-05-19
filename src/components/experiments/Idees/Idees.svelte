<script>
    /*
    * MODULES
    * */
    import Canvas from "components/Canvas.svelte";
    import AppWrapper from "components/AppWrapper.svelte";
    import * as PIXI from "pixi.js";
    import {MaskedSprite} from "utils/MaskedSprite.pixi.js";
    import {Animate, Easing} from "lib/TimingKit";
	import {init_foule_sound_scene} from "components/experiments/Foule/Foule.sound";
    import {DragIcon} from "components/effects/dragIcon";
    import Carton from "components/Carton.svelte";
	/*
	* RESSOURCES
	* */
    import Idea1 from "assets/images/idees/Idea1.png";
    import Idea2 from "assets/images/idees/Idea2.png";
    import Idea3 from "assets/images/idees/Idea3.png";

    const carton_data ={
        titleName: "Les idées noires",
        timeContext: "17 heures avant l'examen",
        spaceContext: "Amphitheatre"
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
        Idea1, Idea2, Idea3
    };

    let positions = [];
    let ideas = [];
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

    async function setup() {
        Object.values(imgAssets).forEach((key) => {
            let keyName = Object.keys(imgAssets).find(keyName => imgAssets[keyName] === key);
            let sprite = generateSprite(key);
            ideas[keyName] = sprite;
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
                }}></Carton>
            <Canvas {appProperties} {canvasSize} on:pixiApp="{init}" bgColor="white"></Canvas>
        {/if}
    </span>
</AppWrapper>
