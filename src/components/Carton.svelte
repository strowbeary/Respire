<script>
    /*
    * MODULES
    * */
    import {fly, fade} from 'svelte/transition';
    import {createEventDispatcher} from 'svelte';
    import {carton_index, scene_index, carton_visible, carton_ready} from "./../stores";
    import global_sound_scene from "../global.sound";
    /*
    * RESSOURCES
    * */
    import SandVertical from "assets/images/carton/sand_vertical.png";
    import SandHorizontal from "assets/images/carton/Sand_horizontal_fixed.png";
    import lightBackground from "assets/images/light_background.png";

    const dispatch = createEventDispatcher();

    export let canvasSize;

    let index;
    carton_index.subscribe(value => {
        index = value;
    });

    let fade_out_sand = () => {};
    let fade_in_sand = () => {};
    global_sound_scene.then(scene => {
        fade_out_sand = scene.fade_out_sable;
        fade_in_sand = scene.fade_in_sable;
    });


    let visible;
    let corpusVisible = true;
    carton_visible.subscribe(value => {
        visible = value;
        if (index === 1 && visible) {
            corpusVisible = false;
        }
    });

    let ready;
    carton_ready.subscribe(value => {
       ready = value;
       if (!corpusVisible) {
           corpusVisible = true;
       }
       if(ready) {
           fade_in_sand();
       }
    });

    let icon;
    let isPointerDown = false;
    let innerHeight;
    let carton;

    const data = [
        {
            titleName: "Dans le brouillard",
            timeContext: "24 heures avant l'examen",
            spaceContext: "Chambre",
            sandLevel: 80
        },
        {
            titleName: "À contre-courant",
            timeContext: "18 heures avant l'examen",
            spaceContext: "Amphithéâtre",
            sandLevel: 70
        },
        {
            titleName: "Les idées noires",
            timeContext: "17 heures avant l'examen",
            spaceContext: "Amphithéâtre",
            sandLevel: 50
        },
        {
            titleName: "Noctambule",
            timeContext: "7 heures avant l'examen",
            spaceContext: "Chambre",
            sandLevel: 30
        },
        {
            titleName: "Dernière ligne droite",
            timeContext: "5 minutes avant l'examen",
            spaceContext: "Couloir de la fac",
            sandLevel: 10
        }
    ];

    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;
    $: sandVerticalImg = `url(${SandVertical})`;
    $: titleName = index > -1? data[index]["titleName"] : null;
    $: timeContext = index > -1? data[index]["timeContext"] : null;
    $: spaceContext = index > -1? data[index]["spaceContext"] : null;
    $: sandLevel = index > -1? data[index]["sandLevel"] : 100;
    $: sandHorizontalLevel = `translate3d(0, ${sandLevel}%, 0)`;

    let yStart = 0;
    let yEnd = 0;
    let yCumul = [];
    let yLast;

    function onPointerDown(e) {
        if (ready) {
            if(e.touches) {
                yStart = e.touches[0].clientY;
            } else {
                yStart = e.clientY;
            }

            if (icon && yStart > parseFloat(getComputedStyle(carton).top) + canvasSize.canvasHeight/2) {
                yLast = canvasSize.canvasHeight;
                isPointerDown = true;
            }
        }
    }

    function onPointerMove(e) {
        if (isPointerDown) {
            let y;
            if (e.touches) {
                y = e.touches[0].clientY;
            } else {
                y = e.clientY;
            }
            yCumul.push(y <= yLast + 20);
            yLast = y;
        }
    }

    function onPointerUp(e) {
        if (isPointerDown) {

            if(e.type === "touchend") {
                yEnd = e.changedTouches[0].clientY;
            } else {
                yEnd = e.clientY;
            }

            if (yEnd < yStart - canvasSize.canvasHeight/10 &&
                !yCumul.includes(false)) {
                carton_visible.setToFalse();
                fade_out_sand();
            } else {
                yStart = 0;
                yEnd = 0;
                isPointerDown = false;
                yCumul = [];
            }
        }
    }

    function nextScene(e) {
        if (e.target === carton) {
            if (visible && !ready) {
                dispatch("nextScene");
            } else if (!visible && ready) {
                carton_ready.setToFalse();
                isPointerDown = false;
            }
        }
    }


</script>

