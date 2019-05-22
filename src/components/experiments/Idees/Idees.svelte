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
    import PixiApngAndGif from 'pixi-apngandgif'
	/*
	* RESSOURCES
	* */
    import Idea from "assets/images/idees/Idea.png";

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
        Container = PIXI.Container;

    let app, canvasWidth, canvasHeight;
    let container = new Container();

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
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        return sprite;
    }

    function positionFromCanvasWidth(number) {
      return number * canvasWidth;
    }

    function setPosition(keyName) {
         switch(keyName){
            case "Idea":
                ideas[keyName].positions = {start: 0.15, end: -ideas[keyName].width/2};
                ideas[keyName].position.set(ideas[keyName].positions.end, canvasHeight * 0.9);
                break;
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
        if (Object.keys(ideas).length < 10) {
            let assetKey = keyName.split('-')[0];
            let clone = generateAnimatedSprite(imgAssets[assetKey]);
            clone.position.set(sprite.position.x, sprite.position.y);
            clone.alpha = 0;
            clone.parentKey = keyName;
            let index = Object.values(ideas).filter(idea => idea._texture.textureCacheIds[0] === sprite._texture.textureCacheIds[0]).length;
            let name = assetKey + '-' + index;
            ideas[name] = clone;
            let parent = ideas[keyName];
            parent.childKey = name;
            //ideas[keyName].anim_scale = Animate(1, 1.2, Easing.linear, 0.001);
            //clone.anim_scale = Animate(1, 1.2, Easing.linear, 0.001);
            clone.anim_opacity = Animate(0, 1, Easing.linear, 0.001);
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
        sprite.anim_scale_y = Animate(1, 0.5, Easing.easeInOutQuad, 0.05);
        parent.anim_scale_y = Animate(1, 0.5, Easing.easeInOutQuad, 0.05);
        sprite.anim_position_y = Animate(sprite.position.y, sprite.position.y - 100, Easing.easeInOutQuad, 0.01);
        parent.anim_position_y = Animate(parent.position.y, parent.position.y + 100, Easing.easeInOutQuad, 0.01);
        sprite.anim_scale_y.start();
        parent.anim_scale_y.start();
        sprite.anim_position_y.start();
        parent.anim_position_y.start();
    }

    let animatedSprite;

    function onDragEnd() {
        if (this.dragging) {
            this.dragging = false;
            this.data = null;

            if ((this.x > -this.width/2 || this.x < canvasWidth + this.width/2) && this.childKey) {
                ideas[sprite.childKey].anim_opacity = Animate(0, 1, Easing.linear, 0.001);
                ideas[sprite.childKey].anim_opacity.start()
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

                      if (this.childKey) {
                          ideas[sprite.childKey].anim_opacity = null;
                          ideas[sprite.childKey].alpha = 0;
                      }
                  }
              })
              .on('pointerup', onDragEnd)
              .on('pointerupoutside', onDragEnd)
              .on('pointermove', function () {
                  if (this.dragging) {
                      let newPos = this.data.getLocalPosition(this.parent).x + this.offset;
                      this.x = newPos;

                      if (sprite.childKey) {
                          ideas[sprite.childKey].x = newPos;
                      }
                  }
              });
    }

    async function setup() {
        Object.values(imgAssets).forEach((resourceKey) => {
            let keyName = Object.keys(imgAssets).find(keyName => imgAssets[keyName] === resourceKey);
            let sprite = generateAnimatedSprite(resourceKey);
            ideas[keyName] = sprite;
            setPosition(keyName);
            setInteractive(sprite);
            sprite.interactive = true;
            container.addChild(sprite);
        });
        setTimeout(() => {
            setAppearAnimation("Idea");
        }, 10000);
        app.ticker.add(delta => gameLoop(delta));
        is_ready = true;
    }

    function setAppearAnimation(keyName) {
        let sprite = ideas[keyName];
        sprite.anim_position_x = Animate(sprite.positions.end, positionFromCanvasWidth(sprite.positions.start), Easing.linear, 0.03);
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
                /*if (ideas[property].anim_scale) {
                    let sprite = ideas[property];
                    if (sprite.anim_scale.is_running) {
                        sprite.scale.set(sprite.anim_scale.tick());
                    }
                }*/
                if (ideas[property].anim_scale_y) {
                    let sprite = ideas[property];
                    if (sprite.anim_scale_y.is_running) {
                        sprite.scale.set(1, sprite.anim_scale_y.tick());
                    }

                    if (sprite.anim_scale_y.is_ended_signal) {
                        if (Math.abs(sprite.scale.y - 1) > 0.2) {
                           sprite.anim_scale_y = Animate(0.5, 1, Easing.easeInQuad, 0.1);
                           sprite.anim_scale_y.start();
                        }
                        sprite.interactive = true;
                    }
                }
                if (ideas[property].anim_position_y) {
                    let sprite = ideas[property];
                    if (sprite.anim_position_y.is_running) {
                        sprite.position.set(sprite.position.x, sprite.anim_position_y.tick());
                    }
                    if (sprite.anim_position_y.is_ended_signal) {
                        if (sprite.parentKey) {
                            sprite.parentKey = "";
                            create_clone(sprite, property);
                        }
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
