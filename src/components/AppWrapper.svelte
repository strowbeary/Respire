<script>
   import {onMount} from "svelte";

   let height;
   let width;
   let appWrapper;
   let canvasHeight, canvasWidth, currentHeight, currentWidth;

   onMount(() => {
       canvasHeight = parseFloat(getComputedStyle(appWrapper).height);
       canvasWidth = parseFloat(getComputedStyle(appWrapper).width);
   });

   $:canvasSize = {canvasWidth, canvasHeight, currentWidth: width, currentHeight: height};
</script>

<style>
	:global(*) {
	    padding: 0;
        margin: 0
    }
    :global(body) {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        background-color: black;
    }
    .appWrapper { /* canvas with 9/16 ratio */
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
        overflow: hidden;
    }
</style>

<div class="appWrapper" bind:offsetWidth="{width}" bind:offsetHeight="{height}" bind:this="{appWrapper}">
    <slot {canvasSize}></slot>
</div>
