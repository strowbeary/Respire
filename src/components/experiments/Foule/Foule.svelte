<script>
    import Canvas from "components/Canvas.svelte";
    import AppWrapper from "components/AppWrapper.svelte";
    import peopleImg from "assets/images/silhouette.png";
    import Camille from "assets/images/foule/Camille.png";
    import Melanie from "assets/images/foule/Melanie.png";
    import Remi from "assets/images/foule/Remi.png";
    import P1 from "assets/images/foule/P1.png";
    import P2 from "assets/images/foule/P2.png";
    import P3 from "assets/images/foule/P3.png";
    import P4 from "assets/images/foule/P4.png";
    import * as PIXI from "pixi.js";

    function onDragStart(event) {
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        this.data = event.data;
        this.dragging = true;
    }

    function onDragEnd() {
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
       antialias: true
    };

    let loader = PIXI.loader,
        resources = PIXI.loader.resources,
        Sprite = PIXI.Sprite;


    let container = [];
    let initialPos = [];
    let initialScale = [];
    let app, canvasWidth, canvasHeight;
    let people = {};
    const imgAssets = {
      "P3": P3,
      "P4": P4,
      "P1": P1,
      "Camille": Camille,
      "Remi": Remi,
      "P2": P2,
      "Melanie": Melanie,
    };

    function init(data) {
        app = data.detail.app;
        canvasWidth = data.detail.canvasWidth;
        canvasHeight = data.detail.canvasHeight;

        let imgToAdd = Object.values(imgAssets).filter(key => !Object.keys(resources).includes(key));

        if (imgToAdd.length > 0) {
            loader
                .add(imgToAdd)
                .load(setup);
        } else {
            setup()
        }
    }

    let scale;

    function generatePeople(resourceKey) {
        let texture = resources[resourceKey].texture;
        let {width} = texture.baseTexture;
        scale = canvasWidth/width * 0.8;
        let person = new Sprite(texture, app);
        person.anchor.x = 0.5;
        person.anchor.y = 0.5;
        person.scale.set(scale);
        person.interactive = true;
        person.buttonMode = true;
        person.on('pointerdown', onDragStart)
                      .on('pointerup', onDragEnd)
                      .on('pointerupoutside', onDragEnd)
                      .on('pointermove', onDragMove);
        return person;
    }

    function setPosition(keyName) {
        switch (keyName) {
            case "P2":
                people[keyName].position.set(canvasWidth * 0.7, canvasHeight);
                break;
            case "Melanie":
                people[keyName].position.set(canvasWidth * 0.2, canvasHeight * 0.9);
                break;
            case "Remi":
                people[keyName].position.set(canvasWidth * 0.5, canvasHeight * 0.7);
                break;
            case "Camille":
                people[keyName].position.set(canvasWidth * 0.2, canvasHeight * 0.6);
                break;
            case "P1":
                people[keyName].position.set(canvasWidth * 0.8, canvasHeight * 0.6);
                break;
            case "P4":
                people[keyName].position.set(canvasWidth * 0.6, canvasHeight * 0.45);
                break;
            case "P3":
                people[keyName].position.set(canvasWidth * 0.25, canvasHeight * 0.55);
                break;
            default:
                break;
        }
    }

    function setup() {
        Object.values(imgAssets).forEach((key) => {
            let keyName = Object.keys(imgAssets).find(keyName => imgAssets[keyName] === key);
            let person = generatePeople(key);
            people[keyName] = person;
            setPosition(keyName);
            app.stage.addChild(person);
        });
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
