/** nombre de valeurs */
var N = 13
const arrValeurs = ['2','3','4','5','6','7','8','9','10','V','D','R','A']

/** nombre de couleurs */
var M = 4
const arrCouleurs = ['pique', 'trèfle', 'çoeur', 'carreau']

/** lors d'une bataille, ajoute-t-on une carte au milieu ? */
var carteIntermediaire = true

/** nombre de parties à simuler */
var nParties = 10000

/** ordre de récupération des cartes à la fin du pli :
 * 0 : aléatoire
 * 1 : le gagnant d'abord
 * 2 : le joueur 1 d'abord
*/
var ordreRecup = 0

/** le nombre de manches après lequel on considère qu'une partie est "infinie" */
const limite = 20000

let paquet1, paquet2, tour
/**[2 pique, ..., A pique,
    2 trèfle, ..., A trèfle,
    2 coeur, ..., A coeur,
    2 carreau, ..., A carreau]

    couleur : ~~(i/13)
    valeur : i%13
        faire correspondre avec 2 3 4 5 6 7 8 9 10 V D R A
*/


let canvas = document.querySelector('.app-canvas');
let sliderValeurs = document.getElementById('valeurs');
let textValeurs = document.getElementById('valeurs-span');
let sliderCouleurs = document.getElementById('couleurs');
let textCouleurs = document.getElementById('couleurs-span');
let sliderParties = document.getElementById('parties');
let textParties = document.getElementById('parties-span');
let checkIntermediaire = document.getElementById('carteinter');
let selectOrdre = document.getElementById('choix');
let baliseCommentaires = document.getElementById('commentaires');
let boutonLancer = document.getElementById('lancer');
let boutonReinit = document.getElementById('reinit');
let boutonSimul = document.getElementById('simul');

/** association des boutons aux paramètres */
sliderValeurs.addEventListener("change", (event) => {
    textValeurs.innerHTML = sliderValeurs.value;
    N = parseInt(sliderValeurs.value);
})

sliderCouleurs.addEventListener("change", (event) => {
    textCouleurs.innerHTML = sliderCouleurs.value;
    M = parseInt(sliderCouleurs.value);
})

sliderParties.addEventListener("change", (event) => {
    textParties.innerHTML = sliderParties.value;
    nParties = parseInt(sliderParties.value);
})

checkIntermediaire.addEventListener("change", (event) => {
    carteIntermediaire = checkIntermediaire.checked;
})

selectOrdre.addEventListener("change", (event) => {
    ordreRecup = parseInt(selectOrdre.value);
})

