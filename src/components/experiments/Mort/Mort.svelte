<script>
    /*
    * MODULES
    * */
    import {fade} from 'svelte/transition';
    import {createEventDispatcher} from 'svelte';
    import AppWrapper from 'components/AppWrapper.svelte';
    import Carton from 'components/Carton.svelte';

    /*
    * RESSOURCES
    * */
    import Wallpaper from "assets/images/mort/wallpaper.png";
    export let canvasSize;

    const carton_data ={
        titleName: "Dernière ligne droite",
        timeContext: "5 minutes avant l'examen",
        spaceContext: "Couloir de la fac"
    };
    let display_carton = true;
    let is_ready = true;
    let iconVisibility = true;

    const dispatch = createEventDispatcher();

    let icon;
    let isPointerDown = false;
    let circleTransformValue = 0;
    let circleRadius = 15 * window.innerHeight / 824;
    let innerHeight;
    let runningDuration = 60;
    let mort;

    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;
    $: circleTransform = `translate3d(${circleTransformValue}px, 0, 0)`;
    $: opacityDay = circleTransformValue / (200 * scaleFactor);

    let yStart = 0;
    let xStart = 0;
    let yEnd = 0;
    let xEnd = 0;
    let xCumul = [];
    let yCumul = [];
    let yLast;

    function onPointerDown(e) {
        if(e.touches) {
            yStart = e.touches[0].clientY;
            xStart = e.touches[0].clientX;
        } else {
            yStart = e.clientY;
            xStart = e.clientX;
        }

        if (icon && yStart > parseFloat(getComputedStyle(mort).top) + parseFloat(getComputedStyle(mort).height)/2) {
            e.preventDefault();
            yLast = parseFloat(getComputedStyle(mort).height);
            isPointerDown = true;
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
            if (yEnd < yStart - parseFloat(getComputedStyle(mort).height)/10 &&
                !xCumul.includes(false) &&
                !yCumul.includes(false)) {
                runningDuration = 30;
                setTimeout(() => {
                    runningDuration = 60;
                }, 3000);
                reset();
            } else {
                reset();
            }
        }
    }

    function reset() {
        yStart = 0;
        yEnd = 0;
        xStart = 0;
        xEnd = 0;
        isPointerDown = false;
        xCumul = [];
        yCumul = [];
    }

    function next() {
        dispatch("next");
        console.log("fin");
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

    .mort {
        position: absolute;
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
        z-index: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: run 1s linear infinite;
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
        border: solid calc(var(--scaleFactor) * 1px) #fff;
        width: calc(var(--scaleFactor) * 40px);
        height: calc(var(--scaleFactor) * 40px);
        opacity: 0;
    }


    .room {
      width: 100%;
      height: 100%;
      position: absolute;
      display: flex;
      align-items: center;
    }

    .room_wall {
      width: 100%;
      height: 100%;
      display: block;
      position: absolute;
      background: white;
      backface-visibility: hidden;
      overflow: hidden;
      transform-style: preserve-3d;
    }

    .room_wall-right {
        transform: perspective(50px) rotateY(-90deg) translateZ(calc(-200px * var(--canvasWidth)/400));
    }

    .room_wall-left {
        transform: perspective(50px) rotateY(90deg) translateZ(calc(-200px * var(--canvasWidth)/400));
    }

    .wallpaper {
        position: absolute;
        background-repeat: repeat-x;
        background-size: 400px 100%;
        height: 100%;
        width: 1200px;
    }

    .room_wall-left .wallpaper {
        animation: slide 6s linear infinite;
        animation-duration: calc(100ms * var(--runningDuration));
    }

    .room_wall-right .wallpaper {
        right: 0;
        animation: slideRight 6s linear infinite;
        animation-duration: calc(100ms * var(--runningDuration));
    }

    @keyframes slideRight{
        0%{
          transform: translate3d(0, 0, 0);
        }
        100%{
          transform: translate3d(400px, 0, 0);
        }
    }

    @keyframes slide{
        0%{
          transform: translate3d(0, 0, 0);
        }
        100%{
          transform: translate3d(-400px, 0, 0);
        }
    }

    @keyframes closeDoor {
        0% {
            transform: perspective(100px) rotateY(90deg) translateX(50%);
        }
        100% {
            transform: perspective(100px) rotateY(0deg) translateX(50%);
        }
    }

    @keyframes run {
        0%, 100% {
            transform: translateX(-2%) translateY(-2%);
        }
        25%, 75% {
            transform: translateX(0%) translateY(2%);
        }
        50% {
            transform: translateX(2%) translateY(-2%);
        }
    }

    .room_door_light {
        position: absolute;
        width: calc(20% * 460/var(--canvasWidth));
        height: calc(20% * 460/var(--canvasWidth));
        background: white;
        z-index: 1;
    }

    .room_door_wrapper, .room_door_frame {
        position: absolute;
        width: calc(20% * 460/var(--canvasWidth));
        height: calc(20% * 460/var(--canvasWidth));
        background: transparent;
        z-index: 1;
    }

    .room_door_wrapper {
        transform-style: preserve-3d;
    }

    .room_door_frame {
        display: grid;
        grid-template-areas:
            "top top top top top top top top"
            "top top top top top top top top"
            "left left space space space space right right"
            "left left space space space space right right"
            "left left space space space space right right";
    }

    .room_door_frame_top {
        grid-area: top;
        background-color: dimgrey;
    }

    .room_door_frame_space {
        grid-area: space;
    }

    .room_door_frame_left {
        grid-area: left;
        background-color: dimgrey;
    }

    .room_door_frame_right {
        grid-area: right;
        background-color: dimgrey;
    }

    .room_door {
        position: absolute;
        bottom: 0;
        width: 50%;
        height: 60%;
        background-color: black;
        animation: closeDoor 30s linear forwards;
    }
</style>

<Carton {...carton_data} visible={display_carton} ready={is_ready} sandLevel="10" on:next={() => {
    display_carton = false;
}}></Carton>
<div class="mort"
    out:fade
    style="--scaleFactor:{scaleFactor};--canvasWidth:{canvasSize.currentWidth}; --runningDuration:{runningDuration}"
    on:pointerdown="{onPointerDown}"
    on:touchstart|passive="{onPointerDown}"
    on:pointermove="{onPointerMove}"
    on:touchmove|passive="{onPointerMove}"
    on:pointerup="{onPointerUp}"
    on:touchend|passive="{onPointerUp}"
    bind:this="{mort}">
    <div class="room_door_light"></div>
    <div class="room_door_wrapper">
        <div class="room_door" on:animationend=""></div>
    </div>
    <div class="room_door_frame">
        <div class="room_door_frame_top"></div>
        <div class="room_door_frame_left"></div>
        <div class="room_door_frame_space"></div>
        <div class="room_door_frame_right"></div>
    </div>
    <div class="room_wall room_wall-left">
        <div class="wallpaper" style="background-image: url({Wallpaper})"></div>
    </div>
    <div class="room_wall room_wall-right">
        <div class="wallpaper" style="background-image: url({Wallpaper})"></div>
    </div>
    {#if iconVisibility}
        <div class="icon"
             bind:this="{icon}"
             transition:fade>
             <span class="icon__circle" class:loopCircle="{!isPointerDown && runningDuration === 60}"></span>
        </div>
    {/if}
</div>
