<script>
    import TrailSwipe from "components/experiments/Idees/Idees.svelte";
    import anim_bg from "assets/images/animated_background.png";
    import AppWrapper from "components/AppWrapper.svelte";
    import Carton from "components/Carton.svelte";
    import global_sound_scene from "./global.sound";
    import {carton_index, scene_index, carton_visible, carton_ready} from "./stores";

    import TitleScreen from "components/experiments/Intro/TitleScreen.svelte";
    import AudioTest from "components/experiments/Intro/AudioTest.svelte";
    import Cauchemar from "components/experiments/Cauchemar/Cauchemar.svelte";
    import Foule from "components/experiments/Foule/Foule.svelte";
    import Idees from "components/experiments/Idees/Idees.svelte";
    import Pilule from "components/experiments/Pilule/Pilule.svelte";
    import Mort from "components/experiments/Mort/Mort.svelte";
    import Message from "components/experiments/Outro/Message.svelte";
    import Credits from "components/experiments/Outro/Credits.svelte";

    import bed_img from 'assets/images/cauchemar/bed.png';
    import glass_start_img from 'assets/images/cauchemar/glass_start.png';
    import glass_loop_img from 'assets/images/cauchemar/glass_loop.png';
    import glass_end_img from 'assets/images/cauchemar/glass_end.png';
    import jeans_img from 'assets/images/cauchemar/jeans.png';
    import door_img from 'assets/images/cauchemar/door_open.png';

    const components = [TitleScreen, AudioTest, /*Cauchemar, Foule, Idees,*/ Pilule, Mort, Message, Credits];

    let isCartonVisible = false;
    carton_visible.subscribe(value => {
    	 isCartonVisible = value;
    });

    let index = 0;
    scene_index.subscribe(value => {
       index = value;
    });

    function next(e){
        if (e.detail) {
            carton_index.increment();
            carton_visible.setToTrue();
        } else {
            scene_index.increment();
        }
    }

    function ready() {
        if (isCartonVisible) {
            carton_ready.setToTrue();
        }
    }

    function nextScene() {
        scene_index.increment();
    }
</script>

<style>
.overlay {
    position: absolute;
    width: 100%;
    mix-blend-mode: difference;
    pointer-events: none;
    z-index: 10000;
    opacity: 0.5;
}
</style>

<svelte:head>
	<link rel="preload" href="{bed_img}" as="image">
	<link rel="preload" href="{glass_start_img}" as="image">
	<link rel="preload" href="{glass_loop_img}" as="image">
	<link rel="preload" href="{glass_end_img}" as="image">
	<link rel="preload" href="{jeans_img}" as="image">
	<link rel="preload" href="{door_img}" as="image">
	<link rel="preload" href="{anim_bg}" as="image">
</svelte:head>

<AppWrapper let:canvasSize={canvasSize}>
    <img class="overlay" src={anim_bg} alt="animated background">
    {#if canvasSize.canvasWidth}
        <Carton {canvasSize} on:nextScene="{nextScene}"></Carton>
        <svelte:component this={components[index]} on:next="{next}" {canvasSize} globalSoundScene={global_sound_scene}></svelte:component>
    {/if}
</AppWrapper>

