/** @type {Number} nombre de valeurs */
var N = 13
const arrValeurs = ['2','3','4','5','6','7','8','9','10','V','D','R','A']

/** @type {Boolean} avec ou sans péage ? */
var peage = false

/** @type {Number} nombre de parties à simuler */
var nParties = 10000

/** @type {Number} la taille de l'autoroute */
var taille

/** @type {Boolean} indicateur de si une partie est en cours ou non */
let partieEnCours = false

var /** @type {Number} la ligne actuelle */ i = 0,
    /** @type {Number} le nombre actuel de pénalité */ points = 0,
    /** @type {Array<Number>} le paquet */ paquet = [],
    /** @type {Array<Number>} la ligne de cartes actuellement posées */ ligne = []


/** les HTMLElements de la page pour les contrôles */
let canvas = document.querySelector('.app-canvas');
let sliderTaille = document.getElementById('taille');
let textTaille = document.getElementById('taille-span');
let sliderValeurs = document.getElementById('valeurs');
let textValeurs = document.getElementById('valeurs-span');
let sliderParties = document.getElementById('parties');
let textParties = document.getElementById('parties-span');
let checkPeage = document.getElementById('peage');
let boutonLancer = document.getElementById('lancer');
let boutonReinit = document.getElementById('reinit');
let boutonSimul = document.getElementById('simul');
let baliseCommentaires = document.getElementById('commentaires');

/** le canvas l'on dessine le déroulement de la partie */
let canvasText = document.createElement('div')
canvasText.id = 'canvas-text'
canvasText.classList.add("carte-container")

let canvasInfos1 = document.createElement('span')
canvasInfos1.setAttribute('style', "display: inline-block; height: 10%; background-color: red")
canvasInfos1.innerHTML='coucou'

let canvasInfos2 = document.createElement('div')
canvasInfos2.setAttribute('style', "display: inline-block; height: 10%; background-color: blue")
canvasInfos2.innerHTML='cv'

let divButtons = document.createElement('div')
divButtons.setAttribute('style', "display: flex; justify-content: center; align-items: center")
divButtons.innerHTML = `<input type="button" id="bouton-haut" value="PLUS HAUT" style="font-size: 5vh; font-style: italic; color:black; padding: 10px 20px; margin: 10px"></input>
<input type="button" id="bouton-bas" value="PLUS BAS" style="font-size: 5vh; font-style: italic; color:black; padding: 10px 20px; margin: 10px"></input>`
let boutonsPlus = document.createElement('bouton-haut')
let boutonsBas = document.createElement('bouton-bas')
console.log(boutonsPlus)

function initCanvasText(n){
    canvasText.innerHTML = ''
    for (let i=0; i<n; i++){
        canvasText.appendChild(document.createElement('div'))
        let c = canvasText.childNodes[i]
        c.classList.add("carte")
        c.innerHTML = 'carte n°' + (i+1)
    }
}

function canvasAppendAll(){  // affiche toute la partie de gauche pour la partie
    canvas.appendChild(canvasText)
    canvas.appendChild(canvasInfos1)
    canvas.appendChild(document.createElement("br"))
    canvas.appendChild(canvasInfos2)
    canvas.appendChild(divButtons)
}

/** Association des boutons aux paramètres */
sliderTaille.addEventListener("change", (event) => {
    textTaille.innerHTML = sliderTaille.value;
    taille = parseInt(sliderTaille.value);
    initCanvasText(taille)
})

sliderValeurs.addEventListener("change", (event) => {
    textValeurs.innerHTML = sliderValeurs.value;
    N = parseInt(sliderValeurs.value);
})

sliderParties.addEventListener("change", (event) => {
    let listeNParties = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000] // 13
    nParties = listeNParties[sliderParties.value];
    textParties.innerHTML = nParties
})

sliderParties.addEventListener("change", (event) => {
    let listeNParties = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000] // 13
    nParties = listeNParties[sliderParties.value];
    textParties.innerHTML = nParties
})

