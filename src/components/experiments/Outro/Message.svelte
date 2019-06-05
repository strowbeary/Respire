<script>
    import {fly, fade} from 'svelte/transition';
    import {createEventDispatcher, onMount} from "svelte";
    import placeholderVideo from 'assets/videos/placeholder.webm';

    const dispatch = createEventDispatcher();

    export let globalSoundScene;
    export let canvasSize;
    let innerHeight;
    let videoVisibility = false;
    let videoComponent;

    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;

    function onVideoEnd() {
        dispatch("next");
    }

    onMount(() => {
        setTimeout(() => {
            videoVisibility = true;
            videoComponent.play();
        }, 3000);
    })
</script>

<style>
    .title_screen {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: black;
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .title__text {
        display: flex;
        flex-direction: column;
        align-items: center;
        mix-blend-mode: difference;
        color: white;
    }
    .title__text p {
        width: 50%;
        text-align: center;
        font-size: calc(16px * var(--scaleFactor));
        letter-spacing: 2px;
        font-family: "TTCommons", "sans-serif";
        text-transform: uppercase;
        line-height: calc(24px * var(--scaleFactor));
    }
    .title__text span {
        font-weight: 100;
        font-size: calc(50px * var(--scaleFactor));
        line-height: calc(50px * var(--scaleFactor));
        text-transform: uppercase;
        letter-spacing: 10px;
        font-family: 'BeatriceDisplayDA', 'serif';
        filter: blur(1px);
    }
    .accent {
        display: block;
        margin-top: 24px;
    }
    video {
        position: absolute;
        object-fit: cover;
    }
    .black {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: black;
        z-index: 1;
    }
</style>

<svelte:window bind:innerHeight={innerHeight}></svelte:window>
{#if !videoVisibility}
    <div
        class="title_screen"
        style="--scaleFactor:{scaleFactor}"
        transition:fade>
        <div class="title__text">
            <p>
                Réussir ses études ne devrait pas être une question de
                <span class="accent">survie</span>
                <span>...</span>
            </p>
        </div>
    </div>
    <div class="black" out:fade></div>
{/if}
{#if canvasSize.canvasWidth}
    <video
        out:fade
        width="{canvasSize.canvasWidth}"
        height="{canvasSize.canvasHeight}"
        bind:this="{videoComponent}"
        src={placeholderVideo}
        on:ended={onVideoEnd}
        muted="true"
    ></video>
{/if}