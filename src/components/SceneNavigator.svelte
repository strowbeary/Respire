<script>
    import Foule from "components/scenes/Foule/Foule.svelte";
    import TitleSceen from "components/scenes/TitleScreen.svelte";
    import AudioTest from "components/scenes/AudioTest.svelte";
    import global_sound_scene from "../global.sound";

    const options = [
    	{name: 'TitleScreen', component: TitleSceen},
    	{name: 'AudioTest', component: AudioTest},
    	{name: 'Foule', component: Foule},
    ];

    let selected = 0;

    function go_next() {
        selected++;
    }
</script>


<svelte:component this={options[selected].component} on:next={() => go_next()} globalSoundScene={global_sound_scene}></svelte:component>
