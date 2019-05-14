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
    export let titleName ;
    export let spaceContext;
    export let ready;
    export let visible;
    export let sandLevel = 0;

    let icon;
    let isPointerDown = false;
    let circleTransformValue = 0;
    let innerHeight;

    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;
    $: circleRadius = scaleFactor * 15;
    $: circleTransform = `translate3d(0, ${circleTransformValue}px, 0)`;
    $: sandVerticalImg = `url(${SandVertical})`;
    $: sandHorizontalLevel = `translate3d(0, ${sandLevel}%, 0)`;
    $: iconLineHeightValue = (100 * scaleFactor - circleRadius) + circleTransformValue;
    $: iconLineHeight = `${iconLineHeightValue}px`;
    onMount(async () => {
        const global_audio_scene = await global_audio_scene_init();
        global_audio_scene.fade_in_nappe();
        visible = true;
    });

    function updateCirclePosition(e) {
        let y = 0;
        if(e.touches) {
            y = e.touches[0].clientY;
        } else {
            y = e.clientY;
        }
        let start = icon.getBoundingClientRect().top;

        let end = start - 100 * scaleFactor;
        if (y > start) {
            circleTransformValue = 0;
        } else if (y < end) {
            circleTransformValue = -100 * scaleFactor;
        } else {
            circleTransformValue = y - start;
        }
    }

    function onPointerDown(e) {
        if (icon) {
            e.preventDefault();
            isPointerDown = true;
            updateCirclePosition(e);
        }
    }

    function onPointerMove(e) {
        if (isPointerDown) {
            updateCirclePosition(e);
        }
    }

    function onPointerUp(e) {
        if (isPointerDown) {
            e.preventDefault();
            if (circleTransformValue === -100 * scaleFactor) {
                dispatch('next');
            } else {
                isPointerDown = false;
                circleTransformValue = 0;
            }
        }
    }
</script>

<style>
    @keyframes wiggle {
        0% {
            transform: translate3d(0, 0, 0);
        }
        100% {
            transform: translate3d(0, calc(var(--scaleFactor) * -100px), 0);
        }
    }

    @keyframes drawLine {
        0% {
            height: calc(var(--scaleFactor) * 85px);
        }
        80%, 100% {
           height: 0;
        }
    }

    .carton {
        position: absolute;
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
        font-family: 'Arial', 'sans-serif';
        background-color: black;
        color: white;
        z-index: 1;
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

    .carton__titleName {
        font-size: calc(var(--scaleFactor) * 50px);
        text-align: center;
        margin-bottom: calc(var(--scaleFactor) * 50px);
    }

    .carton__timeContext {
        font-size: calc(var(--scaleFactor) * 16px);
        text-transform: uppercase;
        margin-bottom: calc(var(--scaleFactor) * 20px);
    }

    .carton__spaceContext {
        font-size: calc(var(--scaleFactor) * 16px);
        font-style: italic;
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

    .loopLine {
        animation: drawLine 1.5s infinite ease-out;
    }

    .icon__circle {
        display: block;
        border-radius: 50%;
        border: solid calc(var(--scaleFactor) * 2px) #fff;
        width: calc(var(--scaleFactor) * 30px);
        height: calc(var(--scaleFactor) * 30px);
        transform: var(--circleTransform);
    }

    .icon__line {
        display: flex;
        justify-content: center;
        position: absolute;
        top: calc(var(--scaleFactor) * -85px);
        background-color: #fff;
        width: 2px;
        height: var(--iconLineHeight);
        z-index: -1;
    }

    .icon__line:before {
        content: "";
        display: block;
        flex-shrink: 0;
        width: calc(var(--scaleFactor) * 4px);
        height: calc(var(--scaleFactor) * 4px);
        border-radius: 50%;
        border: solid calc(var(--scaleFactor) * 2px) #fff;
        background-color: black;
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
    out:fade
    style="--scaleFactor:{scaleFactor}"
    on:pointermove="{onPointerMove}"
    on:touchmove="{onPointerMove}"
    on:pointerup="{onPointerUp}"
    on:touchend="{onPointerUp}">
    <div class="carton__text">
        <p class="carton__timeContext" in:fly="{{ y: 20, duration: 1000, delay: 500 }}">{timeContext}</p>
        <h3 class="carton__titleName" in:fly="{{ y: 20, duration: 1000, delay: 700 }}">{titleName}</h3>
        <p class="carton__spaceContext" in:fly="{{ y: 20, duration: 1000, delay: 900 }}">{spaceContext}</p>
    </div>
    {#if ready}
       <div class="icon"
            bind:this="{icon}"
            transition:fade
            on:pointerdown="{onPointerDown}"
            on:touchstart="{onPointerDown}">
            <span class="icon__line" class:loopLine="{!isPointerDown}" style="--iconLineHeight:{iconLineHeight}"></span>
            <span class="icon__circle" class:loopCircle="{!isPointerDown}" style="--circleTransform:{circleTransform}"></span>
       </div>
    {/if}
    <div class="sand sand--container" class:fadeIn="{ready}">
        <div class="sand--vertical sand--vertical--top" class:falling={ready} style="--sandVerticalImg:{sandVerticalImg}"></div>
        <div class="sand--vertical" class:falling={ready} style="--sandVerticalImg:{sandVerticalImg}"></div>
    </div>
    <img src="{SandHorizontal}" alt="sand" class="sand sand--horizontal" style="--sandHorizontalLevel:{sandHorizontalLevel}"/>
</div>
{/if}
