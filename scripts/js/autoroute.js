/** @type {Number} nombre de valeurs */
var N = 13
const arrValeurs = ['2','3','4','5','6','7','8','9','10','V','D','R','A']
const arrCouleurs = ['♠', '♣', '♥', '♦']

/** @type {Boolean} avec ou sans péage ? */
var peage = false
var peageFini = false

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
canvasInfos1.id = 'infos-1'
canvasInfos1.setAttribute('style', "display: inline-block; height: 10vh; font-size: 1.2em")//; background-color: yellow;")
canvasInfos1.innerHTML=' '

let canvasInfos2 = document.createElement('div')
canvasInfos2.id = 'infos-2'
canvasInfos2.setAttribute('style', "display: inline-block; height: 10vh; font-size: 1.5em")//; background-color: lightgray;")
canvasInfos2.innerHTML=' '

let divButtons = document.createElement('div')
divButtons.id = 'div-buttons'
divButtons.setAttribute('style', "display: flex; justify-content: center; align-items: center")
divButtons.innerHTML = `<input type="button" id="bouton-bas" value="PLUS BAS" style="font-size: 5vh; font-style: italic; padding: 10px 20px; margin: 10px"><input type="button" id="bouton-haut" value="PLUS HAUT" style="font-size: 5vh; font-style: italic; padding: 10px 20px; margin: 10px"></input><input type="button" id="bouton-relancer" value="RELANCER UNE PARTIE" style="font-size: 5vh; font-style: italic; color:black; padding: 10px 20px; margin: 10px; display: none;"></input>`
let [boutonMoins, boutonPlus, boutonRelancer] = divButtons.childNodes

let divPeage = document.createElement('div')
divPeage.id = 'div-peage'
divPeage.setAttribute('style', "display: flex; justify-content: center; align-items: center")
divPeage.innerHTML = `<form><input type="text" id="entree-peage" placeholder="" maxlength="2" style="font-size: 1.4em; margin: 10px; text-align: center"></input><input type="submit" id="valider-peage" value="Valider" style="margin: 10px"></input><br><i style="font-size: 0.9em; color:red;"></i></form>`
let validePeage = divPeage.firstChild
let inputPeage = divPeage.firstChild.firstChild
let erreurPeage = divPeage.firstChild.childNodes[3]

/** Modifie le nombre de cartes affichées dans le canvasText */
function changeCanvasSize(n){
    canvasText.innerHTML = ''
    for (let i=0; i<n; i++){
        canvasText.appendChild(document.createElement('div'))
        let c = canvasText.childNodes[i]
        c.classList.add("carte")
        c.innerHTML = 'n°' + (i+1)
    }
}

function canvasInit(){  // affiche toute la partie de gauche pour la partie
    canvas.appendChild(canvasText)
    canvas.appendChild(canvasInfos1)
    canvas.appendChild(document.createElement("br"))
    canvas.appendChild(canvasInfos2)
    canvas.appendChild(divButtons)
    canvas.appendChild(divPeage)
    for (let j=0; j<taille; j++){
        canvasText.childNodes[j].classList.remove('selected')
        updateCard(canvasText.childNodes[j], ligne[j], peage && j==(taille-1)/2)
    }
}

// console.log(boutonsPlus)

/** Association des boutons aux paramètres */
sliderTaille.addEventListener("change", (event) => {
    textTaille.innerHTML = sliderTaille.value;
    taille = parseInt(sliderTaille.value);
    changeCanvasSize(taille)
    checkPeage.disabled = (taille%2==0)
    peage = checkPeage.checked && (taille%2==1)
})

sliderValeurs.addEventListener("change", (event) => {
    textValeurs.innerHTML = sliderValeurs.value;
    N = parseInt(sliderValeurs.value);
    inputPeage.placeholder = arrValeurs.slice(0, N)
})

sliderParties.addEventListener("change", (event) => {
    let listeNParties = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000] // 13
    nParties = listeNParties[sliderParties.value];
    textParties.innerHTML = nParties
})

checkPeage.addEventListener("change", (event) => {
    peage = checkPeage.checked
})

boutonPlus.addEventListener("click", (event) => {
    manche({auto:false, choix:true, d:true})
})
boutonMoins.addEventListener("click", (event) => {
    manche({auto:false, choix:false, d:true})
})

