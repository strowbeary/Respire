<script>
    import {fly, fade} from 'svelte/transition';
    import logo_gobelins from 'assets/images/outro/logo_gobelins.png';
    import logo_cci from 'assets/images/outro/logo-cciparis.png';

    export let globalSoundScene;
    export let canvasSize;
    let innerHeight;

    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;
</script>

<style>
    .credits_screen {
        position: absolute;
        width: 56.25vh;
        height: 100vh;
        max-width: 100vw;
        max-height: 177.78vw;
        background-color: white;
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .credits__text {
        display: flex;
        flex-direction: column;
        align-items: center;
        mix-blend-mode: difference;
        color: white;
        text-align: center;
        font-size: calc(16px * var(--scaleFactor));
        font-weight: lighter;
        letter-spacing: calc(1px * var(--scaleFactor));
        font-family: "CormorantGaramond", "sans-serif";
        mix-blend-mode: difference;
    }
    .credits__text img {
        width: 50%;
    }
    .separator {
        margin: calc(30px  * var(--scaleFactor));
    }
    .credits__text ul {
        list-style-type: none;
    }
    .credits__text li a {
        text-decoration: none;
        color: white;
        border-bottom: solid 1px white;
    }
    .black {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: black;
        z-index: 1;
    }
</style>

<svelte:window bind:innerHeight={innerHeight}></svelte:window>
<div
    class="credits_screen"
    style="--scaleFactor:{scaleFactor}"
    transition:fade>
    <div class="credits__text">
        <img src="{logo_gobelins}" alt="gobelins">
        <img src="{logo_cci}" class="separator" alt="cci">
        <p>Réalisé par :</p>
        <ul>
            <li>
                <a href="https://remicaillot.fr"
                   rel="noopener noreferrer"
                   target="_blank"> Rémi Caillot</a> - Développement et Son</li>
            <li>
                <a href="https://fr.linkedin.com/in/m%C3%A9lanie-ngo-661520118"
                   rel="noopener noreferrer"
                   target="_blank"> Mélanie Ngo</a> - Développement UI
            </li>
            <li>
                <a href="https://www.linkedin.com/in/camille-rostoucher-674613113"
                   rel="noopener noreferrer"
                   target="_blank"> Camille Rostoucher</a> - Design et Motion</li>
            <li>
                <a href="https://www.linkedin.com/in/xindi-yang-55a316a1"
                   rel="noopener noreferrer"
                   target="_blank">
                Xindi Yang </a> - Design, Illu et Motion
            </li>
        </ul>
    </div>
</div>
<div class="black" out:fade></div>