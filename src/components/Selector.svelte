<script>
    import TrailSwipe from "components/experiments/Foule/Foule.svelte";
    import Cartons from "components/Cartons.svelte";

    const options = [
    	{name: 'TrailSwipe', component: TrailSwipe},
    	{name: 'Cartons', component: Cartons},
    ];

    let selected = options[0];
</script>

<style>
    .selector {
        position: fixed;
        top: 0;
        left: 0;
    }
</style>

<select class="selector" bind:value={selected}>
	{#each options as option}
		<option value={option}>{option.name}</option>
	{/each}
</select>

<!--<Sand/>-->
<svelte:component this={selected.component}></svelte:component>
