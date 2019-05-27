<script>
    /*
    * MODULES
    * */
    import {fade} from 'svelte/transition';
    import {createEventDispatcher} from 'svelte';
    import AppWrapper from 'components/AppWrapper.svelte';
    import Carton from 'components/Carton.svelte';
    import PreparationAnim from 'components/experiments/Cauchemar/PreparationAnim.svelte';

    /*
    * RESSOURCES
    * */
    import placeholderVideo from 'assets/videos/placeholder.webm';

    const carton_data ={
        titleName: "Dans le brouillard",
        timeContext: "24 heures avant l'examen",
        spaceContext: "Chambre"
    };
    let display_carton = true;
    let is_ready = true;
    let videoVisibility = true;
    let iconVisibility = true;

    const dispatch = createEventDispatcher();

    let icon;
    let isPointerDown = false;
    let circleTransformValue = 0;
    let circleRadius = 15 * window.innerHeight / 824;
    let innerHeight;
    let alarmClock;
    let videoComponent;

    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;
    $: circleTransform = `translate3d(${circleTransformValue}px, 0, 0)`;
    $: opacityDay = circleTransformValue / (200 * scaleFactor);

    function updateCirclePosition(e) {
        let x = 0;
        if(e.touches) {
            x = e.touches[0].clientX;
        } else {
            x = e.clientX;
        }
        let start = icon.getBoundingClientRect().left;
        let end = icon.getBoundingClientRect().right;
        if (x < start) {
            circleTransformValue = -circleRadius;
        } else if (x > end) {
            circleTransformValue = 200 * window.innerHeight / 824;
        } else {
            circleTransformValue = x - start - circleRadius;
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
            if (circleTransformValue === (200 * window.innerHeight / 824)) {
                iconVisibility = false;
                isPointerDown = false;
            } else {
                isPointerDown = false;
            }
        }
    }

    function onFirstVideoEnd() {
        videoVisibility = false;
    }
</script>

<style>
    @keyframes wiggle {
        0% {
            transform: translateX(0);
            opacity: 1;
        }
        30% {
            opacity: 1;
        }
        100% {
            transform: translateX(220px);
            opacity: 0;
        }
    }

    .alarmClock {
        position: absolute;
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
        z-index: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .icon {
        width: calc(var(--scaleFactor) * 220px);
        position: absolute;
        bottom: calc(var(--scaleFactor) * 35px * 2);
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
        position: absolute;
        top: 50%;
        border-top: dashed calc(var(--scaleFactor) * 2px) #fff;
        background-color: transparent;
        width: 100%;
        z-index: -1;
    }

    .icon__line:after {
        content: "";
        display: block;
        position: absolute;
        top: -5px;
        right: 0;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: solid 1px #fff;
        background-color: black;
    }

    .day {
        position: absolute;
        pointer-events: none;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #fff;
        mix-blend-mode: difference;
        z-index: 1;
        opacity: var(--opacityDay);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .hour {
        color: white;
        font-size: calc(var(--scaleFactor) * 85px);
        font-family: 'BeatriceDisplayDA', 'serif';
        letter-spacing: 10px;
        border: solid 1px white;
        padding: 10px;
        filter: blur(1px);
        opacity: calc(1 - var(--opacityDay));
    }

    video {
        object-fit: cover;
    }
</style>

<svelte:window bind:innerHeight={innerHeight}></svelte:window>
<AppWrapper let:canvasSize={canvasSize}>
    <div slot="scene">
        <Carton {...carton_data} visible={display_carton} ready={is_ready} sandLevel="80" on:next={() => {
            videoComponent.play();
            display_carton = false;
        }}></Carton>
        {#if canvasSize.canvasWidth && videoVisibility}
            <video
                out:fade
                width="{canvasSize.canvasWidth}"
                height="{canvasSize.canvasHeight}"
                bind:this="{videoComponent}"
                src={placeholderVideo}
                on:ended={onFirstVideoEnd}
            ></video>
        {/if}
        <div class="alarmClock"
            out:fade
            style="--scaleFactor:{scaleFactor};--opacityDay:{opacityDay}"
            on:pointermove="{onPointerMove}"
            on:touchmove|passive="{onPointerMove}"
            on:pointerup="{onPointerUp}"
            on:touchend|passive="{onPointerUp}"
            bind:this="{alarmClock}">
            <span class="hour">
                08:00
            </span>
            <div class="day">
                {#if opacityDay === 1}
                    <PreparationAnim value="jeans"></PreparationAnim>
                {/if}
            </div>
            {#if iconVisibility}
                <div class="icon"
                     bind:this="{icon}"
                     transition:fade
                     on:pointerdown="{onPointerDown}"
                     on:touchstart|passive="{onPointerDown}">
                     <div class="icon__line"></div>
                     <span class="icon__circle" class:loop="{!isPointerDown}" style="--circleTransform:{circleTransform}"></span>
                </div>
            {/if}
        </div>
    </div>
</AppWrapper>
