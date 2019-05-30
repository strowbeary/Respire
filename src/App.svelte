<script>
    import TrailSwipe from "components/experiments/Idees/Idees.svelte";
    import anim_bg from "assets/images/animated_background.png";
    import AppWrapper from "components/AppWrapper.svelte";
    import global_sound_scene from "./global.sound";

    import TitleScreen from "components/experiments/Intro/TitleScreen.svelte";
    import AudioTest from "components/experiments/Intro/AudioTest.svelte";
    import Cauchemar from "components/experiments/Cauchemar/Cauchemar.svelte";
    import Foule from "components/experiments/Foule/Foule.svelte";
    import Idees from "components/experiments/Idees/Idees.svelte";
    import Pilule from "components/experiments/Pilule/Pilule.svelte";
    import Mort from "components/experiments/Mort/Mort.svelte";
    import Carton from 'components/Carton.svelte';

    const components = [TitleScreen, AudioTest, Cauchemar, Foule, Idees, Pilule, Mort];
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
    z-index: 10000;
    opacity: 0.5;
}
</style>

<img class="overlay" src={anim_bg} alt="animated background">
<AppWrapper let:canvasSize={canvasSize}>
    {#if canvasSize.canvasWidth}
        <svelte:component this={components[index]} on:next="{next}" {canvasSize} globalSoundScene={global_sound_scene}></svelte:component>
    {/if}
</AppWrapper>