<style>
    @keyframes wiggle {
        0%, 100% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        80% {
            transform: translate3d(0, calc(var(--scaleFactor) * -95px), 0);
        }
        90% {
            opacity: 0;
        }
    }

    .carton {
        position: absolute;
        width: 100%;
        height: 100%;
        font-family: 'Arial', 'sans-serif';
        color: black;
        background-color: white;
        background-size: cover;
        z-index: 2;
        display: flex;
        justify-content: center;
        transition: opacity 1s ease-in;
        opacity: 0;
        pointer-events: none;
    }
    .carton__text {
        height: 100%;
        padding: calc(var(--scaleFactor) * 35px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .carton__titleName {
        font-size: calc(var(--scaleFactor) * 60px);
        text-align: center;
        color: transparent;
        text-shadow: 0 0 1px #000;
        margin-bottom: calc(var(--scaleFactor) * 40px);
        font-family: 'BeatriceDisplayDA', 'serif';
        font-weight: 100;
        letter-spacing: 2px;
    }

    .carton__timeContext {
        font-size: calc(var(--scaleFactor) * 16px);
        margin-bottom: calc(var(--scaleFactor) * 40px);
        font-family: 'TTCommons', 'serif';
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .carton__spaceContext {
        font-size: calc(var(--scaleFactor) * 16px);
        font-family: 'TTCommons', 'serif';
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .icon {
        width: 100%;
        height: calc(100 * var(--scaleFactor));
        position: absolute;
        display: flex;
        justify-content: center;
        bottom: calc(var(--scaleFactor) * 35px);
    }

    .loopCircle {
        animation: wiggle 1.5s infinite ease-out;
    }

    .icon__circle {
        display: flex;
        justify-content: center;
        border-radius: 50%;
        border: solid calc(var(--scaleFactor) * 1px) #000;
        width: calc(var(--scaleFactor) * 70px);
        height: calc(var(--scaleFactor) * 70px);
        opacity: 0;
    }

    .sand {
        position: absolute;
        width: 100%;
        pointer-events: none;
    }

    .sand--horizontal {
        bottom: 0;
        transform: var(--sandHorizontalLevel);
        z-index: 2;
        mix-blend-mode: difference;
    }

    .sand--container {
        top: 0;
        height: 100%;
        overflow:hidden;
        z-index: 3;
        opacity: 0;
        transition: opacity linear 2s;
    }
    .sand--container.fadeIn {
        opacity: 1;
    }

    .sand--vertical {
        position: absolute;
        background-image: var(--sandVerticalImg);
        background-size: 100%;
        width: 100%;
        height: 100%;
    }

    .sand--vertical--right {
        left: 6px;
    }

    .sand--vertical--right.sand--vertical.falling {
        animation: falling linear 4s infinite;
    }

    .sand--vertical.falling {
        animation: falling linear 5s infinite;
    }

    .sand--vertical--top {
        top: -100%;
    }

    .visible {
        pointer-events: all;
        opacity: 1;
    }
</style>

<svelte:window bind:innerHeight={innerHeight}></svelte:window>
<div class="carton"
    class:visible="{visible}"
    style="--scaleFactor:{scaleFactor};background-image: url({lightBackground});--sandVerticalImg:{sandVerticalImg}"
    on:transitionend="{nextScene}"
    on:mousedown="{onPointerDown}"
    on:touchstart|passive="{onPointerDown}"
    on:mousemove="{onPointerMove}"
    on:touchmove|passive="{onPointerMove}"
    on:mouseup="{onPointerUp}"
    on:touchend|passive="{onPointerUp}"
    bind:this="{carton}">
    {#if corpusVisible}
        <div class="carton__text">
            <p class="carton__timeContext" in:fly|local="{{ y: 20, duration: 1500, delay: 500 }}">{timeContext}</p>
            <h3 class="carton__titleName" in:fly|local="{{ y: 20, duration: 1500, delay: 900 }}">{titleName}</h3>
            <p class="carton__spaceContext" in:fly|local="{{ y: 20, duration: 1500, delay: 1300 }}">{spaceContext}</p>
        </div>
    {/if}
    {#if ready && !isPointerDown}
        <div class="icon"
             bind:this="{icon}">
             <span class="icon__circle" class:loopCircle="{!isPointerDown}"></span>
        </div>
    {/if}
    <div class="sand sand--container" class:fadeIn="{ready}">
        <div class="sand--vertical sand--vertical--top falling"></div>
        <div class="sand--vertical falling"></div>
        <div class="sand--vertical sand--vertical--top sand--vertical--right falling"></div>
        <div class="sand--vertical sand--vertical--right falling"></div>
    </div>
    {#if corpusVisible}
        <img src="{SandHorizontal}" in:fade|local alt="sand" class="sand sand--horizontal" style="--sandHorizontalLevel:{sandHorizontalLevel}"/>
    {/if}
</div>