validePeage.addEventListener("submit", (event) => {
    event.preventDefault()
    if(arrValeurs.slice(0, N).includes(inputPeage.value)){
        let c = inputPeage.value
        inputPeage.value = ''
        manche({auto: false, choix: c, v: true, d:true})
    } else {
        erreurPeage.innerHTML = 'invalide ! entrer une valeur de ' + arrValeurs.slice(0, N)
    }
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
    return `${valeur(n) + couleur(n)}`
}
function valeurArray(l){
    let l2 = l.map(e => valeur(e))
    if (peage && !peageFini){ l2[(taille-1)/2] = '?' }
    return l2
}

/** Effectue une manche d'autoroute.
 *  Modifie les variables paquet, ligne, i, et points.
 * @param {boolean} auto est-ce qu'on déroule selon la strat par défaut, ou bien on demande à l'utilisateur ? (true)
 * @param {boolean} choix lorsque auto=false, choix de l'utilisateur : true=plus haut, false=plus bas (false)
 * @param {bool} v Si True, afficher en console le détail de la partie. (true)
 * @param {bool} d Si True, afficher sur le canvas le détail de la partie. (false)
 */
function manche({auto = true, choix = false, v = true, d = false}){
    if (paquet.length == 0){
        paquet = shuffle([...Array(4*N).keys()].filter(e => !(e in ligne))) // on re-remplit puis mélange le paquet
    }

    if (peage && !peageFini && i == (taille-1)/2){ // péage
        if (v) console.log(`\n-----Ligne ${i+1}\n${valeurArray(ligne)} - péage !`)
        let /** la carte du péage */ carteSecrete = ligne[i]
        let /** l'indice de la valeur choisie dans arrValeurs, à comparer au péage */ nChoix
        if (auto){
            nChoix = Math.floor(N*Math.random())
            choix = arrValeurs[nChoix]
        } else {
            nChoix = arrValeurs.indexOf(choix)
        }
        if (v) console.log(`choix ${choix}...`)

        if (d) canvasText.childNodes[i].classList.remove('selected')
        if (nChoix%N < carteSecrete%N){
            points += (i+1)
            if (v) console.log(`${choix} trop bas :( -> ${points} pts`)
            if (d) {
                canvasInfos1.style.color = 'red'
                canvasInfos1.innerHTML = `tu as choisi ${choix}... c'est trop bas.<br>retour au départ avec +${i+1} pénalités... - total jusqu'ici : ${points}`
                baliseCommentaires.innerHTML += `${choix} trop bas<br>`
            }
            i=0
        } else if (nChoix%N > carteSecrete%N){
            points += (i+1)
            if (v) console.log(`${choix} trop haut :( -> ${points} pts`)
            if (d) {
                canvasInfos1.style.color = 'red'
                canvasInfos1.innerHTML = `tu as choisi ${choix}... c'est trop haut.<br>retour au départ avec +${i+1} pénalités... - total jusqu'ici : ${points}`
                baliseCommentaires.innerHTML += `${choix} trop haut<br>`
            }
            i=0
        } else {
            points += (i+1)
            if (v) console.log(`${choix} bonne réponse ! mais tout de même -> ${points} pts`)
            if (d) {
                canvasInfos1.style.color = 'green'
                canvasInfos1.innerHTML = `tu as choisi ${choix}... bravo péage franchi ! mais tout de même<br>retour au départ avec +${i+1} pénalités :) - total jusqu'ici : ${points}`
                baliseCommentaires.innerHTML += `${choix} réussi ---<br>`
                updateCard(canvasText.childNodes[i], carteSecrete)
            }
            i=0
            peageFini = true
        }
        divButtons.style.display = ''
        divPeage.style.display = 'none'

    } else { // pas péage
        if (v) console.log(`\n-----Ligne ${i+1}\n${valeurArray(ligne)} - ${valeur(ligne[i])}`)
        let carteAComparer = ligne[i]
        let carteInconnue = paquet.shift()

        if (auto){
            choix = carteAComparer%N < (N-1)/2 ? true : carteAComparer%N > (N-1)/2 ? false : Math.random() < 0.5
        } // sinon c'est le clic de bouton qui détermine
        if (v) console.log(`choix ${choix ? '"plus haut"' : '"plus bas"'}... on retourne ${valeur(carteInconnue)}`)

        ligne[i] = carteInconnue
        if (d) canvasText.childNodes[i].classList.remove('selected')
        if (d) updateCard(canvasText.childNodes[i], carteInconnue)
        if ((carteInconnue%N > carteAComparer%N && choix) || (carteInconnue%N < carteAComparer%N && !choix)){
            i++
            if (v) console.log(`YES on avance -> ${points} pts`)
            if (d) canvasInfos1.style.color = 'green'
            if (d) canvasInfos1.innerHTML = `oui ! la carte était ${valeur(carteInconnue)}, on avance d'une case !`
        } else if (carteInconnue%N == carteAComparer%N){
            points += 2*(i+1)
            if (v) console.log(`NOOOON égalité, x2 et on redescend -> ${points} pts`)
            if (d) canvasInfos1.style.color = 'red'
            if (d) canvasInfos1.innerHTML = `non... la carte était aussi ${valeur(carteInconnue)}, égalité !? <br>retour au départ avec 2x${(i+1)}=${2*(i+1)} pénalités... - total jusqu'ici : ${points}`
            i = 0
        } else {
            points += (i+1)
            if (v) console.log(`NON on redescend -> ${points} pts`)
            if (d) canvasInfos1.style.color = 'orangered'
            if (d) canvasInfos1.innerHTML = `non... la carte était ${valeur(carteInconnue)}. retour avec +${(i+1)} pénalité${i!=0 ? 's' : ''}... (total : ${points})`
            i = 0
        }
    }

    if (peage && !peageFini && i == (taille-1)/2){
        if (v) console.log("Tut tut c'est le péage !")
        if (d){
            canvasText.childNodes[i].classList.add('selected')
            canvasInfos1.innerHTML += "<br>!! Tut tut, bienvenue au péage !!"
            canvasInfos2.innerHTML = "Il faut deviner la carte cachée..."
            divButtons.style.display = 'none'
            divPeage.style.display = ''
        }
    } else if (i<taille){
        if (d) canvasText.childNodes[i].classList.add('selected')
        if (d) canvasInfos2.innerHTML = `case n°${i+1}, on est face à la carte <strong>${valeur(ligne[i])}</strong>`
    } else {
        if (v) console.log('AUTOROUTE FRANCHIE\nnombre total de pénalités : ', points)
        if (d){
            canvasInfos1.innerHTML = `autoroute franchie !`
            canvasInfos2.innerHTML = `bilan de la partie : ${points} pénalités reçues`
            boutonMoins.style.display = 'none'
            boutonPlus.style.display = 'none'
            boutonRelancer.style.display = ''
        }
        partieEnCours = false
        sliderTaille.disabled = false
        sliderValeurs.disabled = false
        checkPeage.disabled = false
    }
}

/** Réinitialise les conditions de la partie, càd le paquet, ligne, i, points. */
function initPartie(){    
    paquet = shuffle([...Array(4*N).keys()]) // crée le nouveau paquet
    ligne = paquet.slice(0, taille) // et la première ligne devant
    paquet = paquet.slice(taille, 4*N)
    i = 0, points = 0 // commence à la case 0 avec 0 points
    erreurPeage.innerHTML = ''
    inputPeage.value = ''
    peageFini = false
    partieEnCours = true
}

/** Met à jour le texte affiché dans la carte sur le canvas
 * @param {HTMLElement} c l'élément dans lequel écrire
 * @param {Number} n le numéro de la carte
 * @param {Boolean} pp est-ce que l'emplacement est sur un péage ? true uniquement dans canvasInit() dans boutonLancer
*/
function updateCard(c, n, pp=false){
    c.classList.remove('red', 'black')
    if (pp){
        c.innerHTML = '?'
    } else {
        c.classList.add(n<2*N ? 'black' : 'red')
        c.innerHTML = nomCarte(n)
    }
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
    parties = []
    initPartie()
    sliderTaille.disabled = true
    sliderValeurs.disabled = true
    checkPeage.disabled = true
    boutonReinit.disabled = false
    divButtons.style.display = ''
    divPeage.style.display = 'none'
    boutonMoins.style.display = ''
    boutonPlus.style.display = ''
    boutonRelancer.style.display = 'none'
    canvas.innerHTML = '' // on le vide du précédent texte, ou du plotly
    baliseCommentaires.innerHTML = `<br>valeurs dans le paquet : ${arrValeurs.slice(0,N)}<br><br>`
    if (peage) {
        baliseCommentaires.innerHTML += `---tentatives du péage :<br>`
    }

    canvasInit()
    canvasText.childNodes[0].classList.add('selected')
    canvasInfos1.style.color = 'black'
    canvasInfos1.innerHTML = `bienvenue dans une nouvelle partie !`
    canvasInfos2.innerHTML = `case n°1, on est face à la carte <strong>${valeur(ligne[0])}</strong>`
    boutonLancer.value = "Relancer une partie du début"
    
    if (i==taille){ // partieEnCours s'est remis à false
        console.log('fini !', points)
    }
})

