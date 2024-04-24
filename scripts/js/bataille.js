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

/** indicateur de si une partie est en cours ou non */
let partieEnCours = false

/** est-ce qu'on affiche en échelle logarithmique */
let logPlot = false

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
let checkLog = document.getElementById('logplot');
let selectOrdre = document.getElementById('choix');
let baliseAttention = document.getElementById('attention');
let baliseCommentaires = document.getElementById('commentaires');
let boutonLancer = document.getElementById('lancer');
let boutonReinit = document.getElementById('reinit');
let boutonSimul = document.getElementById('simul');

let canvasText = document.createElement('div')
canvasText.id = 'canvas-text'
canvasText.style.padding = '5px'
canvasText.style.margin = '10px'
canvasText.style.fontSize = '0.9em'

/** Combien de manches sont affichées */
let nLines = 5
for (let i=0; i<nLines; i++){
    canvasText.appendChild(document.createElement('div'))
    canvasText.childNodes[i].style.margin = '10px'
}

/** Réinitialise le div à l'intérieur du canvas. */
function reinitCanvasText(){
    for (let i=0; i<nLines; i++){
        canvasText.childNodes[i].innerHTML = ''
    }
}

/** association des boutons aux paramètres */
sliderValeurs.addEventListener("change", (event) => {
    textValeurs.innerHTML = sliderValeurs.value;
    N = parseInt(sliderValeurs.value);
})

sliderCouleurs.addEventListener("change", (event) => {
    textCouleurs.innerHTML = sliderCouleurs.value;
    M = parseInt(sliderCouleurs.value);
    checkIntermediaire.disabled = (M==1)
})

sliderParties.addEventListener("change", (event) => {
    textParties.innerHTML = sliderParties.value;
    nParties = parseInt(sliderParties.value);
})

checkIntermediaire.addEventListener("change", (event) => {
    carteIntermediaire = checkIntermediaire.checked;
})

checkLog.addEventListener("change", (event) => {
    logPlot = checkLog.checked;
    if (parties && parties.length){ tracer() }
})

