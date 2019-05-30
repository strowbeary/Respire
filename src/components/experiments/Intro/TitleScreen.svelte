<script>
    import {fly, fade} from 'svelte/transition';
    import global_sound_scene from "./../../../global.sound";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();
    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;

    export let globalSoundScene;
    let innerHeight;
    let icon;
    let title_scene;


    let yStart = 0;
    let xStart = 0;
    let yEnd = 0;
    let xEnd = 0;
    let xCumul = [];
    let yCumul = [];
    let yLast;
    let isPointerDown = false;
     function onPointerDown(e) {
             if(e.touches) {
                 yStart = e.touches[0].clientY;
                 xStart = e.touches[0].clientX;
             } else {
                 yStart = e.clientY;
                 xStart = e.clientX;
             }

             if (icon && yStart > parseFloat(getComputedStyle(title_scene).top) + parseFloat(getComputedStyle(title_scene).height)/2) {
                 e.preventDefault();
                 yLast = parseFloat(getComputedStyle(title_scene).height);
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

                     if (yEnd < yStart - parseFloat(getComputedStyle(title_scene).height)/10 &&
                         !xCumul.includes(false) &&
                         !yCumul.includes(false)) {
                         globalSoundScene.then(async scene => {
                             await scene.start();
                             scene.fade_in_nappe();
                         });
                         dispatch('next');
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
    .title_screen {
        position: absolute;
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
        color: black;
        background-color: white;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .title__text {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .title__text h1 {
        font-weight: normal;
        font-size: calc(50px * var(--scaleFactor));;
        text-shadow: 0 0 1px black, 0 0 calc(20px  * var(--scaleFactor)) black;
        color: transparent;
        text-transform: uppercase;
        text-align: center;
        letter-spacing: calc(12px  * var(--scaleFactor));
        font-family: 'BeatriceDisplayDA', 'serif';
    }
    .title__text p {
        width: 70%;
        text-align: center;
        font-size: calc(16px * var(--scaleFactor));
        margin-top: calc(50px  * var(--scaleFactor));
        font-weight: lighter;
        letter-spacing: calc(3px * var(--scaleFactor));
        font-family: "Optician Sans", "sans-serif";
    }
    .icon {
        width: 100%;
        height: calc(100 * var(--scaleFactor));
        position: absolute;
        display: flex;
        justify-content: center;
        bottom: calc(var(--scaleFactor) * 35px);
    }
    .icon__circle {
        display: flex;
        justify-content: center;
        border-radius: 50%;
        border: solid calc(var(--scaleFactor) * 1px) #000;
        width: calc(var(--scaleFactor) * 40px);
        height: calc(var(--scaleFactor) * 40px);
    }

    .loopCircle {
        animation: wiggle 1.5s infinite ease-out;
    }
</style>

<svelte:window bind:innerHeight={innerHeight}></svelte:window>
<div
    bind:this="{title_scene}"
    class="title_screen"
    style="--scaleFactor:{scaleFactor}"
    on:pointerdown="{onPointerDown}"
    on:touchstart="{onPointerDown}"
    on:pointermove="{onPointerMove}"
    on:touchmove="{onPointerMove}"
    on:pointerup="{onPointerUp}"
    on:touchend="{onPointerUp}"
    transition:fade>
    <div class="title__text">
        <h1>Respire</h1>
        <p>Cette expérience nécessite le port d'un casque</p>
    </div>
    <div class="icon"
        bind:this="{icon}"
        transition:fade>
        <span class="icon__circle" class:loopCircle="{!isPointerDown}"></span>
    </div>
</div>
