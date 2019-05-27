<script>
    import Foule from "components/experiments/Foule/Foule.svelte";
    import Idees from "components/experiments/Idees/Idees.svelte";

    const components = [Foule, Idees];
    let index = 0;

    function next(){
        index++;
    }
</script>

<svelte:component this={components[index]} on:next="{next}"></svelte:component>
