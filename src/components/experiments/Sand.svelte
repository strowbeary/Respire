<canvas bind:this={canvas} id="game" bind:offsetWidth="{width}" bind:offsetHeight="{height}"></canvas>

<style>
    #game {
        position: absolute;
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
        z-index: 1;
        pointer-events: none;
    }
</style>

<script>
    import {onMount} from "svelte";
    import {Game} from "../effects/sand/game";

    let canvas;
    let width, height;
    let game;

    onMount(() => {
        let bounding = canvas.getBoundingClientRect();
        width = bounding.width;
        height = bounding.height;
    });


    $: {
        if (canvas) {
            canvas.width = Math.round(width);
            canvas.height = Math.round(height);
            if (!game) { //after canvas height and width init
               init();
            }
        }
    }


    function init() {
       game = new Game(canvas);
    }
</script>