/** Mélange une liste selon l'algorithme de Fisher-Yates.
 *  Les permutations ont toutes la même probabilité.
 *  De complexité O(n), avec n la longueur de la liste.
*/
function shuffle(arr) {
    let j, index, temp;
    for (index = arr.length - 1; index > 0; index--) {
        j = Math.floor(Math.random() * (index + 1));
        temp = arr[index];
        arr[index] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

/** Renvoient le nom de la carte d'indice n. */
function valeur(n){
    return arrValeurs[n%N]
}
function couleur(n){
    return arrCouleurs[~~(n/N)]
}
function nomCarte(n){
    return `${valeur(n)} de ${couleur(n)}`
}
function nomCarteShort(n){
    return `${valeur(n)}${couleur(n)[0]}`
}

/** Calcule l'ordre de récupération des cartes */
function ordre(c1, c2){
    switch (ordreRecup){
        case 0: // aléatoire
            return Math.random() > 0.5 ? [c1, c2] : [c2, c1]
        case 1: // le gagnant d'abord
            return (c1%N > c2%N) ? [c1, c2] : [c2, c1]
        case 2: // le joueur 1 d'abord
            return [c1, c2]
    }
}

/** Simule une manche de bataille.
 * @param {bool} v Si True, afficher en console le détail de la partie.
 * @param {bool} d Si True, afficher sur le document le détail de la partie.
 * @param {Array<Number>} main La pile en cours en cas de bataille.
*/
function manche(v, d, main = []){
    tour++
    if (v) console.log(`\nTOUR N°${tour} :
        ${paquet1.length} : ${paquet1.map(e => valeur(e))}
        ${paquet2.length} : ${paquet2.map(e => valeur(e))}
    `)
    if (d) canvas.innerHTML = `\nTOUR N°${tour} :<br>
    &nbsp; &nbsp; ${paquet1.length} : ${paquet1.map(e => valeur(e))}<br>
    &nbsp; &nbsp; ${paquet2.length} : ${paquet2.map(e => valeur(e))}
`
    let c1 = paquet1.shift()
    let c2 = paquet2.shift()
    main.push(...ordre(c1, c2))
    if (v) console.log(valeur(c1) + ' ' + valeur(c2))

    if (c1%N > c2%N){
        paquet1.push(...main)
        if (v) console.log("----1 l'emporte")
    } else if (c2%N > c1%N){
        paquet2.push(...main)
        if (v) console.log("----2 l'emporte")
    } else if (paquet1.length && paquet2.length){ // égalité : une carte puis on rejoue
        if (carteIntermediaire){
            c1 = paquet1.shift()
            c2 = paquet2.shift()
            main.push(...ordre(c1, c2))
        }
        if (v) console.log("égalité !!")
        if (v) console.log('avec la main : ', main.map(e => valeur(e)))
        if (paquet1.length && paquet2.length){
            tour--
            manche(v, d, main)
        }
    }
}

/** Réintialise les conditions de la partie. */
function initPartie(){    
    let cartes = shuffle([...Array(N*M).keys()]);    
    paquet1 = cartes.slice(0, N*M/2)
    paquet2 = cartes.slice(N*M/2, N*M)
    tour = 0;
}

/** Simule une partie de bataille.
 * @param {bool} v Si True (par défaut), afficher en console le détail de la partie.
 * @param {bool} d Si True (pas par défaut), afficher sur le document le détail de la partie.
*/
function partie(v=true){
    initPartie()
    while(paquet1.length && paquet2.length && tour < limite){
        manche(v, false)
    }
    if (paquet1.length && paquet2.length){
        if (v) console.log('limite atteinte...')
        return 0
    } else {
        if (v) console.log(paquet1.length ? 'joueur 1 gagne' : 'joueur 2 gagne')
        if (v) console.log(tour + ' tours')
        return tour
    }
}

function test(){
    let nInfinies = 0
    let parties = []
    for (let i=0; i<nParties; i++){
        let tour = partie(false)
        if (tour){
            parties.push(tour)
        } else {
            nInfinies++
        }
    }
    return [parties, nInfinies]

    // console.log(`${N} VALEURS x ${M} COULEURS = ${N*M} CARTES
    // Ordre : ${ordreRecup == 0 ? 'aléatoire' : ordreRecup == 1 ? 'gagnant en premier' : 'joueur 1 en premier'}
    // Carte intermédiaire : ${carteIntermediaire ? 'OUI' : 'NON'}

    // Parties infinies (+ de ${limite} tours) : ${nInfinies}/${nParties}
    // Parties finies les plus longues : ${numSort(parties).reverse().slice(0, 5)}
    // Moyenne : ${mean(parties).toFixed(2)}
    // Médiane : ${median(parties)}`)
}


const numSort = array => array.sort((a, b) => a - b)
const mean = array => array.length ? array.reduce((a, b) => a + b) / array.length : 'VIDE';
const median = array => numSort(array)[~~(array.length/2)]

boutonLancer.addEventListener("click", (event) => {
    if (tour){ // partie déjà débutée
        if (paquet1.length && paquet2.length){
            manche(true, true)
        } else {
            console.log(paquet1.length ? 'joueur 1 gagne' : 'joueur 2 gagne')
            console.log(tour + ' tours')
            canvas.innerHTML = `VAINQUEUR : ${paquet1.length ? 'JOUEUR 1' : 'JOUEUR 2'}`
            boutonLancer.value = "Lancer une partie"
        }        
    } else {
        initPartie()
        manche(true, true)
        boutonLancer.value = "Manche suivante"
    }
})

boutonReinit.addEventListener("click", (event) => {
    tour = 0
    canvas.innerHTML = ''
    boutonLancer.value = "Lancer une partie"
})

boutonSimul.addEventListener("click", (event) => {
    canvas.innerHTML = ''
    baliseCommentaires.innerHTML = `<i style="font-size: 0.9em; color:red; text-align:center;">chargement...</i>`
    // document.getElementById('loading').style.display = 'inline'
    let parties, nInfinies
    setTimeout(() => {
        // console.log('chargement...')
        [parties, nInfinies] = test()
            
        // console.log(parties.length)

        baliseCommentaires.innerHTML = `Résultats :<br>
        &nbsp; - Parties "infinies" (+ de ${limite} tours) : ${nInfinies}/${nParties}<br>
        &nbsp; - Parties les plus longues :<br>
        &nbsp; &nbsp; &nbsp; [${numSort(parties).reverse().slice(0, 5)}]<br>
        &nbsp; - Moyenne : ${mean(parties).toFixed(2)}<br>
        &nbsp; - Médiane : ${median(parties)}`

        
        let datahist = [{
            x: parties,
            type: 'histogram',
            xbins: { start: 0, end: numSort(parties)[~~(0.997*parties.length)] },
            nbinsx: Math.min(300, Math.max(...parties)),
            // name: `Nombre de parties`,
            hovertemplate: '<b>Durée</b> <br>%{x} manches : %{y} parties<extra></extra>',
        }]
        let layout = {
            title: `<span style='font-size: 0.8em'>Histogramme de distribution des durées de ${nParties} parties</span>`,
            xaxis: {
                title: {
                    text: "durée d'une partie"
                },
                // type: 'log',
                autorange: true
            },
            margin: { l: 40, r: 40, b: 50, t: 40, pad: 4 },
            showlegend: false,
            legend: { x: 1, xanchor: 'right', y: 1 }
        }
        
        Plotly.newPlot(canvas, datahist, layout);
    },0)
})


sliderValeurs.dispatchEvent(new Event("change"));
sliderCouleurs.dispatchEvent(new Event("change"));
sliderParties.dispatchEvent(new Event("change"));
checkIntermediaire.checked = true
checkIntermediaire.dispatchEvent(new Event("change"));
selectOrdre.dispatchEvent(new Event("change"));

/**
 * déjà en mettant un aléatoire dans l'ordre de jeu entre les 2 joueurs, on a plus aucune partie infinie !
 * alors que dans l'ordre prédéfini (gagnant puis perdant), elles existent... https://arxiv.org/pdf/1007.1371.pdf
 * https://www.cristal.univ-lille.fr/~jdelahay/pls/1995/030.pdf
 * https://math.pugetsound.edu/~mspivey/War.pdf
*/