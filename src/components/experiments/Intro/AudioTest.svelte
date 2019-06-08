<script>
    import {fly, fade} from 'svelte/transition';
    import {createEventDispatcher, onMount} from "svelte";
    import {Sequence} from "lib/TimingKit";
    import {Vector3} from "lib/SoundKit";

    import Casque from "assets/images/intro/casque.png";
    import CasqueLeft from "assets/images/intro/casque_left.png";
    import CasqueRight from "assets/images/intro/casque_right.png";
    import lightBackground from "assets/images/light_background.png";

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
                        dispatch("next", true);
                    })
                    .start();
        });
    })


</script>

<style>
    .audio_test {
        position: absolute;
        width: 100%;
        height: 100%;
        color: black;
        background-color: white;
        background-size: cover;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .audio_text {
        position: absolute;
        font-size: calc(16px * var(--scaleFactor));
        letter-spacing: 2px;
        font-family: "TTCommons", "sans-serif";
        text-transform: uppercase;
        top: 75%;
        text-align: center;
    }

    .audio_text span {
        position: relative;
    }

    .accent {
        animation: glow 1s ease-in infinite;
    }

    @keyframes glow {
        0%, 100% {
          text-shadow: 0 0 2px black;
        }
        50% {
          text-shadow: 0 0 0 black;
        }
    }

    .casque {
        width: 100%;
    }

    .over {
        position: absolute;
        z-index: 1;
    }
</style>

<div
    class="audio_test"
    style="background-image: url({lightBackground})"
    transition:fade>
    <img src="{Casque}" alt="casque" class="casque"/>
    {#if left}
        <img src="{CasqueLeft}" alt="casque-left" class="casque over" transition:fade/>
    {/if}
    {#if right}
        <img src="{CasqueRight}" alt="casque-right" class="casque over" transition:fade/>
    {/if}
    <p class="audio_text">
        Vérification sonore
        <br/>
        <span class:accent="{left}">Gauche</span> – <span class:accent="{right}">Droite</span>
    </p>
</div>
