<script>
    /*
    * MODULES
    * */
    import {fly, fade} from 'svelte/transition';
    import {createEventDispatcher} from 'svelte';

    /*
    * RESSOURCES
    * */
    import SandVertical from "assets/images/carton/sand_vertical.png";
    import SandHorizontal from "assets/images/carton/Sand_horizontal_fixed.png";
    import lightBackground from "assets/images/light_background.png";

    const dispatch = createEventDispatcher();

    export let timeContext;
    export let titleName;
    export let spaceContext;
    export let ready;
    export let visible;
    export let sandLevel = 0;
    export let canvasSize;

    let icon;
    let isPointerDown = false;
    let innerHeight;
    let carton;

    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;
    $: sandVerticalImg = `url(${SandVertical})`;
    $: sandHorizontalLevel = `translate3d(0, ${sandLevel}%, 0)`;


    let yStart = 0;
    let yEnd = 0;
    let yCumul = [];
    let yLast;

    function onPointerDown(e) {
        if (visible) {
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
                //fade_out_sand();
                dispatch("next");
            } else {
                yStart = 0;
                yEnd = 0;
                isPointerDown = false;
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
        width: 100%;
        height: 100%;
        font-family: 'Arial', 'sans-serif';
        color: black;
        background-color: white;
        background-size: cover;
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
        width: 100%;
        height: 100%;
        background-color: white;
        background-size: cover;
        z-index: 1;
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

    .invisible {
        pointer-events: none;
    }
</style>

<svelte:window bind:innerHeight={innerHeight}></svelte:window>
{#if visible}
    <div out:fade class:invisible="{!visible}">
        <div class="carton"
            in:fade
            style="--scaleFactor:{scaleFactor};background-image: url({lightBackground})"
            on:mousedown="{onPointerDown}"
            on:touchstart|passive="{onPointerDown}"
            on:mousemove="{onPointerMove}"
            on:touchmove|passive="{onPointerMove}"
            on:mouseup="{onPointerUp}"
            on:touchend|passive="{onPointerUp}"
            bind:this="{carton}">
            <div class="carton__text">
                <p class="carton__timeContext" in:fly="{{ y: 20, duration: 1500, delay: 2000 }}">{timeContext}</p>
                <h3 class="carton__titleName" in:fly="{{ y: 20, duration: 1500, delay: 2400 }}">{titleName}</h3>
                <p class="carton__spaceContext" in:fly="{{ y: 20, duration: 1500, delay: 2800 }}">{spaceContext}</p>
            </div>
            {#if ready}
                <div class="icon"
                     bind:this="{icon}"
                     transition:fade>
                     <span class="icon__circle" class:loopCircle="{!isPointerDown}"></span>
                </div>
            {/if}
            <div class="sand sand--container" class:fadeIn="{ready}">
                <div class="sand--vertical sand--vertical--top" class:falling={ready} style="--sandVerticalImg:{sandVerticalImg}"></div>
                <div class="sand--vertical" class:falling={ready} style="--sandVerticalImg:{sandVerticalImg}"></div>
                <div class="sand--vertical sand--vertical--top sand--vertical--right" class:falling={ready} style="--sandVerticalImg:{sandVerticalImg}"></div>
                <div class="sand--vertical sand--vertical--right" class:falling={ready} style="--sandVerticalImg:{sandVerticalImg}"></div>
            </div>
            <img in:fade src="{SandHorizontal}" alt="sand" class="sand sand--horizontal" style="--sandHorizontalLevel:{sandHorizontalLevel}"/>
        </div>
        <div class="carton__background" style="background-image: url({lightBackground})"></div>
    </div>
{/if}
