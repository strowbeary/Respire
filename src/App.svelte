<script>
    import Selector from "components/Selector.svelte";
    import anim_bg from "assets/images/animated_background.png";
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
    z-index: 10000
}
</style>

<img class="overlay" src={anim_bg} alt="animated background">
<Selector/>

