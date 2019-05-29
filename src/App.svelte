<script>
    import TrailSwipe from "components/experiments/Idees/Idees.svelte";
    import anim_bg from "assets/images/animated_background.png";
    import AppWrapper from "components/AppWrapper.svelte";

    import Cauchemar from "components/experiments/Cauchemar/Cauchemar.svelte";
    import Foule from "components/experiments/Foule/Foule.svelte";
    import Idees from "components/experiments/Idees/Idees.svelte";
    import Pilule from "components/experiments/Pilule/Pilule.svelte";
    import Mort from "components/experiments/Mort/Mort.svelte";
    import Carton from 'components/Carton.svelte';

    const components = [Cauchemar, Foule, Idees, Pilule, Mort];
    let index = 0;
    let display_carton = true;
    let is_ready = false;

    const carton_data ={
        titleName: "Dans le brouillard",
        timeContext: "24 heures avant l'examen",
        spaceContext: "Chambre"
    };

    function next(){
        index++;
    }

    function ready() {
        is_ready = true;
        console.log("ready");
    }
</script>

<style>
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 56.25vh;
    height: 100vh;
    mix-blend-mode: difference;
    pointer-events: none;
    z-index: 10000
}
</style>

<!--<img class="overlay" src={anim_bg} alt="animated background">-->
<AppWrapper let:canvasSize={canvasSize}>
    {#if canvasSize.canvasWidth}
        <Carton {...carton_data} visible={display_carton} ready={is_ready} sandLevel="80"></Carton>
        <svelte:component this={components[index]} on:next="{next}" on:ready="{ready}" {canvasSize} {display_carton}></svelte:component>
    {/if}
</AppWrapper>

