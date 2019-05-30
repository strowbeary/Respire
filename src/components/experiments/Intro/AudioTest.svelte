<script>
    import {fly, fade} from 'svelte/transition';
    import {createEventDispatcher, afterUpdate} from "svelte";
    import {Sequence} from "lib/TimingKit";
    import {Vector3} from "lib/SoundKit";

    const dispatch = createEventDispatcher();

    export let globalSoundScene;

    afterUpdate(() => {
        globalSoundScene
            .then(async scene => {
                const {audio_test_sound} = scene;
                Sequence()
                    .add(0, () => {
                        audio_test_sound.play()
                    })
                    .add(11000, () => {
                        audio_test_sound.set_position(Vector3(-0.5, 0, 0));
                        audio_test_sound.set_orientation(Vector3(1, 0, 0))
                    })
                    .add(3500, () => {
                        audio_test_sound.set_position(Vector3(0.5, 0, 0));
                        audio_test_sound.set_orientation(Vector3(-1, 0, 0))
                    })
                    .add(5000, () => {
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
</style>

<div
    class="audio_test"
    transition:fade>
</div>