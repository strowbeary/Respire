<script>
    /*
    * MODULES
    * */
    import {fly, fade} from 'svelte/transition';
    import { onMount, afterUpdate, createEventDispatcher} from 'svelte';

    /*
    * RESSOURCES
    * */
    import SandVertical from "assets/images/carton/sandVerticalWhite.png";
    import SandHorizontal from "assets/images/carton/sandHorizontalWhite.png";

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

    const dispatch = createEventDispatcher();

    $: scaleFactor = innerHeight ? Math.round(innerHeight/824) : Math.round(window.innerHeight/824);
    $: circleRadius = scaleFactor * 30;
    $: circleTransform = `translate3d(0, ${circleTransformValue}px, 0)`;
    $: sandVerticalImg = `url(${SandVertical})`;
    $: sandHorizontalLevel = `translate3d(0, ${sandLevel}%, 0)`;

    onMount(() => {
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

        let end = start + (-100 + circleRadius) * scaleFactor;
        if (y > start) {
            circleTransformValue = 0;
        } else if (y < end) {
            circleTransformValue = (-100 + circleRadius) * scaleFactor;
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
            if (circleTransformValue === (-100 + circleRadius) * scaleFactor) {
                dispatch('next');
            } else {
                isPointerDown = false;
            }
        }
    }
</script>

<style>
    @keyframes wiggle {
        0% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
        }
        30% {
            opacity: 1;
        }
        100% {
            transform: translate3d(0, calc(var(--scaleFactor) * (-100px + 15px)), 0);
            opacity: 0;
        }
    }

    .carton {
        position: absolute;
        height: calc(100% - 2 * calc(var(--scaleFactor) * 35px));
        max-width: 100%;
        font-family: 'Arial', 'sans-serif';
        padding: calc(var(--scaleFactor) * 35px);
        background-color: black;
        color: white;
        z-index: 1;
        display: flex;
        justify-content: center;
    }
    .carton__text {
        height: 100%;
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
        position: absolute;
        display: flex;
        justify-content: center;
        bottom: calc(var(--scaleFactor) * 35px);
    }

    .loop {
        animation: wiggle 1.5s infinite ease-out;
    }

    .icon__circle {
        display: block;
        border-radius: 50%;
        border: solid calc(var(--scaleFactor) * 2px) #fff;
        background-color: black;
        width: calc(var(--scaleFactor) * 30px);
        height: calc(var(--scaleFactor) * 30px);
        transform: var(--circleTransform);
    }

    .icon__line {
        display: block;
        position: absolute;
        top: -200%;
        background-color: #fff;
        width: 2px;
        height: 100px;
        z-index: -1;
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
        top: -100%;
        height: 100%;
        overflow:hidden;
        z-index: 3;
    }
    .sand--container.falling {
        animation: falling linear 5s both;
    }

    .sand--vertical {
        position: absolute;
        background-image: var(--sandVerticalImg);
        background-size: 100%;
        width: 100%;
        height: 100%;
    }
    .sand--vertical.falling {
        animation: falling linear 5s 5s infinite;
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
            <span class="icon__line"></span>
            <span class="icon__circle" class:loop="{!isPointerDown}" style="--circleTransform:{circleTransform}"></span>
       </div>
    {/if}
    <div class="sand sand--container" class:falling={ready}>
        <div class="sand--vertical sand--vertical--top" class:falling={ready} style="--sandVerticalImg:{sandVerticalImg}"></div>
        <div class="sand--vertical" class:falling={ready} style="--sandVerticalImg:{sandVerticalImg}"></div>
    </div>
    <img src="{SandHorizontal}" alt="sand" class="sand sand--horizontal" style="--sandHorizontalLevel:{sandHorizontalLevel}"/>
</div>
{/if}
