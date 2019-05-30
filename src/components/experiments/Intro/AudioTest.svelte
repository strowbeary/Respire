<script>
    import {fly, fade} from 'svelte/transition';
    import {createEventDispatcher, onMount} from "svelte";
    import {Sequence} from "lib/TimingKit";
    import {Vector3} from "lib/SoundKit";

    import Casque from "assets/images/intro/casque.png";
    import CasqueLeft from "assets/images/intro/casque_left.png";
    import CasqueRight from "assets/images/intro/casque_right.png";

    let left = false;
    let right = false;

    const dispatch = createEventDispatcher();

    export let globalSoundScene;

    onMount(() => {
        globalSoundScene
            .then(async scene => {
                const {audio_test_sound} = scene;
                Sequence()
                    .add(0, () => {
                        audio_test_sound.play()
                    })
                    .add(11000, () => {
                        audio_test_sound.set_position(Vector3(-0.5, 0, 0));
                        audio_test_sound.set_orientation(Vector3(1, 0, 0));
                        right = false;
                        left = true;
                    })
                    .add(3500, () => {
                        audio_test_sound.set_position(Vector3(0.5, 0, 0));
                        audio_test_sound.set_orientation(Vector3(-1, 0, 0));
                    })
                    .add(1000, () => {
                        right = true;
                        left = false;
                    })
                    .add(5000, () => {
                        right = false;
                        dispatch("next");
                    })
                    .start();
        });
    })


</script>

<style>
    .audio_test {
        position: absolute;
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
        color: black;
        background-color: white;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .casque {
        width: 100%;
    }

    .over {
        position: absolute;
        z-index: 1;
    }
</style>

<div class="audio_test"
    transition:fade>
    <img src="{Casque}" alt="casque" class="casque"/>
    {#if left}
        <img src="{CasqueLeft}" alt="casque-left" class="casque over" transition:fade/>
    {/if}
    {#if right}
        <img src="{CasqueRight}" alt="casque-right" class="casque over" transition:fade/>
    {/if}
</div>