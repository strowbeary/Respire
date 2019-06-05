<script>
    import {fly, fade} from 'svelte/transition';
    import logo_gobelins from 'assets/images/outro/logo_gobelins.png';
    import logo_cci from 'assets/images/outro/logo-cciparis.png';
    import lightBackground from "assets/images/light_background.png";

    export let globalSoundScene;
    export let canvasSize;
    let innerHeight;

    $: scaleFactor = innerHeight ? innerHeight/824 : window.innerHeight/824;
</script>

<style>
    .credits_screen {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: white;
        background-size: cover;
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
        letter-spacing: calc(1px * var(--scaleFactor));
        font-family: "TTCommons", "sans-serif";
        mix-blend-mode: difference;
    }
    .credits__text img {
        width: 50%;
    }
    .credits__school {
        margin-top: calc(30px  * var(--scaleFactor));
    }
    .separator {
        margin: calc(15px  * var(--scaleFactor));
    }
    .list a {
        text-decoration: none;
        color: white;
        justify-self: right;
        position: relative;
    }
    .list a:after {
        content: "";
        display: block;
        position: absolute;
        width: 100%;
        height: 2px;
        background-color: white;
        bottom: 1px;
    }
    .list span {
        justify-self: left;
    }
    .black {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: black;
        z-index: 1;
    }
    .list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-column-gap: calc(15px  * var(--scaleFactor));
        grid-row-gap: calc(5px  * var(--scaleFactor));
    }
</style>

<svelte:window bind:innerHeight={innerHeight}></svelte:window>
<div
    class="credits_screen"
    style="--scaleFactor:{scaleFactor};background-image: url({lightBackground})"
    transition:fade>
    <div class="credits__text">
        <p>RÉALISÉ PAR :</p>
        <div class="list separator">
            <a href="https://remicaillot.fr"
               rel="noopener noreferrer"
               target="_blank">
               Rémi CAILLOT
            </a>
            <span>Développement & Son</span>
            <a href="https://fr.linkedin.com/in/m%C3%A9lanie-ngo-661520118"
               rel="noopener noreferrer"
               target="_blank"> Mélanie NGO</a>
            <span>Développement UI</span>
            <a href="https://www.linkedin.com/in/camille-rostoucher-674613113"
               rel="noopener noreferrer"
               target="_blank">
               Camille ROSTOUCHER
            </a>
            <span>Design & Motion</span>
            <a href="https://www.linkedin.com/in/xindi-yang-55a316a1"
               rel="noopener noreferrer"
               target="_blank">
               Xindi YANG
            </a>
            <span>Design, Illu & Motion</span>
        </div>
        <div class="credits__school">
            <img src="{logo_gobelins}" alt="gobelins">
            <p class="separator">une école de la</p>
            <img src="{logo_cci}" alt="cci">
        </div>
    </div>
</div>
<div class="black" out:fade></div>