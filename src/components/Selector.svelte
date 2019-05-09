<script>
    import TrailSwipe from "components/experiments/Foule/Foule.svelte";
    import Fog from "components/experiments/Fog.svelte";
    import Cartons from "components/Cartons.svelte";
    import Sand from "components/experiments/Sand.svelte";

    const options = [
    	{name: 'TrailSwipe', component: TrailSwipe},
    	{name: 'Fog', component: Fog},
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
{#if selected.name === 'TrailSwipe'}
	<TrailSwipe/>
{:else if selected.name === 'Fog'}
	<Fog/>
{:else if selected.name === 'Cartons'}
    <Cartons/>
{/if}
