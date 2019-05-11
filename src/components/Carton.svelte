<script>
    import {fly, fade} from 'svelte/transition';
    import { onMount, afterUpdate, createEventDispatcher} from 'svelte';
    export let timeContext;
    export let titleName ;
    export let spaceContext;

    export let ready;
    export let visible;

    const dispatch = createEventDispatcher();

    let innerHeight;
    $: scaleFactor = innerHeight/824;

    function nextCarton() {
    	dispatch('next');
    }

    onMount(() => {
        visible = true;
    });
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
        z-index: 1000;
    }
    .carton div {
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
</style>

<svelte:window bind:innerHeight="{innerHeight}"/>

{#if visible}
<div class="carton"  out:fade style="--scaleFactor:{scaleFactor}">
    <div in:fly="{{ y: 20, duration: 1000, delay: 500 }}">
        <p class="carton__timeContext">{timeContext}</p>
        <h3 class="carton__titleName">{titleName}</h3>
        <p class="carton__spaceContext">{spaceContext}</p>
        {#if ready}
            <button on:click="{nextCarton}" >next</button>
        {/if}
    </div>

</div>
{/if}
