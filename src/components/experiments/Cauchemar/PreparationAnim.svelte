<script>
    /*
    * MODULES
    * */
    import {fade} from 'svelte/transition';

    /*
    * RESSOURCES
    * */
    import coffeeImg from 'assets/images/cauchemar/coffee.png';
    import jeansImg from 'assets/images/cauchemar/jeans.png';

    export let value;
</script>

<style>
    img {
        position: absolute;
        width: 50%;
        user-select: none;
    }
</style>

{#if value === ""}

{:else if  value === "jeans"}
    <img src="{jeansImg}" alt="jeans" transition:fade/>
{:else if value === "coffee"}
    <img src="{coffeeImg}" alt="coffee" transition:fade/>
{:else if value === "porte"}
    <img src="{coffeeImg}" alt="coffee" transition:fade/>
{/if}
