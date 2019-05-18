<script>
    import Foule from "components/scenes/Foule/Foule.svelte";
    import TitleSceen from "components/scenes/TitleScreen.svelte";

    const options = [
    	{name: 'TitleScreen', component: TitleSceen},
    	{name: 'SoundTest', component: Foule},
    	{name: 'Foule', component: Foule},
    ];

    let selected = 0;
</script>


<svelte:component this={options[selected].component}></svelte:component>
