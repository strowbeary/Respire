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
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
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
        width: 60%;
        text-align: center;
        font-size: calc(16px * var(--scaleFactor));
        margin-top: calc(50px  * var(--scaleFactor));
        font-weight: lighter;
        letter-spacing: calc(1px * var(--scaleFactor));
        font-family: "CormorantGaramond", "sans-serif";
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
            <p>Réussir ses études ne devrait pas être une question de survie</p>
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