boutonsPlus.addEventListener("click", (event) => {
    manche({auto:false, choix:true})
})
boutonsPlus.addEventListener("click", (event) => {
    manche({auto:false, choix:false})
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

/** Effectue une manche d'autoroute.
 *  Modifie les variables paquet, ligne, i, et points.
 * @param {boolean} auto est-ce qu'on déroule selon la strat par défaut, ou bien on demande à l'utilisateur ?
 * @param {boolean} choix lorsque auto=false, choix de l'utilisateur : plus haut ou plus bas ?
 * @param {bool} v Si True, afficher en console le détail de la partie.
 * @param {bool} d Si True, afficher sur le canvas le détail de la partie.
 */
function manche({auto = true, choix = false, v = true, d = false}){
    if (paquet.length == 0){
        paquet = shuffle([...Array(4*N).keys()].filter(e => !(e in ligne))) // on re-remplit puis mélange le paquet
    }
    if (v) console.log(`\nLigne ${i+1}\n${ligne.map(e => valeur(e))} - ${valeur(ligne[i])}`)
    let carteAComparer = ligne[i]
    let carteInconnue = paquet.shift()

    if (auto){
        choix = carteAComparer%N < (N-1)/2 ? true : carteAComparer%N > (N-1)/2 ? false : Math.random() < 0.5
    } // sinon c'est le clic de bouton
    if (v) console.log(`choix ${choix ? "plus haut" : "plus bas"}... face à ${valeur(carteInconnue)}`)

    ligne[i] = carteInconnue
    if (d) canvasText.childNodes[i].classList.remove('selected')
    if (d) canvasText.childNodes[i].innerHTML = valeur(carteInconnue)
    if ((carteInconnue%N > carteAComparer%N && choix) || (carteInconnue%N < carteAComparer%N && !choix)){
        i++
        if (v) console.log(`YES on avance -> ${points} pts`)
    } else if (carteInconnue%N == carteAComparer%N){
        points += 2*(i+1)
        i = 0
        if (v) console.log(`NOOOON égalité, x2 et on redescend -> ${points} pts`)
    } else {
        points += (i+1)
        i = 0
        if (v) console.log(`NON on redescend -> ${points} pts`)
    }

    if (i<taille){
        if (d) canvasText.childNodes[i].classList.add('selected')
    }    
}

/** Réinitialise les conditions de la partie, càd le paquet, ligne, i, points. */
function initPartie(){    
    paquet = shuffle([...Array(4*N).keys()]) // crée le nouveau paquet
    ligne = paquet.slice(0, taille) // et la première ligne devant
    paquet = paquet.slice(taille, 4*N)
    i = 0, points = 0 // commence à la case 0 avec 0 points
    partieEnCours = true
}


/** Simule une partie de bataille.
 * @param {bool} v Si true (par défaut oui), afficher en console le détail de la partie.
*/
function partie(v=true){
    initPartie()
    while(i<taille){
        manche({v:v})
    }
    partieEnCours = false
}

/** @type {Array<Number>} les durées de parties (en tours) */
let parties

/** Simule un nombre nParties d'autoroutes.
 */
function test(){
    let parties = []
    for (let i=0; i<nParties; i++){        
        partie(false)
        parties.push(points)
    }
    return parties
}


/** Bouton pour vancer d'une manche et l'afficher dans le canvas. */
boutonLancer.addEventListener("click", (event) => {
    if (partieEnCours){ // partie déjà commencée
        manche({v:true, d: true})
        if (i==taille){ // fin de partie...
            console.log('AUTOROUTE FRANCHIE')
            console.log('nombre total de pénalités : ', points)
            // TODO maj le texte
            partieEnCours = false
            sliderTaille.disabled = false
            sliderValeurs.disabled = false
            checkPeage.disabled = false
        }        
    } else {
        parties = []
        initPartie()
        sliderTaille.disabled = true
        sliderValeurs.disabled = true
        checkPeage.disabled = true
        canvas.innerHTML = '' // on le vide du précédent texte, ou du plotly

        canvasAppendAll()
        for (let j=0; j<taille; j++){
            canvasText.childNodes[j].innerHTML = valeur(ligne[j])
        }
        canvasText.childNodes[0].classList.add('selected')
    }
    
    if (i==taille){ // partieEnCours s'est remis à false
        console.log('fini !', points)
        boutonLancer.value = "Relancer une partie"
    }
})

const numSort = array => array.sort((a, b) => a - b)
const mean = array => array.length ? array.reduce((a, b) => a + b) / array.length : 'VIDE';

/** Trace l'histogramme. */
function tracer(){
    let datahist = [{
        x: parties,
        type: 'histogram',
        xbins: { start: 0, end: numSort(parties)[Math.ceil(0.99*parties.length)]+1, size: 1 },
        // nbinsx: Math.min(300, Math.max(...parties)),
        hovertemplate: '<b>Durée</b> <br>%{x} pénalités : %{y:.2f} % des parties<extra></extra>',
        histnorm: "percent"
    }]
    let layout = {
        title: `<span style='font-size: 0.8em'>Histogramme de distribution des pénalités pour ${nParties} parties simulées</span>`,
        xaxis: {
            title: {
                text: "nombre de pénalités"
            },
            // type: logPlot ? 'log' : '-',
            autorange: true
        },
        yaxis: {
            title: {
                text: "pourcentage de parties qui ont fini avec ce score"
            },
        },
        margin: { l: 60, r: 40, b: 60, t: 50, pad: 14 },
        showlegend: false,
        legend: { x: 1, xanchor: 'right', y: 1 }
    }
    
    Plotly.newPlot(canvas, datahist, layout);
}

/** Simuler des parties et afficher leurs statistiques. */
boutonSimul.addEventListener("click", (event) => {
    // canvas.innerHTML = '' // on retire le plotly précédent, ou le canvasText
    // reinitCanvasText()
    boutonLancer.value = "Lancer une partie"
    sliderTaille.disabled = false
    sliderValeurs.disabled = false
    checkPeage.disabled = false
    baliseCommentaires.innerHTML = `<i style="font-size: 0.9em; color:red;">chargement...</i>`
    
    setTimeout(() => {
        parties = test()
        let parties_sorted = numSort(parties), nn = parties.length
        baliseCommentaires.innerHTML = `Résultats :<br>
        &nbsp; - Parties les plus longues : [${parties_sorted.slice(nn-3, nn)}]<br>
        &nbsp; - Moyenne : ${mean(parties).toFixed(2)} tours<br>
        &nbsp; - Médiane : ${parties_sorted[~~(nn/2)]} tours`
        tracer()
        console.log(partieEnCours)
    },0)
})

sliderTaille.dispatchEvent(new Event("change"));
sliderValeurs.dispatchEvent(new Event("change"));
sliderParties.dispatchEvent(new Event("change"));

// parties = test()
// console.log(parties)
// boutonLancer.dispatchEvent(new Event("click"));