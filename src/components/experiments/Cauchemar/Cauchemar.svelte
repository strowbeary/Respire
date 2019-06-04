<script>
    /*
    * MODULES
    * */
    import {onMount, afterUpdate} from 'svelte';
    import {fade} from 'svelte/transition';
    import {createEventDispatcher} from 'svelte';
    import Carton from 'components/Carton.svelte';
    import PreparationAnim from 'components/experiments/Cauchemar/PreparationAnim.svelte';
    import {Animate, Easing, Sequence} from "lib/TimingKit";
    /*
    * RESSOURCES
    * */
    import placeholderVideo from 'assets/videos/placeholder.webm';
    import cadre from "assets/images/cauchemar/cadre.png";
    import lightBackground from "assets/images/light_background.png";
    import {init_cauchemar_sound_scene} from "components/experiments/Cauchemar/Cauchemar.sound";
    export let canvasSize;

    const carton_data ={
        titleName: "Dans le brouillard",
        timeContext: "24 heures avant l'examen",
        spaceContext: "Chambre"
    };
    let display_carton = true;
    let is_ready = false;

    let videoVisibility = true;
    let iconVisibility = true;

    const dispatch = createEventDispatcher();

    let icon;
    let isPointerDown = false;
    let circleTransformValue = 0;
    let innerHeight;
    let alarmClock;
    let videoComponent;
    let circleResetAnim;
    let loop;
    let current_preparation_anim = "";

    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;
    $: circleRadius = 35 * scaleFactor;
    $: circleTransform = `translate3d(${circleTransformValue}px, 0, 0)`;
    $: opacityDay = circleTransformValue / (200 * scaleFactor - circleRadius);

    let audio_scene;

    init_cauchemar_sound_scene().then(a => {
        audio_scene = a;
        audio_scene.start_audio();
        is_ready = true;
    });
    async function init() {
          display_carton = false;
          videoComponent.play();
    }

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
        } else if (x > end - circleRadius) {
            circleTransformValue = 200 * window.innerHeight / 824 - circleRadius;
        } else {
            circleTransformValue = x - start - circleRadius;
        }
    }

    function onPointerDown(e) {
        if (icon) {
            let x = 0;
            if (e.touches) {
                x = e.touches[0].clientX;
            } else {
                x = e.clientX;
            }
            let start = icon.getBoundingClientRect().left;
            if (Math.abs(start - x) < 50) {
                e.preventDefault();
                isPointerDown = true;
                updateCirclePosition(e);
            }
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
            if (circleTransformValue === (200 * window.innerHeight / 824 - circleRadius)) {
                iconVisibility = false;
                isPointerDown = false;
                audio_scene.stop_alarm_clock();

                audio_scene.play_preparation_sound();
                Sequence()
                    .add(11827, () => current_preparation_anim = "jeans")
                    .add(9604, () => current_preparation_anim = "coffee")
                    .add(19914, () => current_preparation_anim = "")
                    .add(9337, () => {
                        audio_scene.destroy();
                        dispatch("next");
                    })
                    .start();
            } else {
                circleResetAnim = Animate(circleTransformValue, 0, Easing.easeInQuad, 0.05);
                circleResetAnim.start();
                loop = requestAnimationFrame(reset);
                isPointerDown = false;
            }
        }
    }

    function reset() {
        if (circleTransformValue > 0) {
            circleTransformValue = circleResetAnim.tick();
            loop = requestAnimationFrame(reset);
        } else {
            cancelAnimationFrame(loop);
        }
    }

    function onFirstVideoEnd() {
        videoVisibility = false;
        audio_scene.trigger_alarm_clock();
    }

    function next() {
        dispatch("next");
    }
</script>

<style>
    @keyframes wiggle {
        0% {
            transform: translateX(0);
            opacity: 1;
        }
        50% {
            opacity: 1;
        }
        100% {
            transform: translateX(calc(var(--scaleFactor) * 220px));
            opacity: 0;
        }
    }

    .alarmClock {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: black;
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
        width: calc(var(--scaleFactor) * 70px);
        height: calc(var(--scaleFactor) * 70px);
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
        background-size: cover;
        mix-blend-mode: difference;
        z-index: 1;
        opacity: var(--opacityDay);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .hour {
        position: absolute;
        color: white;
        font-size: calc(var(--scaleFactor) * 85px);
        font-family: 'BeatriceDisplayDA', 'serif';
        letter-spacing: 10px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        padding: 30px;
        filter: blur(1px);
        opacity: calc(1 - var(--opacityDay)*2);
        pointer-events: none;
        z-index: 2;
    }

    @keyframes wink {
        0%, 100% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
    }

    .hour_number {
        animation: wink 1s linear infinite;
    }

    video {
        object-fit: cover;
        width: 100%;
        height: 100%;
    }
</style>

<svelte:window bind:innerHeight={innerHeight}></svelte:window>
<Carton {...carton_data} visible={display_carton} ready={is_ready} sandLevel="80" on:next={init}></Carton>
{#if videoVisibility}
    <video
        out:fade
        bind:this="{videoComponent}"
        src={placeholderVideo}
        on:ended={onFirstVideoEnd}
    ></video>
{/if}
<div class="alarmClock"
    out:fade
    style="--scaleFactor:{scaleFactor};--opacityDay:{opacityDay}"
    on:mousemove="{onPointerMove}"
    on:touchmove|passive="{onPointerMove}"
    on:mouseup="{onPointerUp}"
    on:touchend|passive="{onPointerUp}"
    bind:this="{alarmClock}">
    <div class="hour" style="background-image: url({cadre})">
        <span class="hour_number">08:00</span>
    </div>
    <div class="day" style="background-image: url({lightBackground})">
        {#if opacityDay >= 1}
            <PreparationAnim value="{current_preparation_anim}"></PreparationAnim>
        {/if}
    </div>
    {#if iconVisibility}
        <div class="icon"
             bind:this="{icon}"
             transition:fade
             on:mousedown="{onPointerDown}"
             on:touchstart|passive="{onPointerDown}">
             <div class="icon__line"></div>
             <span class="icon__circle" class:loop="{!isPointerDown}" style="--circleTransform:{circleTransform}"></span>
        </div>
    {/if}
</div>
