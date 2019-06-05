<script>
    import {fly, fade} from 'svelte/transition';
    import global_sound_scene from "./../../../global.sound";
    import {createEventDispatcher} from "svelte";
    import lightBackground from "assets/images/light_background.png";

    const dispatch = createEventDispatcher();
    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;

    export let globalSoundScene;
    let innerHeight;
    let icon;
    let title_scene;


    let is_ready = true;
    let yStart = 0;
    let yEnd = 0;
    let yCumul = [];
    let yLast;
    let isPointerDown = false;

    function onPointerDown(e) {
        if(is_ready) {
             if (e.touches) {
                        yStart = e.touches[0].clientY;
                    } else {
                        yStart = e.clientY;
                    }

                    if (icon && yStart > parseFloat(getComputedStyle(title_scene).top) + parseFloat(getComputedStyle(title_scene).height)/2) {
                        e.preventDefault();
                        yLast = parseFloat(getComputedStyle(title_scene).height);
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
            e.preventDefault();

            if (e.type === "touchend") {
                yEnd = e.changedTouches[0].clientY;
            } else {
                yEnd = e.clientY;
            }

            if (yEnd < yStart - parseFloat(getComputedStyle(title_scene).height)/10 &&
                !yCumul.includes(false)) {
                globalSoundScene.then(async scene => {
                    await scene.start();
                    scene.fade_in_nappe();
                    dispatch('next');
                    is_ready= false;
                });
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
    .title_screen {
        position: absolute;
        width: 100%;
        height: 100%;
        color: black;
        background-color: white;
        background-size: cover;
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
        font-size: calc(70px * var(--scaleFactor));
        color: black;
        text-transform: uppercase;
        text-align: center;
        letter-spacing: calc(12px  * var(--scaleFactor));
        transform: translateX(calc(12px  * var(--scaleFactor)));
        font-family: 'BeatriceDisplayDA', 'serif';
    }
    .title__text p {
        position: absolute;
        bottom: calc(var(--scaleFactor) * 215px);
        width: 60%;
        text-align: center;
        font-size: calc(16px * var(--scaleFactor));
        margin-top: calc(50px  * var(--scaleFactor));
        letter-spacing: calc(1px * var(--scaleFactor));
        font-family: "TTCommons", "sans-serif";
        text-transform: uppercase;
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
        width: calc(var(--scaleFactor) * 70px);
        height: calc(var(--scaleFactor) * 70px);
    }

    .loopCircle {
        animation: wiggle 1.5s infinite ease-out;
    }
</style>

<svelte:window bind:innerHeight={innerHeight}></svelte:window>
<div
    bind:this="{title_scene}"
    class="title_screen"
    style="--scaleFactor:{scaleFactor};background-image: url({lightBackground})"
    on:mousedown="{onPointerDown}"
    on:touchstart|passive="{onPointerDown}"
    on:mousemove="{onPointerMove}"
    on:touchmove|passive="{onPointerMove}"
    on:mouseup="{onPointerUp}"
    on:touchend|passive="{onPointerUp}"
    transition:fade>
    <div class="title__text">
        <h1>Respire</h1>
        <p>Cette expérience nécessite le port d'un casque</p>
    </div>
    {#if is_ready}
        <div class="icon"
            bind:this="{icon}"
            transition:fade>
            <span class="icon__circle" class:loopCircle="{!isPointerDown}"></span>
        </div>
    {/if}
</div>
