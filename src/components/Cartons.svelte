<script>
    import AppWrapper from "components/AppWrapper.svelte"
    import Carton from "components/Carton.svelte"

    const chapters = [
        {
            titleName: "Dans le brouillard",
            timeContext: "24h avant l'examen",
            spaceContext: "Chambre"
        },
        {
            titleName: "A contre-courant",
            timeContext: "18h avant l'examen",
            spaceContext: "Amphithéâtre"
        },
        {
            titleName: "En eaux troubles",
            timeContext: "17h avant l'examen",
            spaceContext: "Amphithéâtre"
        },
        {
            titleName: "Noctambule",
            timeContext: "7h avant l'examen",
            spaceContext: "Chambre"
        },
        {
            titleName: "Dernière ligne droite",
            timeContext: "5min avant l'examen",
            spaceContext: "Couloir de la fac"
        }
    ];

    let count = 0;
    $: chapter = chapters[count];

    function nextCarton() {
        if (count < chapters.length - 1) {
            count++;
        }
    }
</script>

<AppWrapper>
    <span slot="carton">
        <Carton visible={false} on:next="{nextCarton}" {...chapter}></Carton>
    </span>
</AppWrapper>
