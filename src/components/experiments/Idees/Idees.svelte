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

    function positionFromCanvasWidth(number) {
      return number * canvasWidth;
    }

    function setPosition(keyName) {
         switch(keyName){
            case "Idea1":
                ideas[keyName].positions = {start: 0.15, end: -ideas[keyName].width/2};
                ideas[keyName].position.set(ideas[keyName].positions.end, canvasHeight * 0.9);
                break;
            case "Idea2":
                ideas[keyName].positions = {start: 0.95, end: positionFromCanvasWidth(1) + ideas[keyName].width/2};
                ideas[keyName].position.set(ideas[keyName].positions.end, canvasHeight * 0.5);
                break;
            case "Idea3":
                ideas[keyName].positions = {start: 0.15, end: -ideas[keyName].width/2};
                ideas[keyName].position.set(ideas[keyName].positions.end, canvasHeight * 0.1);
                break;
            default:
                break;
         }
    }

    function create_clone(sprite, keyName) {
        let clone = new Sprite(sprite._texture);
        clone.anchor.x = 0.5;
        clone.anchor.y = 0.5;
        clone.position.set(sprite.position.x, sprite.position.y);
        clone.alpha = 0;
        let index = Object.values(ideas).filter(idea => idea._texture.textureCacheIds[0] === sprite._texture.textureCacheIds[0]).length;
        let name = keyName.split('-')[0] + '-' + index;
        ideas[name] = clone;
        clone.anim_opacity = create_sprite_appear(0, 1);
        clone.anim_opacity.start();
        container.addChild(clone);
    }

    function move_clone(keyName) {
        let sprite = ideas[keyName];
        sprite.anim_position_y = create_sprite_appear(sprite.position.y, sprite.position.y - 50);
        sprite.anim_position_y.start();
    }

    function create_sprite_appear(from_value, to_value) {
      return Animate(from_value, to_value, Easing.linear, 0.03);
    }

    async function setup() {
        Object.values(imgAssets).forEach((key) => {
            let keyName = Object.keys(imgAssets).find(keyName => imgAssets[keyName] === key);
            let sprite = generateSprite(key);
            ideas[keyName] = sprite;
            setPosition(keyName);
            container.addChild(sprite);
        });
        setTimeout(() => {
            setAppearAnimation("Idea1");
        }, 10000);
        app.ticker.add(delta => gameLoop(delta));
        is_ready = true;
    }

    function setAppearAnimation(keyName) {
        let sprite = ideas[keyName];
        sprite.anim_position_x = create_sprite_appear(sprite.positions.end, positionFromCanvasWidth(sprite.positions.start));
        sprite.anim_position_x.start();
    };

    function gameLoop() {
        if (Object.keys(ideas).length > 0) {
            for (let property in ideas) {
                if (ideas[property].anim_position_x) {
                    let sprite = ideas[property];
                    if (sprite.anim_position_x.is_running) {
                        sprite.position.set(sprite.anim_position_x.tick(), sprite.position.y);
                    }
                    if (sprite.anim_position_x.is_ended_signal) {
                        create_clone(sprite, property);
                    }
                }
                if (ideas[property].anim_opacity) {
                    let sprite = ideas[property];
                    if (sprite.anim_opacity.is_running) {
                        sprite.alpha = sprite.anim_opacity.tick();
                    }
                    if (sprite.anim_opacity.is_ended_signal) {
                        move_clone(property);
                    }
                }
                if (ideas[property].anim_position_y) {
                    let sprite = ideas[property];
                    if (sprite.anim_position_y.is_running) {
                        sprite.position.set(sprite.position.x, sprite.anim_position_y.tick());
                    }
                    if (sprite.anim_position_y.is_ended_signal) {
                        create_clone(sprite, property);
                    }
                }
            }
        }
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
