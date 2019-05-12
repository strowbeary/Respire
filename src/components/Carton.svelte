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
    let circleTransformValue = 80;
    let circleRadius = 20;

    const dispatch = createEventDispatcher();

    let innerHeight;
    $: scaleFactor = innerHeight/824;
    $: circleTransform = `translate3d(${circleTransformValue}px, 0, 0)`;
    $: sandVerticalImg = `url(${SandVertical})`;
    $: sandHorizontalLevel = `translate3d(0, ${sandLevel}%, 0)`;

    onMount(() => {
        visible = true;
    });

    function updateCirclePosition(e) {
        let x = e.clientX;
        let start = icon.getBoundingClientRect().left;
        let end = icon.getBoundingClientRect().right;
        if (x < start) {
            circleTransformValue = -5;
        } else if (x > end) {
            circleTransformValue = 80;
        } else {
            circleTransformValue = x - start - circleRadius;
        }
    }

    function onPointerDown(e) {
        if (icon) {
            isPointerDown = true;
            updateCirclePosition(e);
        }
    }

    function onPointerMove(e) {
        if (isPointerDown) {
            updateCirclePosition(e);
        }
    }

    function onPointerUp() {
        if (isPointerDown) {
            if (circleTransformValue === 80) {
                dispatch('next');
            } else {
                isPointerDown = false;
            }
        }
    }
</script>

<style>
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
        width: 100px;
        position: absolute;
        bottom: calc(var(--scaleFactor) * 35px * 2);
    }

    .loop {
        animation: wiggle 3s infinite;
    }

    .icon__circle {
        display: block;
        border-radius: 50%;
        border: solid 1px #fff;
        background-color: black;
        width: 30px;
        height: 30px;
        transform: var(--circleTransform);
    }

    .icon__line {
        position: absolute;
        top: 50%;
        border: solid 1px #fff;
        width: 100%;
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
        top: 0;
        height: 100%;
        overflow:hidden;
        z-index: 3;
    }

    .sand--vertical {
        position: absolute;
        background-image: var(--sandVerticalImg);
        background-size: 100%;
        width: 100%;
        height: 100%;
        animation: falling linear 5s infinite;
    }

    .sand--vertical--top {
        top: -100%;
    }
</style>

<svelte:window bind:innerHeight="{innerHeight}"/>

{#if visible}
<div class="carton" out:fade style="--scaleFactor:{scaleFactor}" on:pointerup="{onPointerUp}">
    <div class="carton__text">
        <p class="carton__timeContext" in:fly="{{ y: 20, duration: 1000, delay: 500 }}">{timeContext}</p>
        <h3 class="carton__titleName" in:fly="{{ y: 20, duration: 1000, delay: 700 }}">{titleName}</h3>
        <p class="carton__spaceContext" in:fly="{{ y: 20, duration: 1000, delay: 900 }}">{spaceContext}</p>
    </div>
    {#if ready}
       <div class="icon" bind:this="{icon}" out:fade on:pointerdown="{onPointerDown}" on:pointermove="{onPointerMove}">
            <hr class="icon__line"/>
            <span class="icon__circle" class:loop="{!isPointerDown}" style="--circleTransform:{circleTransform}"></span>
       </div>
    {/if}
    <div class="sand sand--container">
        <div class="sand--vertical sand--vertical--top" style="--sandVerticalImg:{sandVerticalImg}"></div>
        <div class="sand--vertical" style="--sandVerticalImg:{sandVerticalImg}"></div>
    </div>
    <img src="{SandHorizontal}" alt="sand" class="sand sand--horizontal" style="--sandHorizontalLevel:{sandHorizontalLevel}"/>
</div>
{/if}
