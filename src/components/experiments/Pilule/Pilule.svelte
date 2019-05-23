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
        Point = PIXI.Point,
        Container = PIXI.Container,
        Graphics = PIXI.Graphics;

    let app, canvasWidth, canvasHeight;
    let container = new Container();
    let graphics = new Graphics();

    container.addChild(graphics);

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
    let pilulePosInitial = {};

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
            case "Pill":
                preparePill(sprite);
                break;
            default:
                sprite.scale.set(canvasWidth/sprite.width * 0.05);
                break;
        }
    }

    function preparePill(sprite) {
        piluleSprite = sprite;
        sprite.scale.set(canvasWidth/sprite.width * 0.05);

        //ici j'ai fait du vaudou pour placer la pilule
        pilulePosInitial = {x: (boxWidth/3)*0.7, y: (boxHeight/2.25)*0.7 - sprite.height/2};
        sprite.position.set(pilulePosInitial.x, pilulePosInitial.y);

        function onDragEnd() {
            if (this.dragging) {
                this.dragging = false;
                this.data = null;
            }
        }
        sprite.interactive = true;
        sprite.on('pointerdown', function (event) {
                  // store a reference to the data
                  // the reason for this is because of multitouch
                  // we want to track the movement of this particular touch
                  if (!this.dragging) {
                      this.data = event.data;
                      this.dragging = true;
                      this.offsetY = this.y - this.data.getLocalPosition(this.parent).y;
                      this.offsetX = this.x - this.data.getLocalPosition(this.parent).x;
                  }
              })
              .on('pointerup', onDragEnd)
              .on('pointerupoutside', onDragEnd)
              .on('pointermove', function () {
                  if (this.dragging) {
                      let newPosX = this.data.getLocalPosition(this.parent).x + this.offsetX;
                      let newPosY = this.data.getLocalPosition(this.parent).y + this.offsetY;
                      this.y = newPosY;
                      this.x = newPosX;
                  }
              });
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

    let borderLeft, borderRight, piluleSprite;

    function generateBoxBorder() {
        borderLeft = generateBorderSprite();
        borderRight = generateBorderSprite();
        let borderBottom = generateBorderSprite(true);
        borderRight.position.set((boxWidth/2)*0.7, 0);
        borderLeft.position.set(-(boxWidth/2)*0.5, 0);
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

        //generateBoxBorder();
        let path = [-(boxWidth/2)*0.8, - (boxHeight/2)*0.625,
                    boxWidth*0.15,  - (boxHeight/2)*0.625 - boxHeight*0.08,
                    boxWidth*0.475,  (boxHeight/2)*0.625 - boxHeight*0.04,
                    -(boxWidth/2)*0.2, (boxHeight/2)*0.625 + boxHeight*0.04
                   ];
        graphics.beginFill(0xFF0000);
        graphics.drawPolygon(path);
        /*graphics.moveTo(-(boxWidth/2.5)*0.7, -(boxHeight/2)*0.7);
        graphics.lineTo(boxWidth*0.6 -(boxWidth/2.5)*0.7,  -(boxHeight/2)*0.7);
        graphics.lineTo(boxWidth*0.6 -(boxWidth/2.5)*0.7, boxHeight*0.7 -(boxHeight/2)*0.7);
        graphics.lineTo(-(boxWidth/2.5)*0.7, boxHeight*0.7 -(boxHeight/2)*0.7);
        graphics.lineTo(-(boxWidth/2.5)*0.7, -(boxHeight/2)*0.7);*/
        graphics.endFill();
        //graphics.rotation = -Math.PI/13.5;

        /*graphics.beginFill(0xFF0000);
        graphics.drawRect(-(boxWidth/2.5)*0.7, -(boxHeight/2)*0.7, boxWidth*0.6, boxHeight*0.7);
        graphics.endFill();
        graphics.rotation = -Math.PI/13.5;*/
        /*graphics.beginFill(0xFF0000);
        graphics.drawRect((boxWidth/2)*0.7, 0, 1, canvasHeight);
        graphics.endFill();
        graphics.beginFill(0xFF0000);
        graphics.drawRect(-(boxWidth/2)*0.5, 0, 1, canvasHeight);
        graphics.endFill();*/

        container.animWiggle = Animate(-Math.PI/12, Math.PI/12, Easing.easeOutCubic, 0.01);
        container.animDirection = "left";
        container.animWiggle.start();

        app.ticker.add(delta => gameLoop(delta));
        is_ready = true;
    }

    function getBottomLeft() {
        let x = piluleSprite.position.x - piluleSprite.width/2;
        let y = piluleSprite.position.y + piluleSprite.height/2;
        return new Point(x, y);
    }

    function getTopRight() {
        let x = piluleSprite.position.x + piluleSprite.width/2;
        let y = piluleSprite.position.y - piluleSprite.height/2;
        return new Point(x, y);
    }


    function gameLoop() {
        if (piluleSprite.dragging) {
            if (!graphics.graphicsData[0].shape.contains(piluleSprite.position.x - piluleSprite.width/2, piluleSprite.position.y + piluleSprite.height/2)
            || !graphics.graphicsData[0].shape.contains(piluleSprite.position.x + piluleSprite.width/2, piluleSprite.position.y - piluleSprite.height/2)) {
                container.animWiggle = "";
                piluleSprite.dragging = false;
            }
            /*if (!graphics.containsPoint(getTopRight())) {
                console.log("right");
            }*/
        }
        if (container.animWiggle.is_running) {
            container.rotation = container.animWiggle.tick();
        }
        if (container.animWiggle.is_ended_signal) {
            if (container.animDirection === "left") {
                container.animWiggle = Animate(Math.PI/12, -Math.PI/12, Easing.easeOutCubic, 0.01);
                container.animWiggle.start();
                container.animDirection = "right";
            } else {
                container.animWiggle = Animate(-Math.PI/12, Math.PI/12, Easing.easeOutCubic, 0.01);
                container.animWiggle.start();
                container.animDirection = "left";
            }
        }
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