boutonRelancer.addEventListener("click", (event) => { // affiché à la fin d'une partie
    boutonLancer.dispatchEvent(new Event("click"));
})

boutonReinit.addEventListener("click", (event) => {
    i = 0, points = 0
    sliderTaille.disabled = false
    sliderValeurs.disabled = false
    checkPeage.disabled = false
    partieEnCours = false
    canvas.innerHTML = '' // on le vide du précédent texte, ou du plotly
    boutonReinit.disabled = true
    boutonLancer.value = "Lancer une partie"
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
    boutonReinit.disabled = true
    baliseCommentaires.innerHTML += `<br><i style="font-size: 0.9em; color:red;">chargement...</i>`
    
    setTimeout(() => {
        parties = test()
        let parties_sorted = numSort(parties), nn = parties.length
        baliseCommentaires.innerHTML = `Résultats :<br>
        &nbsp; - Parties les plus longues : [${parties_sorted.slice(nn-3, nn)}]<br>
        &nbsp; - Moyenne : ${mean(parties).toFixed(2)} tours<br>
        &nbsp; - Médiane : ${parties_sorted[~~(nn/2)]} tours<br>
        &nbsp; - Parties parfaites (zéro pénalité) : ${100*parties.reduce((acc, cur) => acc + (cur==0), 0,)/nParties}%`
        tracer()
    },0)
})

boutonReinit.disabled = true

sliderTaille.dispatchEvent(new Event("change"));
sliderValeurs.dispatchEvent(new Event("change"));
sliderParties.dispatchEvent(new Event("change"));
checkPeage.dispatchEvent(new Event("change"));

// parties = test()
// console.log(parties)
// boutonLancer.dispatchEvent(new Event("click"));