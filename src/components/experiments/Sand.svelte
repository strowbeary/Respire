<canvas bind:this={canvas} id="game" bind:offsetWidth="{width}" bind:offsetHeight="{height}"></canvas>

<style>
    #game {
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
        background-color: white;
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

