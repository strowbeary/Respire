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

	/*
	* RESSOURCES
	* */
    import Camille from "assets/images/foule/Camille.png";
    import Melanie from "assets/images/foule/Melanie.png";
    import Remi from "assets/images/foule/Remi.png";
    import anim_bg from "assets/images/animated_background.png";
    import P1 from "assets/images/foule/P1.png";
    import P2 from "assets/images/foule/P2.png";
    import P3 from "assets/images/foule/P3.png";
    import P4 from "assets/images/foule/P4.png";
    import P5 from "assets/images/foule/P5.png";
    import P6 from "assets/images/foule/P6.png";
    import P7 from "assets/images/foule/P7.png";
    import P8 from "assets/images/foule/P8.png";
    import Xindi from "assets/images/foule/Xindi.png";

    export let canvasProps;
    let set_z_position = () => {};
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
    let container_anim = create_container_anim(0, 1);
    const imgAssets = {
        P5,
        P6,
        P8,
        P7,
        Xindi,
        //interactive
        P1,
        P4,
        P3,
        Camille,
        Remi,
        Melanie,
        P2
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

        dragIcon = new DragIcon();

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

    async function setInteractive() {
        let person = people[interactiveOrder[interactiveCurrentIndex]];

        if (interactiveCurrentIndex < 7) {
            interactiveCurrentFinalPos = positionFromCanvasWidth(positions[interactiveCurrentIndex].end);
            interactiveStartingPos = positionFromCanvasWidth(positions[interactiveCurrentIndex].start);
            person.interactive = true;
            person.buttonMode = true;
            dragIcon.setPosition(person.position.x, person.position.y - person.height * 0.25 + container.position.y);
            dragIcon.initIconAnim(0, 1);
            dragIcon.startIconAnim();

            function onDragEnd() {
                    this.dragging = false;
                    // set the interaction data to null
                    this.data = null;
                    let spritePos = this.sprite.position.x;
                    if (Math.abs(spritePos - interactiveCurrentFinalPos) < 10 ||
                        (this.direction === "left" && spritePos < interactiveCurrentFinalPos) ||
                        (this.direction === "right" && spritePos > interactiveCurrentFinalPos)
                       ) {
                        this.sprite.position.set(interactiveCurrentFinalPos, this.sprite.position.y);
                        this.sprite.interactive = false;
                        if (interactiveCurrentIndex+1 < interactiveOrder.length) {
                            interactiveCurrentIndex++;
                            if (interactiveCurrentIndex % 2 === 0) {
                                container_anim = create_container_anim(container.position.y, container.position.y + (canvasHeight * 0.1));
                                container_anim.start();
                            } else {
                                setInteractive();
                            }
                        }
                    } else {
                        this.sprite.position.set(interactiveStartingPos, this.sprite.position.y);
                        dragIcon.initIconAnim(0, 1);
                        dragIcon.startIconAnim();
                    }
                }

            person.on('pointerdown', function (event) {
                    // store a reference to the data
                    // the reason for this is because of multitouch
                    // we want to track the movement of this particular touch
                    this.data = event.data;
                    this.dragging = true;

                    this.sprite = people[interactiveOrder[interactiveCurrentIndex]];
                    let spritePos = this.sprite.position.x;
                    this.direction = spritePos > interactiveCurrentFinalPos? "left": "right";
                    dragIcon.initIconAnim(1, 0);
                    dragIcon.startIconAnim();
                })
                .on('pointerup', onDragEnd)
                .on('pointerupoutside', onDragEnd)
                .on('pointermove', function (event) {
                    if (this.dragging) {
                        let spritePos = this.sprite.position.x;
                        if (this.direction === "left" && spritePos >= interactiveCurrentFinalPos && event.data.originalEvent.movementX < 0) {
                            this.x +=  event.data.originalEvent.movementX;
                            //this.y += event.data.originalEvent.movementY;
                        }
                        if (this.direction === "right" && spritePos <= interactiveCurrentFinalPos && event.data.originalEvent.movementX > 0) {
                            this.x +=  event.data.originalEvent.movementX;
                            //this.y += event.data.originalEvent.movementY;
                        }
                    }
                });
        } else {
            await Promise.all(["P5", "P6", "P8", "P7", "Xindi"]
                .reverse()
                .map(k => people[k])
                .map((p, i) => {
                    return new Promise(resolve => setTimeout(() => {
                        p.anim.start()
                        resolve();
                    }, Math.random() * 200 + i * 400));
                }));

            container_anim = Animate(container.position.y, container.position.y + 2 * canvasHeight, Easing.easeInCubic, 0.005)
            container_anim.start();

        }
    }

    function moveStaticPeople() {

    }

    function generatePeople(resourceKey) {
        let texture = resources[resourceKey].texture;
        let {width} = texture.baseTexture;
        scale = canvasWidth/width * 0.8;
        let person = new MaskedSprite(texture, app);
        person.anchor.x = 0.5;
        person.anchor.y = 0.5;
        person.scale.set(scale);

        return person;
    }

    function positionFromCanvasWidth(number) {
        return number * canvasWidth;
    }

    function setPosition(keyName) {
        switch (keyName) {
            case "P2":
                positions.unshift({start: 0.7, end: 0.9});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight);
                break;
            case "Melanie":
                positions.unshift({start: 0.2, end: 0.1});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.9);
                break;
            case "Remi":
                positions.unshift({start: 0.5, end: 0.8});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.7);
                break;
            case "Camille":
                positions.unshift({start: 0.2, end: 0.1});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.6);
                break;
            case "P3":
                positions.unshift({start: 0.7, end: 0.9});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.6);
                break;
            case "P4":
                positions.unshift({start: 0.3, end: 0.1});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.45);
                break;
            case "P1":
                positions.unshift({start: 0.5, end: 0.9});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.55);
                break;
            case "Xindi":
                positions.unshift({start: 0.25, end: 0.1});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.35);

                people[keyName].anim = Animate(positionFromCanvasWidth(positions[0].start), positionFromCanvasWidth(positions[0].end), Easing.easeOutQuad, 0.01)
                break;
            case "P7":
                positions.unshift({start: 0.7, end: 0.9});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.3);

                people[keyName].anim = Animate(positionFromCanvasWidth(positions[0].start), positionFromCanvasWidth(positions[0].end), Easing.easeOutQuad, 0.01)
                break;
            case "P8":
                positions.unshift({start: 0.4, end: 0.15});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.1);

                people[keyName].anim = Animate(positionFromCanvasWidth(positions[0].start), positionFromCanvasWidth(positions[0].end), Easing.easeOutQuad, 0.01)
                break;
            case "P6":
                positions.unshift({start: 0.6, end: 0.9});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.25);

                people[keyName].anim = Animate(positionFromCanvasWidth(positions[0].start), positionFromCanvasWidth(positions[0].end), Easing.easeOutQuad, 0.01)
                break;
            case "P5":
                positions.unshift({start: 0.3, end: 0.1});
                people[keyName].position.set(positionFromCanvasWidth(positions[0].start), canvasHeight * 0.25);

                people[keyName].anim = Animate(positionFromCanvasWidth(positions[0].start), positionFromCanvasWidth(positions[0].end), Easing.easeOutQuad, 0.01)
                break;
            default:
                break;
        }
    }

    async function setup() {

        set_z_position = (await init_foule_sound_scene()).set_z_position;

        dragIcon.setup(app);

        Object.values(imgAssets).forEach((key, index) => {
            let keyName = Object.keys(imgAssets).find(keyName => imgAssets[keyName] === key);
            let person = generatePeople(key);

            people[keyName] = person;
            setPosition(keyName);
            if (keyName === "P2") {
                setInteractive();
            }

            /*if (index > 4) {
                people[keyName] = person;
                setPosition(keyName);
                if (keyName === "P2") {
                    setInteractive();
                }
            }*/

            container.addChild(person);
        });
        app.ticker.add(delta => gameLoop(delta));
    }
    let increment = 0;
    let isFinished = true;
    let offset = 0;

    function gameLoop() {
        const container_offset = container_anim.tick();
        container.position.set(0, container_offset);
        set_z_position(1.5 - 1 / 0.3 * container_offset / canvasHeight);
        if(container_anim.is_ended_signal) {
            setInteractive();
        }
        dragIcon.loop();
        ["P5", "P6", "P8", "P7", "Xindi"]
        .map(k => people[k])
        .forEach(p => {
            p.position.set(p.anim.tick(), p.position.y)
        })
    }
</script>

<style>
.overlay {
    position: absolute;
    width: 100%;
    mix-blend-mode: difference;
    pointer-events: none;
}
.rond {
    position: absolute;
    border: 1px solid #ffcf00;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    left: 50px;
    bottom: 250px;
    animation: wiggle 1s infinite;
}
</style>

<AppWrapper>
    <span slot="canvas" let:canvasSize={canvasSize}>
        {#if canvasSize.canvasWidth}
            <img class="overlay" src={anim_bg}>
            <Canvas {appProperties} {canvasSize} on:pixiApp="{init}"></Canvas>
        {/if}
    </span>
</AppWrapper>
