<script>
    /*
    * MODULES
    * */
    import {createEventDispatcher, onDestroy} from 'svelte';
    import Canvas from "components/Canvas.svelte";
    import * as PIXI from "pixi.js";
    import {Animate, Easing, Sequence} from "lib/TimingKit";
    import {DragIcon} from "components/effects/dragIcon";
    import {carton_visible, carton_ready} from "./../../../stores";
	/*
	* RESSOURCES
	* */
	import Box from "assets/images/pilule/Box.png";
	import Pill from "assets/images/pilule/Pill.png";
	import Ticket from "assets/images/pilule/Ticket.png";
	import backgroundImg from "assets/images/pilule/cours.png";
	import lightBackground from "assets/images/light_background.png";

    import {init_pillule_sound_scene} from "components/experiments/Pilule/Pillule.sound";
	export let canvasSize;
    const dispatch = createEventDispatcher();
    let audio_scene;

    const unsubscribe = carton_visible.subscribe((value) => {
        if (!value) {
            launchClosedEye();
            audio_scene.start_audio();
        }
    });

    let loader = PIXI.loader,
        resources = PIXI.loader.resources,
        filters = PIXI.filters,
        Sprite = PIXI.Sprite,
        Point = PIXI.Point,
        Texture = PIXI.Texture,
        Container = PIXI.Container,
        Graphics = PIXI.Graphics;

    let currentScene = "eye";
    let app, canvasWidth, canvasHeight, canvasScale;
    let containerEye = new Container();
    let graphicsEye = new Graphics();
    let containerPill = new Container();
    let graphicsPill = new Graphics();

    containerEye.addChild(graphicsEye);
    containerPill.addChild(graphicsPill);

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
        canvasScale = canvasHeight/824;
        app.stage.addChild(containerEye);
        app.stage.addChild(containerPill);
        loadImages();
    }

    let background, scaleAnim, heightAnim, blurAnim;
    let height, scale;

    async function setup() {
       await setupPill();
       setUpEye();
    }

    async function setUpEye() {
        let backgroundColor = new Sprite(Texture.WHITE);
        backgroundColor.tint = 0x000000;
        backgroundColor.height = canvasHeight;
        backgroundColor.width = canvasWidth;
        containerEye.addChild(backgroundColor);

        background = new Sprite(resources[backgroundImg].texture);
        background.scale.set(canvasWidth/background.width);
        containerEye.addChild(background);
        containerEye.addChild(graphicsEye);
        containerEye.pivot.x = containerEye.width / 2;
        containerEye.pivot.y = containerEye.height / 2;
        containerEye.x = canvasWidth / 2;
        containerEye.y = canvasHeight / 2;

        initCloseEye();

        audio_scene = await init_pillule_sound_scene();

        app.ticker.add(delta => gameLoop(delta));
        carton_ready.setToTrue();
    }

    function initCloseEye() {
        graphicsEye.beginFill(0x000000);
        graphicsEye.moveTo(0, 0);
        graphicsEye.bezierCurveTo(50 * canvasScale, -100 * 1.5 * canvasScale, canvasWidth - 50 * canvasScale, -100 * 1.5 * canvasScale, canvasWidth, 0);
        graphicsEye.moveTo(0, 0);
        graphicsEye.bezierCurveTo(50 * canvasScale, 100 * 1.5 * canvasScale, canvasWidth - 50 * canvasScale, 100 * 1.5 * canvasScale, canvasWidth, 0);
        graphicsEye.position.set(canvasWidth/2, canvasHeight/2);
        graphicsEye.pivot.set(canvasWidth/2, 0);
        graphicsEye.scale.set(6);
        graphicsEye.endFill();
        background.mask = graphicsEye;
        background.filters = [new filters.BlurFilter()];
        background.filters[0].blur = 0;

        scaleAnim = Animate(6, 1, Easing.bounceOut, 0.0025);
        heightAnim = Animate(1.5, 0, Easing.bounceOut, 0.0025);
        blurAnim = Animate(0, 4, Easing.bounceOut, 0.0025);
    }

    function loadImages() {
        if (!resources[backgroundImg]) {
            loader.add(backgroundImg)
        }
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
                containerPill.animWiggle = "";
                containerPill.rotation = -Math.PI/12;
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
                      dragIcon.initIconAnim(0.7, 0);
                      dragIcon.startIconAnim();
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

                      if (graphicsPill.graphicsData[1].shape.contains(newPosX - piluleSprite.width/2, newPosY + piluleSprite.height/2)) {
                          this.y = newPosY;
                          this.x = newPosX;
                      } else if (this.y < 0) {
                          this.dragging = false;
                          this.data = null;
                          this.interactive = false;
                          success = true;
                          audio_scene.stop_pills_shake();
                          audio_scene.fade_in_writing();
                          launchScene();
                      }
                  }
              });
        dragIcon = DragIcon(containerPill, canvasScale, true, 0x000000);
        dragIcon.setDirection(1);
        dragIcon.setPosition(sprite.x, sprite.y);
    }

    let piluleSprite;

    async function setupPill() {
        containerPill.pivot.x = containerPill.width / 2;
        containerPill.pivot.y = containerPill.height / 2;
        containerPill.x = canvasWidth / 2;
        containerPill.y = canvasHeight / 2;

        await Object.values(imgAssets).forEach((key) => {
            let keyName = Object.keys(imgAssets).find(keyName => imgAssets[keyName] === key);
            let sprite = generateSprite(key);
            setPosition(sprite, keyName);
            containerPill.addChild(sprite);
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
        graphicsPill.beginFill(0xFF0000);
        graphicsPill.drawPolygon(path2);
        graphicsPill.drawPolygon(path3);
        graphicsPill.endFill();
        graphicsPill.alpha = 0;

        containerPill.rotation = -Math.PI/12;
        containerPill.alpha = 0;
        containerPill.cacheAsBitmap = true;
    }

    function launchContainerAnim() {
        containerPill.animWiggle = Animate(-Math.PI/12, 0, Easing.easeInOutCubic, 0.5);
        containerPill.animDirection = "left";
        containerPill.animWiggle.start();
    }

    function launchPillAnim() {
        piluleSprite.animFall_x = Animate(piluleSprite.x, pilulePosInitial.x, Easing.easeInQuad, 0.1);
        piluleSprite.animFall_y = Animate(piluleSprite.y, pilulePosInitial.y, Easing.easeInQuad, 0.1);
        piluleSprite.animFall_x.start();
        piluleSprite.animFall_y.start();
    }

    function hitBoxTest() {
        return !graphicsPill.graphicsData[0].shape.contains(piluleSprite.x - piluleSprite.width/2, piluleSprite.y + piluleSprite.height/2)
                           || !graphicsPill.graphicsData[0].shape.contains(piluleSprite.x + piluleSprite.width/2, piluleSprite.y - piluleSprite.height/2);
    }

    function gameLoopPill() {
        if (piluleSprite.dragging) {
            if (hitBoxTest()) {
                containerPill.animWiggle = "";
                containerPill.rotation = -Math.PI/12;
                piluleSprite.dragging = false;
                piluleSprite.interactive = false;
                launchPillAnim();
            }
        }

        if (piluleSprite.animFall_x && piluleSprite.animFall_y) {
            if (piluleSprite.animFall_x.is_running || piluleSprite.animFall_y.is_running) {
                piluleSprite.x = piluleSprite.animFall_x.tick();
                piluleSprite.y = piluleSprite.animFall_y.tick();
            }

            if (piluleSprite.animFall_x.is_ended_signal && piluleSprite.animFall_y.is_ended_signal) {
                audio_scene.pill_fail_sound();
               piluleSprite.animFall_x = null;
               piluleSprite.animFall_y = null;
               piluleSprite.interactive = true;
               launchContainerAnim();
               dragIcon.initIconAnim(0, 0.7);
               dragIcon.startIconAnim();
            }

        }

        if (containerPill.animWiggle.is_running) {
            containerPill.rotation = containerPill.animWiggle.tick();
        }
        if (containerPill.animWiggle.is_ended_signal) {
            if (containerPill.animDirection === "left") {
                containerPill.animWiggle = Animate(0, -Math.PI/12, Easing.easeInOutCubic, 0.5);
                containerPill.animWiggle.start();
                containerPill.animDirection = "right";
            } else {
                containerPill.animWiggle = Animate(-Math.PI/12, 0, Easing.easeInOutCubic, 0.5);
                containerPill.animWiggle.start();
                containerPill.animDirection = "left";
            }
        }
    }

    let success = false;

    function launchScene() {
      currentScene = null;

      if (success) {
          containerEye.animOpacity = Animate(0, 1, Easing.easeInQuad, 0.01);
          containerPill.animOpacity = Animate(1, 0, Easing.easeInQuad, 0.01);
          containerEye.cacheAsBitmap = true;
          containerPill.cacheAsBitmap = true;
      } else {
          containerEye.animOpacity = Animate(1, 0, Easing.easeInQuad, 0.01);
          containerPill.animOpacity = Animate(0, 1, Easing.easeInQuad, 0.01);
          containerEye.cacheAsBitmap = true;
          containerPill.cacheAsBitmap = false;
      }
      containerEye.animOpacity.start();
      containerPill.animOpacity.start();
    }

    function gameLoopEye() {
       if (scaleAnim.is_running || heightAnim.is_running) {
           height = heightAnim.tick();
           scale = scaleAnim.tick();
           graphicsEye.clear();
           graphicsEye.beginFill(0x000000);
           graphicsEye.moveTo(0, 0);
           graphicsEye.bezierCurveTo(50 * canvasScale, -100 * height * canvasScale, canvasWidth - 50 * canvasScale, -100 * height * canvasScale, canvasWidth, 0);
           graphicsEye.moveTo(0, 0);
           graphicsEye.bezierCurveTo(50 * canvasScale, 100 * height * canvasScale, canvasWidth - 50 * canvasScale, 100 * height * canvasScale, canvasWidth, 0);
           graphicsEye.position.set(canvasWidth/2, canvasHeight/2);
           graphicsEye.pivot.set(canvasWidth/2, height/2);
           graphicsEye.scale.set(scale);
           graphicsEye.endFill();
       }

       if (blurAnim.is_running) {
           background.filters[0].blur = blurAnim.tick();
       }

       if (blurAnim.is_ended_signal) {
           if (success) {
               background.filters[0].blur = 0;
               setTimeout(() => {
                   dispatch("next", true);
                   audio_scene.destroy();
               }, 2000);
           } else {
               launchScene();
           }
       }
    }

    function launchClosedEye() {
        Sequence()
            .add(5000, () => {
                scaleAnim.start();
                heightAnim.start();
                blurAnim.start();
                audio_scene.fade_out_writing();
            })
            .start();
    }

    function launchBlurAnim() {
        blurAnim = Animate(4, 0, Easing.easeInQuad, 0.025);
        blurAnim.start();
    }

    function gameLoop() {
        if (currentScene === "eye") {
            gameLoopEye();
        }

        if (currentScene === "pill") {
            gameLoopPill();
        }

        if (containerEye.animOpacity && containerPill.animOpacity) {
           if (containerEye.animOpacity.is_running && containerPill.animOpacity.is_running) {
               containerEye.alpha = containerEye.animOpacity.tick();
               containerPill.alpha = containerPill.animOpacity.tick();
           }

           if (containerEye.animOpacity.is_ended_signal && containerPill.animOpacity.is_ended_signal) {
               if (success) {
                   currentScene = "eye";
                   containerEye.cacheAsBitmap = false;
                   launchBlurAnim();
               } else {
                   audio_scene.start_pills_shake();
                   currentScene = "pill";
                   containerPill.cacheAsBitmap = false;
                   dragIcon.initIconAnim(0, 0.7);
                   dragIcon.startIconAnim();
                   launchContainerAnim();
               }
           }
        }

        dragIcon.loop();
    }

    onDestroy(() => {
        unsubscribe();
        app.ticker.stop();
    });
</script>

<style>
    .background {
        position: absolute;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-color: white;
        z-index: -1;
    }
</style>

<div class="background" style="background-image: url({lightBackground}); width:{Math.floor(canvasSize.canvasWidth)}px; height:{Math.floor(canvasSize.canvasHeight)}px"></div>
<Canvas {canvasSize} on:pixiApp="{init}"></Canvas>
