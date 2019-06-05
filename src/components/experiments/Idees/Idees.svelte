<script>
        /*
    * MODULES
    * */
    import {createEventDispatcher, onDestroy} from 'svelte';
    import Canvas from "components/Canvas.svelte";
    import * as PIXI from "pixi.js";
    import {MaskedSprite} from "utils/MaskedSprite.pixi.js";
    import {Animate, Easing, Sequence} from "lib/TimingKit";
	import {init_foule_sound_scene} from "components/experiments/Foule/Foule.sound";
    import {DragIcon} from "components/effects/dragIcon";
    import Carton from "components/Carton.svelte";
    import PixiApngAndGif from 'pixi-apngandgif'
	/*
	* RESSOURCES
	* */
    import idea_image from "assets/images/idees/Idea_small.png";
    import Prof from "assets/images/foule/P3.png";
    import lightBackground from "assets/images/light_background.png";
    import {Idea} from "./Idea";
    import {Vector3} from "lib/SoundKit";
    import {init_ideas_sound_scene} from "components/experiments/Idees/Ideas.sound";

    export let canvasSize;


    const dispatch = createEventDispatcher();

    const carton_data ={
        titleName: "Les idées noires",
        timeContext: "17 heures avant l'examen",
        spaceContext: "Amphithéâtre"
    };

    let display_carton = true;
    let is_ready = false;

    export let canvasProps;

    let loader = PIXI.loader,
        resources = PIXI.loader.resources,
        Resource = PIXI.loaders.Resource,
        Sprite = PIXI.Sprite,
        Container = PIXI.Container,
        filters = PIXI.filters,
        RoundedRectangle = PIXI.RoundedRectangle;

    let app, canvasWidth, canvasHeight;
    let container = new Container();
    let prof;


    let blurAnim = Animate(0, 0, Easing.easeInOutQuad, 0.01);
    let blurValue = 0;
    let current_freq = 9000;
    const imgAssets = {
        idea_image
    };

    const loadOption = {
        loadType: Resource.LOAD_TYPE.XHR,
        xhrType: Resource.XHR_RESPONSE_TYPE.BUFFER,
        crossOrigin:''
    };

    let dragIcon;
    let audio_scene;
    function init(data) {
        app = data.detail.app;
        canvasWidth = data.detail.canvasWidth;
        canvasHeight = data.detail.canvasHeight;
        app.stage.addChild(container);
        dragIcon = DragIcon(app.stage);
        loadImages();
    }

    function setInteractive(sprite, controller) {
            let dragging = false;
            let old_x = 0;
            let old_y = 0;

            function on_end(e) {
                dragging = false;
                if(
                    (controller.values.position.x < 0 || controller.values.position.x > canvasWidth) ||
                    (controller.values.position.y < 0 || controller.values.position.y > canvasHeight)
                ) {
                    controller.kill();
                }
            }

            sprite.on('pointerdown', e => {
                    dragging = true;
                    old_x = e.data.global.x;
                    old_y = e.data.global.y;
                })
                .on('pointerup',on_end)
                .on('pointerupoutside', on_end)
                .on('pointermove', e => {
                    if (dragging) {
                        const offset_x = (e.data.global.x - old_x) + controller.values.display_offset.x;
                        const offset_y = controller.values.display_offset.y - (e.data.global.y - old_y);
                        old_x = e.data.global.x;
                        old_y = e.data.global.y;
                        controller.set_display_offset(Vector3(
                            Math.round(offset_x),
                            Math.round(offset_y),
                            0
                        ));
                    }
                });
        }

    async function loadImages() {
        if (!resources[Prof]) {
            loader.add(Prof);
        }
        let imgToAdd = Object.values(imgAssets).filter(key => !resources[key]);
        if (imgToAdd.length > 0) {
            await imgToAdd.forEach((resourceKey) => {
                loader.add(resourceKey, loadOption)
            });
            loader.load(setup);
        } else {
            setup()
        }
    }

    function generateAnimatedSprite(resourceKey) {
        let sprite = new PixiApngAndGif(resourceKey, resources).sprite;
        sprite.hitArea = new RoundedRectangle(-240, -50, 480, 100, 150);
        sprite.buttonMode = true;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.scaleDefault = canvasWidth/sprite.width * 0.65;
        sprite.scale.set(sprite.scaleDefault);
        return sprite;
    }

    const Ideas = [];

    const LEFT = -1;
    const RIGHT = 1;

    function create_initial_idea(side, height) {
        const sprite = generateAnimatedSprite(imgAssets["idea_image"]);
        sprite.interactive = true;
        const line_event_bus = new EventTarget();
        const controller = Idea(
            {canvasWidth, canvasHeight},
            {
                side,
                position: Vector3(
                    side < 0 ? -sprite.width / 2 : canvasWidth + sprite.width / 2,
                    height,
                    0
                ),
                ejection_direction: Vector3(-side, 0, 0),
                opacity: 1,
                ejection_strength: sprite.width - 50,
                line_event_bus,
                spriteWidth: sprite.width,
                spriteHeight: sprite.height
            }
        );

        setInteractive(sprite, controller);

        line_event_bus.addEventListener("death", e => {
        current_freq += 296;
        audio_scene.set_prof_freq(current_freq);
            blurValue -= 0.5;
            const all_dismissed = Ideas.reduce((a, {controller}) => controller.values.dismissed && a);
            if(all_dismissed) {
                setTimeout(() => {
                    const all_dismissed = Ideas.reduce((a, {controller}) => controller.values.dismissed && a);
                    if(all_dismissed) {
                        audio_scene.destroy();
                        dispatch("next");
                    }
                }, 2000);
            }
        });

        blurValue += 0.5;
        current_freq -= 296;
        audio_scene.set_prof_freq(current_freq);


        audio_scene.play_a_whisper(Vector3(
            controller.final_position.x,
            0,
            controller.final_position.y
        )
        .sub(Vector3(
            canvasWidth / 2,
            0,
            canvasHeight / 2
        ))
        .divide(Vector3(
            canvasWidth,
            1,
            canvasHeight
        )));
        line_event_bus.addEventListener("divide", e => {

            audio_scene.play_a_whisper(Vector3(
                e.detail.new_child.final_position.x,
                0,
                e.detail.new_child.final_position.y
            )
            .sub(Vector3(
                canvasWidth / 2,
                0,
                canvasHeight / 2
            ))
            .divide(Vector3(
                canvasWidth,
                1,
                canvasHeight
            )));

            blurValue += 0.5;
            current_freq -= 296;
            audio_scene.set_prof_freq(current_freq);
            const new_sprite = generateAnimatedSprite(imgAssets["idea_image"]);
            new_sprite.interactive = true;
            setInteractive(new_sprite, e.detail.new_child);
            Ideas.push({
                controller: e.detail.new_child,
                sprite: new_sprite
            });
            container.addChild(new_sprite);
        });
        Ideas.push({
            controller,
            sprite
        });
        container.addChild(sprite);
    }

    async function setup() {
        prof = new Sprite(resources[Prof].texture);
        prof.scale.set((canvasWidth/prof.width) * 0.25);
        prof.anchor.x = 0.5;
        prof.anchor.y = 0.5;
        prof.position.set(canvasWidth/2, canvasHeight/2);
        prof.filters = [new filters.BlurFilter(0.1)];
        container.addChild(prof);

        audio_scene = await init_ideas_sound_scene();
        await audio_scene.start_audio();
        app.ticker.add(delta => gameLoop(delta));
        is_ready = true;
    }

    function gameLoop() {
        Ideas.forEach(({controller, sprite}, i) => {
            controller.tick(container, sprite, i);
            const position = controller.values.position.to_array();
            sprite.position.set(...position);
            sprite.alpha = controller.values.opacity;
        });
        prof.filters[0].blur = blurValue;

    }

    function next() {
        display_carton = false;
        audio_scene.play_course();
        Sequence()
            .add(13000, () => create_initial_idea(RIGHT, 200))
            .add(2000, () => create_initial_idea(LEFT, 500))
            .add(3000, () => create_initial_idea(RIGHT, 800))
            .start();
    }

    onDestroy(() => {
        app.destroy();
    });
</script>

<style>
    .background {
        position: absolute;
        background-size: cover;
        background-color: white;
        z-index: -1;
    }
</style>

<Carton {...carton_data} {canvasSize} visible={display_carton} ready={is_ready} sandLevel="50" on:next="{next}"></Carton>
<div class="background" style="background-image: url({lightBackground}); width:{Math.floor(canvasSize.canvasWidth)}px; height:{Math.floor(canvasSize.canvasHeight)}px"></div>
<Canvas {canvasSize} on:pixiApp="{init}"></Canvas>
