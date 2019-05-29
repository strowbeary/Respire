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

    function next(){
        index++;
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
        <svelte:component this={components[index]} on:next="{next}" {canvasSize}></svelte:component>
    {/if}
</AppWrapper>

