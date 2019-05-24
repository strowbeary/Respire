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

    let pilulePosInitial = {};

    function setPosition(sprite, keyName) {
        switch (keyName) {
            case "Box":
                sprite.scale.set(canvasWidth/sprite.width * 0.5);
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

        pilulePosInitial = {x: positionFromCanvasWidth(0.11), y: positionFromCanvasWidth(0.2)};
        sprite.position.set(pilulePosInitial.x, pilulePosInitial.y);

        function onDragEnd() {
            if (this.dragging) {
                this.dragging = false;
                this.data = null;
                this.interactive = false;
                container.animWiggle = "";
                container.rotation = -Math.PI/12;
                launchPillAnim();
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

                      if (graphics.graphicsData[1].shape.contains(newPosX - piluleSprite.width/2, newPosY + piluleSprite.height/2)) {
                          this.y = newPosY;
                          this.x = newPosX;
                      } else if (this.y < 0) {
                          alert("winner");
                      }
                  }
              });
    }

    let piluleSprite;

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

        let path2 = [
            positionFromCanvasWidth(-0.35), positionFromCanvasWidth(-8/9),
            positionFromCanvasWidth(-0.045), positionFromCanvasWidth(-8/9),
            positionFromCanvasWidth(0.395), positionFromCanvasWidth(8/9),
            positionFromCanvasWidth(0.07),positionFromCanvasWidth(8/9)
        ];
        let path3 = [
            positionFromCanvasWidth(-0.5), positionFromCanvasWidth(-0.2),
            positionFromCanvasWidth(0.5), positionFromCanvasWidth(-0.5),
            positionFromCanvasWidth(0.5), positionFromCanvasWidth(0.2),
            positionFromCanvasWidth(-0.5), positionFromCanvasWidth(0.5)
        ];
        graphics.beginFill(0xFF0000);
        graphics.drawPolygon(path2);
        graphics.drawPolygon(path3);
        graphics.endFill();
        graphics.alpha = 0;

        launchContainerAnim();

        app.ticker.add(delta => gameLoop(delta));
        is_ready = true;
    }

    function launchContainerAnim() {
        container.animWiggle = Animate(-Math.PI/12, Math.PI/12, Easing.easeOutCubic, 0.01);
        container.animDirection = "left";
        container.animWiggle.start();
    }

    function launchPillAnim() {
        piluleSprite.animFall_x = Animate(piluleSprite.x, pilulePosInitial.x, Easing.easeInQuad, 0.1);
        piluleSprite.animFall_y = Animate(piluleSprite.y, pilulePosInitial.y, Easing.easeInQuad, 0.1);
        piluleSprite.animFall_x.start();
        piluleSprite.animFall_y.start();
    }

    function hitBoxTest() {
        return !graphics.graphicsData[0].shape.contains(piluleSprite.position.x - piluleSprite.width/2, piluleSprite.position.y + piluleSprite.height/2)
                           || !graphics.graphicsData[0].shape.contains(piluleSprite.position.x + piluleSprite.width/2, piluleSprite.position.y - piluleSprite.height/2);
    }

    function gameLoop() {
        if (piluleSprite.dragging) {
            if (hitBoxTest()) {
                container.animWiggle = "";
                container.rotation = -Math.PI/12;
                piluleSprite.dragging = false;
                piluleSprite.interactive = false;
                launchPillAnim();
            }
        }

        if (piluleSprite.animFall_x) {
            if (piluleSprite.animFall_x.is_running) {
                piluleSprite.x = piluleSprite.animFall_x.tick();
            }

            if (piluleSprite.animFall_x.is_ended_signal) {
               piluleSprite.animFall_x = null;
               if (piluleSprite.animFall_y === null) {
                   piluleSprite.interactive = true;
                   launchContainerAnim();
               }
            }

        }

        if (piluleSprite.animFall_y) {
            if (piluleSprite.animFall_y.is_running) {
                piluleSprite.y = piluleSprite.animFall_y.tick();
            }
            if (piluleSprite.animFall_y.is_ended_signal) {
                piluleSprite.animFall_y = null;
                if (piluleSprite.animFall_x === null) {
                   piluleSprite.interactive = true;
                   launchContainerAnim();
                }
            }
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