selectOrdre.addEventListener("change", (event) => {
    ordreRecup = parseInt(selectOrdre.value);
    if (ordreRecup == 2){
        baliseAttention.innerHTML = "attention ! ce mode de récupération occasionne souvent des parties infinies, qui en cas de simulations peuvent être longues à vérifier. pensez à placer le curseur 'Nombre de parties à simuler' à une très faible valeur pour commencer.<br>"
        baliseCommentaires.innerHTML = ''
    } else {
        baliseAttention.innerHTML = ''
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
    if (N==8 || N==13){
        return arrValeurs[n%N]
    }
    return n%N + 1
    
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

let currentLine = 0

/** Met à jour le canvas à la fin d'une manche. */
function updateCanvasText(HTMLToAdd){
    if (currentLine == nLines){
        currentLine = -1
    }

    if (currentLine == -1){ // si toutes les lignes sont prises, on glisse vers le haut
        let child = canvasText.childNodes[0]
        canvasText.removeChild(child)
        child.innerHTML = HTMLToAdd
        canvasText.appendChild(child)
    } else {
        canvasText.childNodes[currentLine].innerHTML = HTMLToAdd
        currentLine++
    }
}

/** La taille d'affichage du paquet de cartes en fonction de son effectif. */
function sizeFont(n){
    return (n > 85 ? 0.5 :
            n > 78 ? 0.55 :
            n > 70 ? 0.6 :
            n > 65 ? 0.65 :
            n > 62 ? 0.7 :
            n > 55 ? 0.6 :
            n > 52 ? 0.65 :
            n > 50 ? 0.7 :
            n > 45 ? 0.75 :
            n > 40 ? 0.8 :
            n > 35 ? 0.9 : 1)
}
/** Simule une manche de bataille.
 * @param {bool} v Si True, afficher en console le détail de la partie.
 * @param {bool} d Si True, afficher sur le document le détail de la partie.
 * @param {Array<Number>} main La pile en cours en cas de bataille.
*/
function manche(v, d, main = []){
    tour++
    let HTMLToAdd = ''
    if (v) console.log(`\nTOUR N°${tour} :
        ${paquet1.length} : ${paquet1.map(e => valeur(e))}
        ${paquet2.length} : ${paquet2.map(e => valeur(e))}
    `)
    if (d){
        let s1 = sizeFont(paquet1.length)
        let s2 = sizeFont(paquet2.length)
        HTMLToAdd = `<strong>_________TOUR N°${tour} :</strong><br>
    &nbsp; &nbsp; Joueur - ${paquet1.length} : <span style='font-size:${s1}em'>${paquet1.map(e => valeur(e))}</span><br>
    &nbsp; &nbsp; Ordi &nbsp;&nbsp;&nbsp;- ${paquet2.length} : <span style='font-size:${s2}em'>${paquet2.map(e => valeur(e))}</span><br>`
    }

    let c1 = paquet1.shift()
    let c2 = paquet2.shift()
    main.unshift(...ordre(c1, c2)) // on récup la dernière bataille, puis celle d'avant, etc...
    if (v) console.log(valeur(c1) + ' ' + valeur(c2))
    if (d) HTMLToAdd += `&nbsp; &nbsp; cartes tirées : ${valeur(c1)} ${valeur(c2)}<br>`

    if (c1%N > c2%N){ // joueur 1 gagne
        paquet1.push(...main)
        if (v) console.log("----1 l'emporte")
        if (d) HTMLToAdd += `&nbsp; &nbsp; <span style='color:green'>Vous l'emportez : ${paquet1.length}-${paquet2.length}</span><br>`
        updateCanvasText(HTMLToAdd)

    } else if (c2%N > c1%N){ // joueur 2 gagne
        paquet2.push(...main)
        if (v) console.log("----2 l'emporte")
        if (d) HTMLToAdd += `&nbsp; &nbsp; <span style='color:red'>L'ordi l'emporte : ${paquet1.length}-${paquet2.length}</span><br>`
        updateCanvasText(HTMLToAdd)

    } else if (paquet1.length && paquet2.length){ // égalité : chacun pose une carte puis on rejoue
        if (carteIntermediaire){
            c1 = paquet1.shift()
            c2 = paquet2.shift()
            main.unshift(...ordre(c1, c2))
        }
        if (v) console.log("BATAILLE !!")
        if (v) console.log('avec la main : ', main.map(e => valeur(e)))
        if (d) HTMLToAdd += `&nbsp; &nbsp; <span style='color:dimgray'>BATAILLE !! on relance avec la pile [${main.map(e => valeur(e))}]</span>`
        updateCanvasText(HTMLToAdd)

        if (paquet1.length && paquet2.length){
            tour--
            manche(v, d, main)
        }
    } else { // égalité mais quelqu'un n'a plus de carte...
        if (d){
            if (paquet1.length){
                HTMLToAdd += "L'ordi n'a plus de cartes à jouer..."
            } else {
                if (paquet2.length){
                    HTMLToAdd += "Vous n'avez plus de cartes à jouer..."
                } else {
                    HTMLToAdd += "Plus personne n'a de cartes à jouer..."
                }
            }
        }
        updateCanvasText(HTMLToAdd)
    }
}

/** Réintialise les conditions de la partie. */
function initPartie(){
    let cartes = shuffle([...Array(N*M).keys()])
    paquet1 = cartes.slice(0, N*M/2)
    paquet2 = cartes.slice(N*M/2, N*M)
    tour = 0
    partieEnCours = true
}

/** Simule une partie de bataille.
 * @param {bool} v Si true (par défaut), afficher en console le détail de la partie.
 * @param {bool} d Si true (pas par défaut), afficher sur le document le détail de la partie.
 * @returns {Number} 0 si elle est "infinie", 1 si elle est nulle, 2 sinon
*/
function partie(v=true){
    initPartie()
    while(paquet1.length && paquet2.length && tour < limite){
        manche(v, false)
    }
    partieEnCours = false
    if (paquet1.length && paquet2.length){
        if (v) console.log('limite atteinte...')
        return 0
    } else {
        if (v) console.log(paquet1.length ? 'JOUEUR 1 GAGNE' : paquet2.length ? 'JOUEUR 2 GAGNE' : 'MATCH NUL')
        if (v) console.log(tour + ' tours')
        return (paquet1.length || paquet2.length) ? 2 : 1
    }
}

let parties, nInfinies, nNulles
/** Simule un nombre nParties de parties de bataille.
 * @returns {Array} parties : la liste des longueurs des parties
 * @returns {Number} nNulles : le nombre obtenu de parties nulles
 * @returns {Number} nInfinies : le nombre obtenu de parties "infinies"
 */
function test(){
    let nInfinies = 0
    let nNulles = 0
    let parties = []
    for (let i=0; i<nParties; i++){
        switch (partie(false)){ // on lance une partie sans verbose
            case 0:
                nInfinies++; break;
            case 1:
                parties.push(tour); nNulles++; break;
            case 2:
                parties.push(tour); break;
        }
    }
    return [parties, nNulles, nInfinies]

    // console.log(`${N} VALEURS x ${M} COULEURS = ${N*M} CARTES
    // Ordre : ${ordreRecup == 0 ? 'aléatoire' : ordreRecup == 1 ? 'gagnant en premier' : 'joueur 1 en premier'}
    // Carte intermédiaire : ${carteIntermediaire ? 'OUI' : 'NON'}

    // Parties infinies (+ de ${limite} tours) : ${nInfinies}/${nParties}
    // Parties finies les plus longues : ${numSort(parties).reverse().slice(0, 5)}
    // Moyenne : ${mean(parties).toFixed(2)}
    // Médiane : ${median(parties)}`)
}


boutonLancer.addEventListener("click", (event) => {
    if (partieEnCours){ // la partie a déjà débuté
        if (paquet1.length && paquet2.length){
            manche(true, true)
        } else { // fin de partie...
            console.log(paquet1.length ? 'JOUEUR 1 GAGNE' : paquet2.length ? 'JOUEUR 2 GAGNE' : 'MATCH NUL')
            console.log(tour + ' tours')
            if (paquet1.length){
                updateCanvasText(`<strong style='font-size:1.2em;color:green'>'VOUS AVEZ GAGNÉ !'</strong> - ${tour} tours`)
            } else if (paquet2.length){
                updateCanvasText(`<strong style='font-size:1.2em;color:red'>'Vous avez perdu...'</strong> - ${tour} tours`)
            } else {
                updateCanvasText(`<strong style='font-size:1.2em'>'Match nul !?'</strong> - ${tour} tours`)
            }
            partieEnCours = false
            sliderCouleurs.disabled = false
            sliderValeurs.disabled = false
            selectOrdre.disabled = false
            checkIntermediaire.disabled = false
            boutonLancer.value = "Relancer une partie"
        }        
    } else {
        parties = [], nInfinies = 0
        initPartie()
        
        sliderCouleurs.disabled = true
        sliderValeurs.disabled = true
        selectOrdre.disabled = true
        checkIntermediaire.disabled = true
        canvas.innerHTML = '' // on le vide du précédent texte, ou du plotly
        reinitCanvasText()
        canvas.appendChild(canvasText)// on y remet un texte avec rien dedans
        manche(true, true)
        boutonLancer.value = "Manche suivante"
    }
})

boutonReinit.addEventListener("click", (event) => {
    reinitCanvasText()
    partieEnCours = false
    sliderCouleurs.disabled = false
    sliderValeurs.disabled = false
    selectOrdre.disabled = false
    checkIntermediaire.disabled = false
    boutonLancer.value = "Lancer une partie"
})


function tracer(){
    let datahist = [{
        x: parties,
        type: 'histogram',
        xbins: { start: 0, end: numSort(parties)[Math.ceil(0.997*parties.length)]+1 },
        nbinsx: Math.min(300, Math.max(...parties)),
        // name: `Nombre de parties`,
        hovertemplate: '<b>Durée</b> <br>%{x} manches : %{y} parties<extra></extra>',
    }]
    let layout = {
        title: `<span style='font-size: 0.8em'>Histogramme de distribution des durées de ${parties.length + nInfinies} parties</span>`,
        xaxis: {
            title: {
                text: "durée d'une partie"
            },
            type: logPlot ? 'log' : '-',
            autorange: true
        },
        margin: { l: 40, r: 40, b: 50, t: 40, pad: 4 },
        showlegend: false,
        legend: { x: 1, xanchor: 'right', y: 1 }
    }
    
    Plotly.newPlot(canvas, datahist, layout);
}

const numSort = array => array.sort((a, b) => a - b)
const mean = array => array.length ? array.reduce((a, b) => a + b) / array.length : 'VIDE';
const median = array => numSort(array)[~~(array.length/2)]

boutonSimul.addEventListener("click", (event) => {
    canvas.innerHTML = '' // on retire le plotly précédent, ou le canvasText
    reinitCanvasText()
    boutonLancer.value = "Lancer une partie"
    sliderCouleurs.disabled = false
    sliderValeurs.disabled = false
    selectOrdre.disabled = false
    checkIntermediaire.disabled = false
    baliseCommentaires.innerHTML = `<i style="font-size: 0.9em; color:red;">chargement...</i>`
    
    setTimeout(() => {
        // console.log('chargement...')
        [parties, nNulles, nInfinies] = test()
 
        baliseAttention.innerHTML = ''
        baliseCommentaires.innerHTML = `Résultats :<br>
        &nbsp; - Parties "infinies" (+ de ${limite} tours) : ${nInfinies}/${nParties}<br>
        &nbsp; - Parties nulles : ${nNulles}/${nParties}<br>
        &nbsp; - Parties les plus longues :<br>
        &nbsp; &nbsp; &nbsp; [${numSort(parties).reverse().slice(0, 5)}]<br>
        &nbsp; - Moyenne : ${mean(parties).toFixed(2)}<br>
        &nbsp; - Médiane : ${median(parties)}`
        tracer()
    },0)
})


sliderValeurs.dispatchEvent(new Event("change"));
sliderCouleurs.dispatchEvent(new Event("change"));
sliderParties.dispatchEvent(new Event("change"));
// checkIntermediaire.checked = true
checkIntermediaire.dispatchEvent(new Event("change"));
// checkLog.checked = false
checkLog.dispatchEvent(new Event("change"));
selectOrdre.dispatchEvent(new Event("change"));

/** Rendre la taille du texte proportionnelle à la taille du canvas */
window.onload = function(event) {
    let w = parseInt(canvas.offsetHeight);
    canvasText.style.fontSize = w/600 + 'em'
};
window.onresize = function(event) {
    let w = parseInt(canvas.offsetHeight);
    canvasText.style.fontSize = w/600 + 'em'
};

/**
 * déjà en mettant un aléatoire dans l'ordre de jeu entre les 2 joueurs, on a plus aucune partie infinie !
 * alors que dans l'ordre prédéfini (gagnant puis perdant), elles existent... https://arxiv.org/pdf/1007.1371.pdf
 * https://www.cristal.univ-lille.fr/~jdelahay/pls/1995/030.pdf
 * https://math.pugetsound.edu/~mspivey/War.pdf
 * 
 * Autres idées de statistiques : grapher les médianes en fonction des paramètres n m, proportion moyenne de batailles, de batailles doubles voire triples, détection des cycles
 * 
*/

