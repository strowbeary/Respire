<script>
    /*
    * MODULES
    * */
    import {fade} from 'svelte/transition';

    /*
    * RESSOURCES
    * */
    import glass_start_img from 'assets/images/cauchemar/glass_start.png';
    import glass_loop_img from 'assets/images/cauchemar/glass_loop.png';
    import glass_end_img from 'assets/images/cauchemar/glass_end.png';
    import jeans_img from 'assets/images/cauchemar/jeans.png';

    export let value;
</script>

<style>
    img {
        position: absolute;
        width: 50%;
        user-select: none;
    }
</style>

{#if value === "jeans"}
    <img src="{jeans_img}" alt="jeans" transition:fade/>
{:else if value === "glass_start"}
    <img src="{glass_start_img}" alt="coffee" in:fade/>
{:else if value === "glass_loop"}
    <img src="{glass_loop_img}" alt="coffee"/>
{:else if value === "glass_end"}
    <img src="{glass_end_img}" alt="coffee" out:fade/>
{:else if value === "door"}
    <img src="{jeans_img}" alt="coffee" transition:fade/>
{/if}
