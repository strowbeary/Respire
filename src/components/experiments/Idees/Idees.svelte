<script>
    /*
    * MODULES
    * */
    import {createEventDispatcher, onDestroy} from 'svelte';
    import Canvas from "components/Canvas.svelte";
    import AppWrapper from "components/AppWrapper.svelte";
    import * as PIXI from "pixi.js";
    import {MaskedSprite} from "utils/MaskedSprite.pixi.js";
    import {Animate, Easing} from "lib/TimingKit";
	import {init_foule_sound_scene} from "components/experiments/Foule/Foule.sound";
    import {DragIcon} from "components/effects/dragIcon";
    import Carton from "components/Carton.svelte";
    import PixiApngAndGif from 'pixi-apngandgif'
	/*
	* RESSOURCES
	* */
    import Idea from "assets/images/idees/Idea_small.png";
    import Prof from "assets/images/foule/P3.png";
    export let canvasSize;

    const dispatch = createEventDispatcher();

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
        Resource = PIXI.loaders.Resource,
        Sprite = PIXI.Sprite,
        Container = PIXI.Container,
        filters = PIXI.filters;

    let app, canvasWidth, canvasHeight;
    let container = new Container();
    let prof;
    const imgAssets = {
        Idea
    };

    const loadOption = {
        loadType: Resource.LOAD_TYPE.XHR,
        xhrType: Resource.XHR_RESPONSE_TYPE.BUFFER,
        crossOrigin:''
    };

    let ideas = [];
    let dragIcon;

    async function init(data) {
        app = data.detail.app;
        canvasWidth = data.detail.canvasWidth;
        canvasHeight = data.detail.canvasHeight;
        app.stage.addChild(container);
        dragIcon = DragIcon(app);
        loadImages();
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

    function generateAnimatedSprite(resourceKey, direction) {
        let sprite = new PixiApngAndGif(resourceKey, resources).sprite;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.scaleDefault = canvasWidth/sprite.width * 0.65;
        sprite.scale.set(sprite.scaleDefault);
        sprite.direction = direction || "up";
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
                ideas[keyName].isFirst = true;
                dragIcon.setDirection(-1);
                dragIcon.setPosition(positionFromCanvasWidth(ideas[keyName].positions.start), ideas[keyName].y);
                dragIcon.initIconAnim(0, 1);
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

    async function create_clone(sprite, keyName) {
        if (Object.keys(ideas).length < 30) {
            let assetKey = keyName.split('-')[0];
            //if multiple assets
            //let clone = generateAnimatedSprite(imgAssets[assetKey]);
            let clone = generateAnimatedSprite(imgAssets["Idea"], sprite.direction);
            let index = Object.keys(ideas).filter(key => key.includes(assetKey)).length;
            let name = assetKey + '-' + index;
            ideas[name] = clone;
            if (sprite.direction === "up") {
                if (sprite.y - sprite.height/6 > sprite.height/6) {
                    clone.position.set(sprite.x, sprite.y);
                    clone.parentKey = keyName;
                    sprite.childKey = name;
                } else {
                    clone.direction = "down";
                    let parentSprite = Object.keys(ideas)
                        .filter(key => key.includes(assetKey))
                        .map(key => ideas[key])
                        .reduce((prev, curr) => prev.y < curr.y ? prev : curr);
                    parentSprite.childKey = name;
                    clone.position.set(parentSprite.x, parentSprite.y);
                    clone.parentKey = Object.keys(ideas).filter(key => ideas[key] === parentSprite)[0];
                }
            } if (sprite.direction === "down") {
                if (sprite.y > canvasHeight - sprite.height/6) {
                    clone.position.set(sprite.x, sprite.y);
                    clone.parentKey = keyName;
                    sprite.childKey = name;
                } else {
                    clone.direction = "up";
                    let parentSprite = Object.keys(ideas)
                        .filter(key => key.includes(assetKey))
                        .map(key => ideas[key])
                        .reduce((prev, curr) => prev.y > curr.y ? prev : curr);
                    parentSprite.childKey = name;
                    clone.position.set(parentSprite.x, parentSprite.y);
                    clone.parentKey = Object.keys(ideas).filter(key => ideas[key] === parentSprite)[0];
                }
            }
            clone.alpha = 0;
            //ideas[keyName].anim_scale = Animate(1, 1.2, Easing.linear, 0.005);
            //clone.anim_scale = Animate(1, 1.2, Easing.linear, 0.005);
            clone.anim_opacity = Animate(0, 1, Easing.linear, 0.005);
            setInteractive(clone);
            //ideas[keyName].anim_scale.start();
            //clone.anim_scale.start();
            clone.anim_opacity.start();
            container.addChild(clone);
        }
    }

    function move_clone(keyName) {
        let sprite = ideas[keyName];
        let parent = ideas[sprite.parentKey];
        sprite.interactive = false;
        parent.interactive = false;
        sprite.anim_scale_y = Animate(sprite.scaleDefault, sprite.scaleDefault/2, Easing.easeInOutQuad, 0.05);
        parent.anim_scale_y = Animate(parent.scaleDefault, parent.scaleDefault/2, Easing.easeInOutQuad, 0.05);
        if (sprite.direction === "up") {
            sprite.anim_position_y = Animate(sprite.y, sprite.y - sprite.height/6, Easing.easeInOutQuad, 0.01);
            parent.anim_position_y = Animate(parent.y, parent.y + sprite.height/6, Easing.easeInOutQuad, 0.01);
        } else if (sprite.direction === "down") {
            sprite.anim_position_y = Animate(sprite.y, sprite.y + sprite.height/6, Easing.easeInOutQuad, 0.01);
            parent.anim_position_y = Animate(parent.y, parent.y - sprite.height/6, Easing.easeInOutQuad, 0.01);
        }
        if (parent.isFirst) {
            dragIcon.initIconAnim(1, 0);
            dragIcon.startIconAnim();
        }
        sprite.anim_scale_y.start();
        parent.anim_scale_y.start();
        sprite.anim_position_y.start();
        parent.anim_position_y.start();
        blurAnim = Animate(blurValue, blurValue + 0.5, Easing.easeInOutQuad, 0.01);
        blurAnim.start();
    }

    function onDragEnd() {
        if (this.dragging) {
            this.dragging = false;
            this.data = null;

            if (this.x < 0 || this.x > canvasWidth - this.width/2) {
                let keyName = Object.keys(ideas).find(key => ideas[key] === this);
                if (keyName) {
                    container.removeChild(this);
                    delete ideas[keyName];

                    blurAnim = Animate(blurValue, blurValue - 0.5, Easing.easeInOutQuad, 0.05);
                    blurAnim.start();

                    if (this.childKey) {
                        container.removeChild(ideas[this.childKey]);
                        delete ideas[this.childKey];
                        this.childKey = "";
                        let property = keyName.split('-')[0];
                        let sprites = Object.keys(ideas).filter(key => key.includes(keyName.split('-')[0]));
                        if (sprites.length > 0) {
                            let sprite = ideas[sprites[sprites.length - 1]];
                            create_clone(sprite, property);
                        }
                    }
                }
            } else if (this.childKey) {
                ideas[this.childKey].anim_opacity = Animate(0, 1, Easing.linear, 0.001);
                ideas[this.childKey].anim_opacity.start();

                if (this.isFirst) {
                    dragIcon.setPosition(this.x, this.y);
                    dragIcon.initIconAnim(0, 0.5);
                    dragIcon.startIconAnim();
                }
            } else if (this.isFirst) {
                dragIcon.setPosition(this.x, this.y);
                dragIcon.initIconAnim(0, 0.5);
                dragIcon.startIconAnim();
            }
        }
    }

    function setInteractive(sprite) {
        sprite.on('pointerdown', function (event) {
                  if (!this.dragging) {
                      this.data = event.data;
                      this.dragging = true;
                      this.offset = this.x - this.data.getLocalPosition(this.parent).x;
                      this.direction = "left";

                      if (this.isFirst) {
                          dragIcon.initIconAnim(0.5, 0);
                          dragIcon.startIconAnim();
                      }

                      if (this.childKey && ideas[this.childKey]) {
                          ideas[this.childKey].anim_opacity = null;
                          ideas[this.childKey].alpha = 0;
                      }
                  }
              })
              .on('pointerup', onDragEnd)
              .on('pointerupoutside', onDragEnd)
              .on('pointermove', function () {
                  if (this.dragging) {
                      let newPos = this.data.getLocalPosition(this.parent).x + this.offset;
                      this.x = newPos;

                      if (this.childKey && ideas[this.childKey]) {
                          ideas[this.childKey].x = newPos;
                      }
                  }
              });
    }

    async function setup() {
        prof = new Sprite(resources[Prof].texture);
        prof.scale.set((canvasWidth/prof.width) * 0.25);
        prof.anchor.x = 0.5;
        prof.anchor.y = 0.5;
        prof.position.set(canvasWidth/2, canvasHeight/2);
        prof.filters = [new filters.BlurFilter(0.1)];
        container.addChild(prof);

        for (let i = 1; i < 4; i++) {
            let sprite = generateAnimatedSprite(imgAssets["Idea"]);
            ideas["Idea"+i] = sprite;
            setPosition("Idea"+i);
            setInteractive(sprite);
            sprite.interactive = true;
            container.addChild(sprite);
        }
        //if multiple assets
        /*Object.values(imgAssets).forEach((resourceKey) => {
            let keyName = Object.keys(imgAssets).find(keyName => imgAssets[keyName] === resourceKey);
            let sprite = generateAnimatedSprite(resourceKey);
            ideas[keyName] = sprite;
            setPosition(keyName);
            setInteractive(sprite);
            sprite.interactive = true;
            container.addChild(sprite);
        });*/
        setTimeout(() => {
            setAppearAnimation("Idea1");
        }, 10000);
        setTimeout(() => {
            setAppearAnimation("Idea2");
        }, 12000);
        setTimeout(() => {
           setAppearAnimation("Idea3");
        }, 15000);
        app.ticker.add(delta => gameLoop(delta));
        is_ready = true;
    }

    function setAppearAnimation(keyName) {
        let sprite = ideas[keyName];
        sprite.anim_position_x = Animate(sprite.positions.end, positionFromCanvasWidth(sprite.positions.start), Easing.linear, 0.03);
        sprite.anim_position_x.start();
        blurAnim = Animate(blurValue, blurValue + 0.5, Easing.linear, 0.03);
        blurAnim.start();
    };

    let blurAnim;
    let blurValue = 0;

    function gameLoop() {
        dragIcon.loop();
        if (Object.keys(ideas).length > 0) {
            for (let property in ideas) {
                if (ideas[property].anim_position_x) {
                    let sprite = ideas[property];
                    if (sprite.anim_position_x.is_running) {
                        sprite.x = sprite.anim_position_x.tick();
                    }
                    if (sprite.anim_position_x.is_ended_signal) {
                        if (sprite.isFirst) {
                            dragIcon.startIconAnim();
                        }
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
                /*if (ideas[property].anim_scale) {
                    let sprite = ideas[property];
                    if (sprite.anim_scale.is_running) {
                        sprite.scale.set(sprite.anim_scale.tick());
                    }
                }*/
                if (ideas[property].anim_scale_y) {
                    let sprite = ideas[property];
                    if (sprite.anim_scale_y.is_running) {
                        sprite.scale.set(sprite.scaleDefault, sprite.anim_scale_y.tick());
                    }

                    if (sprite.anim_scale_y.is_ended_signal) {
                        if (Math.abs(sprite.scale.y - sprite.scaleDefault/2) < 0.1) {
                           sprite.anim_scale_y = Animate(sprite.scaleDefault/2, sprite.scaleDefault, Easing.easeInQuad, 0.1);
                           sprite.anim_scale_y.start();
                        }
                    }
                }
                if (ideas[property].anim_position_y) {
                    let sprite = ideas[property];
                    if (sprite.anim_position_y.is_running) {
                        sprite.y = sprite.anim_position_y.tick();
                    }
                    if (sprite.anim_position_y.is_ended_signal) {
                        if (sprite.childKey) {
                            sprite.childKey = "";
                        }
                        if (sprite.parentKey) {
                            sprite.parentKey = "";
                            create_clone(sprite, property);
                        }
                        if (sprite.isFirst) {
                           dragIcon.setPosition(sprite.x, sprite.y);
                           dragIcon.initIconAnim(0, 1);
                           dragIcon.startIconAnim();
                        }
                        sprite.interactive = true;
                    }
                }
            }
        }
        if (blurAnim) {
            if (blurAnim.is_running) {
                prof.filters[0].blur = blurAnim.tick();
            }
            if (blurAnim.is_ended_signal) {
                blurValue = blurAnim.tick();
                blurAnim = null;
            }
        }
    }

    function next() {
        display_carton = false;
    }

    onDestroy(() => {
        app.destroy();
    });
</script>

<Carton {...carton_data} visible={display_carton} ready={is_ready} sandLevel="70" on:next="{next}"></Carton>
<Canvas {appProperties} {canvasSize} on:pixiApp="{init}" bgColor="white"></Canvas>
