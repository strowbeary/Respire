<script>
    import Selector from "components/Selector.svelte";
    import anim_bg from "assets/images/animated_background.png";
</script>

<style>
.overlay {
    position: absolute; 
    left: 0;
    right: 0;
    margin: auto; 
    width: 56.25vh;
    height: 100vh;
    mix-blend-mode: difference;
    pointer-events: none;
}
</style>

<img class="overlay" src={anim_bg}>
<Selector/>

