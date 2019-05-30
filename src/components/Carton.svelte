<script>
    /*
    * MODULES
    * */
    import {fly, fade} from 'svelte/transition';
    import { onMount, afterUpdate, createEventDispatcher} from 'svelte';
    import global_audio_scene_init from "./../global.sound";

    /*
    * RESSOURCES
    * */
    import SandVertical from "assets/images/carton/sandVerticalWhite.png";
    import SandHorizontal from "assets/images/carton/Sand_test_horizontal 3.png";

    const dispatch = createEventDispatcher();

    export let timeContext;
    export let titleName;
    export let spaceContext;
    export let ready;
    export let visible;
    export let sandLevel = 0;

    let icon;
    let isPointerDown = false;
    let innerHeight;
    let carton;
    let fade_out_sand;

    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;
    $: sandVerticalImg = `url(${SandVertical})`;
    $: sandHorizontalLevel = `translate3d(0, ${sandLevel}%, 0)`;
    global_audio_scene_init.then(global_audio_scene => {
            fade_out_sand = global_audio_scene.fade_out_sable;
    });

    let yStart = 0;
    let xStart = 0;
    let yEnd = 0;
    let xEnd = 0;
    let xCumul = [];
    let yCumul = [];
    let yLast;

    function onPointerDown(e) {
        if (visible) {
            if(e.touches) {
                yStart = e.touches[0].clientY;
                xStart = e.touches[0].clientX;
            } else {
                yStart = e.clientY;
                xStart = e.clientX;
            }

            if (icon && yStart > parseFloat(getComputedStyle(carton).top) + parseFloat(getComputedStyle(carton).height)/2) {
                e.preventDefault();
                yLast = parseFloat(getComputedStyle(carton).height);
                isPointerDown = true;
            }
        }
    }

    function onPointerMove(e) {
        if (isPointerDown) {
            let x;
            let y;
            if (e.touches) {
                y = e.touches[0].clientY;
                x = e.touches[0].clientX;
            } else {
                y = e.clientY;
                x = e.clientX;
            }
            xCumul.push(Math.abs(x - xStart) < 50);
            yCumul.push(y <= yLast);
            yLast = y;
        }
    }

    function onPointerUp(e) {
        if (isPointerDown) {
            e.preventDefault();

            if(e.touches) {
                yEnd = e.touches[0].clientY;
                xEnd = e.touches[0].clientX;
            } else {
                yEnd = e.clientY;
                xEnd = e.clientX;
            }

            if (yEnd < yStart - parseFloat(getComputedStyle(carton).height)/10 &&
                !xCumul.includes(false) &&
                !yCumul.includes(false)) {
                fade_out_sand();
                dispatch("next");
            } else {
                yStart = 0;
                yEnd = 0;
                xStart = 0;
                xEnd = 0;
                isPointerDown = false;
                xCumul = [];
                yCumul = [];
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
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
        font-family: 'Arial', 'sans-serif';
        color: black;
        background-color: white;
        z-index: 2;
        display: flex;
        justify-content: center;
    }
    .carton__text {
        height: 100%;
        padding: calc(var(--scaleFactor) * 35px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    .carton__background {
        position: absolute;
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
        background-color: white;
        z-index: 1;
    }
    .carton__titleName {
        font-size: calc(var(--scaleFactor) * 60px);
        text-align: center;
        color: transparent;
        text-shadow: 0 0 1px #000;
        margin-bottom: calc(var(--scaleFactor) * 50px);
        font-family: 'BeatriceDisplayDA', 'serif';
        font-weight: 100;
        letter-spacing: 1px;
    }

    .carton__timeContext {
        font-size: calc(var(--scaleFactor) * 16px);
        text-transform: uppercase;
        margin-bottom: calc(var(--scaleFactor) * 20px);
        font-family: 'Optician Sans', 'serif';
    }

    .carton__spaceContext {
        font-size: calc(var(--scaleFactor) * 16px);
        font-family: 'Optician Sans', 'serif';
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
        width: calc(var(--scaleFactor) * 40px);
        height: calc(var(--scaleFactor) * 40px);
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
        transition: opacity linear 5s;
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

    .sand--vertical.falling {
        animation: falling linear 5s infinite;
    }

    .sand--vertical--top {
        top: -100%;
    }
</style>

<svelte:window bind:innerHeight={innerHeight}></svelte:window>
{#if visible}
    <div class="carton"
        transition:fade
        style="--scaleFactor:{scaleFactor}"
        on:pointerdown="{onPointerDown}"
        on:touchstart|passive="{onPointerDown}"
        on:pointermove="{onPointerMove}"
        on:touchmove|passive="{onPointerMove}"
        on:pointerup="{onPointerUp}"
        on:touchend|passive="{onPointerUp}"
        bind:this="{carton}">
        <div class="carton__text">
            <p class="carton__timeContext" in:fly="{{ y: 20, duration: 1500, delay: 500 }}">{timeContext}</p>
            <h3 class="carton__titleName" in:fly="{{ y: 20, duration: 1500, delay: 900 }}">{titleName}</h3>
            <p class="carton__spaceContext" in:fly="{{ y: 20, duration: 1500, delay: 1300 }}">{spaceContext}</p>
        </div>
        {#if ready && fade_out_sand}
           <div class="icon"
                bind:this="{icon}"
                transition:fade>
                <span class="icon__circle" class:loopCircle="{!isPointerDown}"></span>
           </div>
        {/if}
        <div class="sand sand--container" class:fadeIn="{ready}">
            <div class="sand--vertical sand--vertical--top" class:falling={ready} style="--sandVerticalImg:{sandVerticalImg}"></div>
            <div class="sand--vertical" class:falling={ready} style="--sandVerticalImg:{sandVerticalImg}"></div>
        </div>
        <img transition:fade src="{SandHorizontal}" alt="sand" class="sand sand--horizontal" style="--sandHorizontalLevel:{sandHorizontalLevel}"/>
    </div>
    {#if timeContext === "24 heures avant l'examen" || timeContext === "5 minutes avant l'examen" }
        <div class="carton__background" out:fade></div>
    {/if}
{/if}