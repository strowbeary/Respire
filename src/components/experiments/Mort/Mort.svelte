<script>
    /*
    * MODULES
    * */
    import {fade} from 'svelte/transition';
    import {createEventDispatcher, onMount} from 'svelte';
    import AppWrapper from 'components/AppWrapper.svelte';
    import {Animate, Easing} from 'lib/TimingKit';
    import {carton_visible, carton_ready} from "./../../../stores";
    /*
    * RESSOURCES
    * */
    import Wallpaper from "assets/images/mort/couloir2.png";
    import door from "assets/images/mort/door.png";
    import door_frame from "assets/images/mort/door_frame.png";
    export let canvasSize;

    let display_carton = true;
    const unsubscribe = carton_visible.subscribe((value) => {
        if (!value) {
            display_carton = false;
            startAnimation();
        }
    });

    onMount(() => {
       carton_ready.setToTrue();
    });

    let iconVisibility = true;
    let anim;
    let translateValue = 0;
    let loop;
    let speedUp = false;
    let speedUpRunning = false;
    let speedOut = true;

    const dispatch = createEventDispatcher();

    let icon;
    let isPointerDown = false;
    let innerHeight;
    let mort;
    let open_door = true;
    let blurValue = 0;

    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;

    let yStart = 0;
    let yEnd = 0;
    let yCumul = [];
    let yLast;

    function onPointerDown(e) {
        e.preventDefault();
        if (speedOut) {
            if(e.touches) {
                yStart = e.touches[0].clientY;
            } else {
                yStart = e.clientY;
            }

            if (icon && yStart > parseFloat(getComputedStyle(mort).top) + canvasSize.canvasHeight/2) {
                yLast = canvasSize.canvasHeight;
                isPointerDown = true;
            }
        }
    }

    function onPointerMove(e) {
         e.preventDefault();
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
        e.preventDefault();
        if (isPointerDown) {
            if (e.type === "touchend") {
                yEnd = e.changedTouches[0].clientY;
            } else {
                yEnd = e.clientY;
            }
            if (yEnd < yStart - canvasSize.canvasHeight/10 &&
                !yCumul.includes(false)) {
                speedUp = true;
                speedOut = false;
                reset();
            } else {
                reset();
            }
        }
    }

    function reset() {
        yStart = 0;
        yEnd = 0;
        isPointerDown = false;
        yCumul = [];
    }

    function next() {
        open_door = false;
        dispatch("next");
    }

    function startAnimation() {
        anim = Animate(0, -400, Easing.linear, 0.005);
        anim.start();
        loop = requestAnimationFrame(translate);
    }

    function translate() {
        if (anim.is_running) {
            translateValue = anim.tick();
            loop = requestAnimationFrame(translate);
        } else if (speedUp) {
            speedUp = false;
            speedUpRunning = true;
            blurValue = 3;
            anim = Animate(0, -400, Easing.linear, 0.01);
            anim.start();
            loop = requestAnimationFrame(translate);
        } else {
            speedUpRunning = false;
            blurValue = 0;
            setTimeout(() => {
                speedOut = true;
            }, 1000);
            if (open_door) {
                startAnimation();
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

    .mort {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .mort-anim {
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
        width: calc(var(--scaleFactor) * 70px);
        height: calc(var(--scaleFactor) * 70px);
        opacity: 0;
    }

    .room_wall {
      width: 100%;
      height: 100%;
      display: block;
      position: absolute;
      background: black;
      backface-visibility: hidden;
      overflow: hidden;
      transform-style: preserve-3d;
    }

    .room_wall-right {
        transform: perspective(50px) rotateY(-90deg) translateZ(calc(-1px * var(--canvasWidth)/2));
    }

    .room_wall-left {
        transform: perspective(50px) rotateY(90deg) translateZ(calc(-1px * var(--canvasWidth)/2));
    }

    .wallpaper {
        position: absolute;
        background-repeat: repeat-x;
        background-size: 400px 100%;
        height: 100%;
        width: 1200px;
        filter: blur(calc(var(--blurValue) * 1px));
    }

    .light {
        position: absolute;
        width: 100%;
        height: 100%;
        transform: translateZ(0px);
        background-color: black;
        border: solid 1px black;
    }

    .light-door {
        width: 100%;
        height: 100%;
        background-color: black;
    }

    .room_wall-left .wallpaper {
        transform: translate3d(calc(var(--translateValue) * 1px), 0, 0);
    }

    .room_wall-right .wallpaper {
        right: 0;
        transform: translate3d(calc(var(--translateValue) * -1px), 0, 0);
    }

    .light-anim {
        animation: lessLight 30s linear forwards;
    }

    @keyframes closeDoor {
        0% {
            transform: perspective(100px) rotateY(90deg) translateX(50%);
        }
        100% {
            transform: perspective(100px) rotateY(-5deg) translateX(50%);
        }
    }

    @keyframes lessLight {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 100%;
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
        width: calc(20% - 2px);
        height: calc(20% - 2px);
        background: white;
        border: solid 1px black;
        z-index: 1;
    }

    .room_door_wrapper, .room_door_frame {
        position: absolute;
        width: 20%;
        height: 20%;
        background: transparent;
        z-index: 1;
    }

    .room_door_wrapper {
        transform-style: preserve-3d;
    }

    .room_door_frame {
        background-size: cover;
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
    }

    .room_door_frame_space {
        grid-area: space;
    }

    .room_door_frame_left {
        grid-area: left;
    }

    .room_door_frame_right {
        grid-area: right;
    }

    .room_door {
        position: absolute;
        bottom: 0;
        width: 50%;
        height: 60%;
        background-size: cover;
    }

    .room_door_animation {
        animation: closeDoor 30s linear forwards;
    }
</style>

<div class="mort"
    out:fade
    class:mort-anim="{open_door && !display_carton}"
    style="--scaleFactor:{scaleFactor};--canvasWidth:{canvasSize.currentWidth};--translateValue:{translateValue};--blurValue:{blurValue}"
    on:touchstart|passive="{onPointerDown}"
    on:mousedown="{onPointerDown}"
    on:mousemove="{onPointerMove}"
    on:touchmove|passive="{onPointerMove}"
    on:mouseup="{onPointerUp}"
    on:touchend|passive="{onPointerUp}"
    bind:this="{mort}">
    <div class="room_door_light"></div>
    <div class="room_door_wrapper">
        <div class="room_door" class:room_door_animation="{!display_carton}" on:animationend="{next}" style="background-image: url({door})"></div>
    </div>
    <div class="room_door_frame" class:room_door_frame-light="{!display_carton}" style="background-image: url({door_frame})">
        <div class="room_door_frame_top">
            <div class="light-door" class:light-anim="{!display_carton}"></div>
        </div>
        <div class="room_door_frame_left">
            <div class="light-door" class:light-anim="{!display_carton}"></div>
        </div>
        <div class="room_door_frame_space"></div>
        <div class="room_door_frame_right">
            <div class="light-door" class:light-anim="{!display_carton}"></div>
        </div>
    </div>
    <div class="room_wall room_wall-left">
        <div class="wallpaper" style="background-image: url({Wallpaper})"></div>
        <div class="light" class:light-anim="{!display_carton}"></div>
    </div>
    <div class="room_wall room_wall-right">
        <div class="wallpaper" style="background-image: url({Wallpaper})"></div>
        <div class="light" class:light-anim="{!display_carton}"></div>
    </div>
    {#if iconVisibility && open_door}
        <div class="icon"
             bind:this="{icon}"
             transition:fade>
             <span class="icon__circle" class:loopCircle="{!isPointerDown && speedOut && open_door}"></span>
        </div>
    {/if}
</div>
