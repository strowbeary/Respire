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
    import Camille from "assets/images/foule/Camille.png";
    import Melanie from "assets/images/foule/Melanie.png";
    import Remi from "assets/images/foule/Remi.png";
    import P1 from "assets/images/foule/P1.png";
    import P2 from "assets/images/foule/P2.png";
    import P3 from "assets/images/foule/P3.png";
    import P4 from "assets/images/foule/P4.png";
    import P5 from "assets/images/foule/P5.png";
    import P6 from "assets/images/foule/P6.png";
    import P7 from "assets/images/foule/P7.png";
    import P8 from "assets/images/foule/P8.png";
    import Xindi from "assets/images/foule/Xindi.png";

    const carton_data ={
        titleName: "À contre-courant",
        timeContext: "18 heures avant l'examen",
        spaceContext: "Amphitheatre"
    };

    let display_carton = true;
    let is_ready = false;

    export let canvasProps;
    let set_z_position = () => {};
    let play_interaction_sound = () => {};
    let start_audio = () => {};
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
    let people = {};
    function create_container_anim(from_value, to_value) {
        return Animate(from_value, to_value, Easing.easeOutCubic, 0.03)
    }
    function create_person_anim(from_value, to_value) {
        return Animate(from_value, to_value, Easing.linear, 0.01);
    }
    let container_anim = create_container_anim(0, 1);
    let person_anim = create_person_anim(0, 1);
    const imgAssets = {
        P8,
        P5,
        P6,
        P7,
        P2,
        //interactive
        P1,
        P4,
        P3,
        Camille,
        Remi,
        Melanie,
        Xindi
    };

    const interactiveOrder = Object.keys(imgAssets).reverse();
    let positions = [];
    let interactiveCurrentIndex = 0;
    let interactiveCurrentFinalPos;
    let interactiveStartingPos;

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

    async function setInteractive() {
         person = people[interactiveOrder[interactiveCurrentIndex]];

        if (interactiveCurrentIndex < 7) {
            interactiveCurrentFinalPos = positionFromCanvasWidth(positions[interactiveCurrentIndex].end);
            interactiveStartingPos = positionFromCanvasWidth(positions[interactiveCurrentIndex].start);
            person.interactive = true;
            person.buttonMode = true;
            if (interactiveCurrentFinalPos > interactiveStartingPos) {
                dragIcon.setDirection(1);
            } else {
                dragIcon.setDirection(-1);
            }
            dragIcon.setPosition(person.position.x, person.position.y - person.height * 0.25 + container.position.y);
            dragIcon.initIconAnim(0, 0.5);
            dragIcon.startIconAnim();

            function onDragEnd() {
                if (this.dragging) {
                    this.dragging = false;
                    // set the interaction data to null
                    this.data = null;
                    this.offset = 0;
                    if ((this.direction === "left" && this.x < interactiveCurrentFinalPos) ||
                        (this.direction === "right" && this.x > interactiveCurrentFinalPos)
                       ) {
                        this.x = interactiveCurrentFinalPos;
                        person.interactive = false;
                        if (interactiveCurrentIndex+1 < interactiveOrder.length) {
                            interactiveCurrentIndex++;
                            play_interaction_sound();
                            if (interactiveCurrentIndex % 2 === 0) {
                                container_anim = create_container_anim(container.position.y, container.position.y + (canvasHeight * 0.1));
                                container_anim.start();
                            } else {
                                setInteractive();
                            }
                        }
                    } else {
                        person_anim = create_person_anim(this.x, interactiveStartingPos);
                        person_anim.start();
                        dragIcon.initIconAnim(0, 0.5);
                        dragIcon.startIconAnim();
                    }
                }
            }

            person.on('pointerdown', function (event) {
                        // store a reference to the data
                        // the reason for this is because of multitouch
                        // we want to track the movement of this particular touch
                        if (!this.dragging) {
                            this.data = event.data;
                            this.dragging = true;
                            this.offset = this.x - this.data.getLocalPosition(this.parent).x;
                            this.direction = this.x > interactiveCurrentFinalPos? "left": "right";
                            dragIcon.initIconAnim(0.5, 0);
                            dragIcon.startIconAnim();
                            //reset after some time
                            setTimeout(() => {
                                if (this.dragging) {
                                   this.dragging = false;
                                   this.data = null;
                                   this.offset = 0;
                                   //interpolate x to be less brutal
                                   //this.x = interactiveStartingPos;
                                   person_anim = create_person_anim(this.x, interactiveStartingPos);
                                   person_anim.start();
                                   dragIcon.initIconAnim(0, 0.5);
                                   dragIcon.startIconAnim();
                                }
                            }, Math.random() * 500);
                        }
                    })
                    .on('pointerup', onDragEnd)
                    .on('pointerupoutside', onDragEnd)
                    .on('pointermove', function () {
                        if (this.dragging) {
                            let newPos = this.data.getLocalPosition(this.parent).x + this.offset;
                            if (this.direction === "left" && this.x >= interactiveCurrentFinalPos && this.x > newPos) {
                                this.x = newPos;
                            }
                            if (this.direction === "right" && this.x <= interactiveCurrentFinalPos && this.x < newPos) {
                                this.x = newPos;
                            }
                        }
                    });
        } else {
            await Promise.all(["P8", "P5", "P6", "P7", "P2"]
                .reverse()
                .map(k => people[k])
                .map((p, i) => {
                    return new Promise(resolve => setTimeout(() => {
                        p.anim.start();
                        resolve();
                    }, Math.random() * 200 + i * 400));
                }));
            container_anim = Animate(container.position.y, container.position.y + 2 * canvasHeight, Easing.easeInCubic, 0.007);
            container_anim.start();

        }
    }

    function generatePeople(resourceKey) {
        let texture = resources[resourceKey].texture;
        let sprite = new Sprite(texture);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        return sprite;
    }

    function scalePeople(sprite, scaleValue) {
        let {width} = sprite._texture.baseTexture;
        scale = canvasWidth/width * scaleValue;
        sprite.scale.set(scale);
    }

    function positionFromCanvasWidth(number) {
        return number * canvasWidth;
    }

    function setPosition(keyName) {
        switch (keyName) {
            case "Xindi":
                positions.unshift({start: 0.7, end: 0.9});
                scalePeople(people[keyName], 0.85);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.9);
                break;
            case "Melanie":
                positions.unshift({start: 0.2, end: 0.1});
                scalePeople(people[keyName], 0.65);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.9);
                break;
            case "Remi":
                positions.unshift({start: 0.5, end: 0.8});
                scalePeople(people[keyName], 0.8);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.75);
                break;
            case "Camille":
                positions.unshift({start: 0.2, end: 0.1});
                scalePeople(people[keyName], 0.8);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.75);
                break;
            case "P3":
                positions.unshift({start: 0.7, end: 0.9});
                scalePeople(people[keyName], 0.8);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.65);
                break;
            case "P4":
                positions.unshift({start: 0.3, end: 0.1});
                scalePeople(people[keyName], 0.8);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.55);
                break;
            case "P1":
                positions.unshift({start: 0.5, end: 0.9});
                scalePeople(people[keyName], 0.8);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.55);
                break;
            case "P2":
                positions.unshift({start: 0.25, end: 0.1});
                scalePeople(people[keyName], 0.55);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.4);

                people[keyName].anim = Animate(positionFromCanvasWidth(positions[0].start), positionFromCanvasWidth(positions[0].end), Easing.easeOutQuad, 0.01)
                break;
            case "P7":
                positions.unshift({start: 0.7, end: 0.9});
                scalePeople(people[keyName], 0.7);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.3);

                people[keyName].anim = Animate(positionFromCanvasWidth(positions[0].start), positionFromCanvasWidth(positions[0].end), Easing.easeOutQuad, 0.01)
                break;
            case "P6":
                positions.unshift({start: 0.6, end: 0.9});
                scalePeople(people[keyName], 0.6);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.2);

                people[keyName].anim = Animate(positionFromCanvasWidth(positions[0].start), positionFromCanvasWidth(positions[0].end), Easing.easeOutQuad, 0.01)
                break;
            case "P5":
                positions.unshift({start: 0.3, end: 0.1});
                scalePeople(people[keyName], 0.6);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.25);

                people[keyName].anim = Animate(positionFromCanvasWidth(positions[0].start), positionFromCanvasWidth(positions[0].end), Easing.easeOutQuad, 0.01)
                break;
            case "P8":
                positions.unshift({start: 0.4, end: 0.15});
                scalePeople(people[keyName], 0.8);
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.2);

                people[keyName].anim = Animate(positionFromCanvasWidth(positions[0].start), positionFromCanvasWidth(positions[0].end), Easing.easeOutQuad, 0.01)
                break;
            default:
                break;
        }
    }

    async function setup() {
        const sound_scene = await init_foule_sound_scene();
        set_z_position = sound_scene.set_z_position;
        play_interaction_sound = sound_scene.play_interaction_sound;
        start_audio = sound_scene.start_audio;

        await Object.values(imgAssets).forEach((key) => {
            let keyName = Object.keys(imgAssets).find(keyName => imgAssets[keyName] === key);
            let sprite = generatePeople(key);

            people[keyName] = sprite;
            setPosition(keyName);
            if (keyName === "Xindi") {
                setInteractive();
            }
            container.addChild(sprite);
        });
        app.ticker.add(delta => gameLoop(delta));
        is_ready = true;
    }

    function gameLoop() {
        const container_offset = container_anim.tick();
        container.position.set(0, container_offset);
        set_z_position(1.5 - 1 / 0.3 * container_offset / canvasHeight);
        if(container_anim.is_ended_signal) {
            setInteractive();
        }
        if (person_anim.is_running) {
            const person_offset = person_anim.tick();
            person.position.set(person_offset, person.position.y);
        }
        dragIcon.loop();
        ["P8", "P5", "P6", "P7", "P2"]
        .map(k => people[k])
        .forEach(p => {
            p.position.set(p.anim.tick(), p.position.y)
        })
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
