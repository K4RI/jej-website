/**
 * JavaScript pour la page jeux/bataille du site jej888.fr.
 */


// paramètres globaux

/** @type {Number} nombre de valeurs */
var N = 13
const arrValeurs = ['2','3','4','5','6','7','8','9','10','V','D','R','A']

/** @type {Number} nombre de couleurs */
var M = 4
const arrCouleurs = ['♠', '♣', '♥', '♦']

/** @type {boolean} lors d'une bataille, ajoute-t-on une carte au milieu ? */
var carteIntermediaire = true

/** @type {Number} nombre de parties à simuler */
var nParties = 10000

/** ordre de récupération des cartes à la fin du pli :
 * 0 : aléatoire
 * 1 : le gagnant d'abord
 * 2 : le joueur 1 d'abord @type {Number} 
*/
var ordreRecup = 0

/** @type {Number} le nombre de manches après lequel on considère qu'une partie est "infinie" */
const limite = 20000

/** @type {Boolean} indicateur de si une partie est en cours ou non */
var partieEnCours = false

/** @type {Boolean} est-ce qu'on affiche en échelle logarithmique */
var logPlot = false

/** @type {Array<Number>} les paquets de chaque joueur */
var paquet, paquet1, paquet2

var /** @type {Number} le compteur de tours */ tour, /** le compteur de cartes jouées */ carte



// les HTMLElements de la page pour les contrôles

const canvas = document.querySelector('.app-canvas');
const sliderValeurs = document.getElementById('valeurs');
const textValeurs = document.getElementById('valeurs-span');
const sliderCouleurs = document.getElementById('couleurs');
const textCouleurs = document.getElementById('couleurs-span');
const sliderParties = document.getElementById('parties');
const textParties = document.getElementById('parties-span');
const checkIntermediaire = document.getElementById('carteinter');
const checkLog = document.getElementById('logplot');
const selectOrdre = document.getElementById('choix');
const baliseAttention = document.getElementById('attention');
const baliseCommentaires = document.getElementById('commentaires');
const boutonLancer = document.getElementById('lancer');
const boutonReinit = document.getElementById('reinit');
const boutonSimul = document.getElementById('simul');

/** le canvas l'on écrit le déroulement de la partie */
const canvasText = document.createElement('div')
canvasText.id = 'canvas-text'
canvasText.style.padding = '5px'
canvasText.style.margin = '10px'
canvasText.style.fontSize = 'max(1.5vh, 0.85em)' // 1.5vh en mobile-ordi, 0.9em 90% en ordi
canvasText.style.height = '100%'
canvasText.style.overflow = 'scroll'

/** @type {Number} combien de manches sont affichées dans le canvas */
var nLines = 5
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


// Association des boutons aux paramètres
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

/** Renvoient le nom de la carte d'indice n, pour affichage.
 *  Les cartes d'un paquet sont numérotés de 0 à N*M-1.
*/
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
    return `${valeur(n)}${couleur(n)}`
}

/** Calcule l'ordre de récupération des cartes.
 *  @returns {Array<Number>} les deux cartes remises en ordre
*/
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

/** @type {Number} La ligne actuelle du canvas où l'on écrit.  */
let currentLine = 0
/** Met à jour le canvas à la fin d'une manche. Utilisé dans manche(). */
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

/** La taille d'affichage du paquet de cartes en fonction de son effectif.
 */
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
    carte++
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
            carte++
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
    paquet = shuffle([...Array(N*M).keys()])
    paquet1 = paquet.slice(0, N*M/2)
    paquet2 = paquet.slice(N*M/2, N*M)
    tour = 0
    carte = 0
    partieEnCours = true
}

/** Simule une partie de bataille.
 * @param {bool} v Si true (par défaut oui), afficher en console le détail de la partie.
 * @param {bool} d Si true (par défaut non), afficher sur le document le détail de la partie.
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
        if (v) console.log(tour + ' tours, ' + carte + ' cartes')
        return (paquet1.length || paquet2.length) ? 2 : 1
    }
}

// Les statistiques de la dernière simulation. Sont conservées en global afin de pouvoir modifier l'affichage.
let /** @type {Array<Number>} les durées de parties (en tours) */ parties,
    /** @type {Array<Number>} les durées de parties (en cartes jouées */ pcartes,
    /** @type {Number} le nomnbre de parties infinies */ nInfinies,
    /** @type {Number} le nombre de parties en match nul */ nNulles    


/** Simule un nombre nParties de parties de bataille.
 * @returns {Array} parties, nNulles, nInfinies : cf. ci-dessus.
 */
function test(){
    let parties = [], pcartes = [], nInfinies = 0, nNulles = 0
    // let cc = []
    for (let i=0; i<nParties; i++){
        switch (partie(false)){ // on lance une partie sans verbose
            case 0:
                nInfinies++; break;
            case 1:
                parties.push(tour); pcartes.push(carte); nNulles++;
                // if (tour==4){cc.push(JSON.stringify(paquet.map(e => valeur(e))))}
                break;
            case 2:
                parties.push(tour); pcartes.push(carte);
                // if (tour==4){cc.push(JSON.stringify(paquet.map(e => valeur(e))))}
                break;
        }
    }
    // console.log(cc.reduce(function (acc, curr) { return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc }, {}))
    return [parties, pcartes, nNulles, nInfinies]
}


/** Bouton pour lancer une manche et l'afficher dans le canvas sur la gauche. */
boutonLancer.addEventListener("click", (event) => {
    if (partieEnCours){ // la partie a déjà débuté
        if (paquet1.length && paquet2.length){
            manche(true, true)
        } else { // fin de partie...
            console.log(paquet1.length ? 'JOUEUR 1 GAGNE' : paquet2.length ? 'JOUEUR 2 GAGNE' : 'MATCH NUL')
            console.log(tour + ' tours, ' + carte + ' cartes')
            if (paquet1.length){
                updateCanvasText(`<strong style='font-size:1.2em;color:green'>'VOUS AVEZ GAGNÉ !'</strong> - ${tour} tours, ${carte} cartes`)
            } else if (paquet2.length){
                updateCanvasText(`<strong style='font-size:1.2em;color:red'>'Vous avez perdu...'</strong> - ${tour} tours, ${carte} cartes`)
            } else {
                updateCanvasText(`<strong style='font-size:1.2em'>'Match nul !?'</strong> - ${tour} tours, ${carte} cartes`)
            }
            partieEnCours = false
            sliderCouleurs.disabled = false
            sliderValeurs.disabled = false
            selectOrdre.disabled = false
            checkIntermediaire.disabled = false
            boutonLancer.value = "Relancer une partie"
        }        
    } else {
        parties = [], pcartes = [], nInfinies = 0
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

/** Trace l'histogramme. */
function tracer(){
    let datahist = [{
        x: parties,
        type: 'histogram',
        xbins: { start: 0, end: numSort(parties)[Math.ceil(0.997*parties.length)]+1 },
        nbinsx: Math.min(300, Math.max(...parties)),
        hovertemplate: '<b>Durée</b> <br>%{x} manches : %{y} parties<extra></extra>',
    }]
    let layout = {
        title: `<span style='font-size: 0.8em'>Histogramme de distribution des durées de ${parties.length + nInfinies} parties</span>`,
        xaxis: {
            title: {
                text: "durée d'une partie (en tours)"
            },
            type: logPlot ? 'log' : '-',
            autorange: true
        },
        yaxis: {
            title: {
                text: "nombre de parties avec cette durée"
            },
        },
        margin: { l: 60, r: 40, b: 60, t: 60, pad: 4 },
        showlegend: false,
        legend: { x: 1, xanchor: 'right', y: 1 }
    }
    
    Plotly.newPlot(canvas, datahist, layout);
}

const numSort = array => array.sort((a, b) => a - b)
const mean = array => array.length ? array.reduce((a, b) => a + b) / array.length : 'VIDE';
// const median = array => [~~(array.length/2)]
const mode = a =>
  Object.values(
    a.reduce((count, e) => {
      if (!(e in count)) {
        count[e] = [0, e];
      }      
      count[e][0]++;
      return count;
    }, {})
  ).reduce((a, v) => v[0] < a[0] ? a : v, [0, null])[1];
;

/** Simuler des parties et afficher leurs statistiques. */
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
        [parties, pcartes, nNulles, nInfinies] = test()
        let parties_sorted = numSort(parties), pcartes_sorted = numSort(pcartes), nn = parties.length 
        baliseAttention.innerHTML = ''
        baliseCommentaires.innerHTML = `Résultats :<br>
        &nbsp; <span style="font-size:0.9em">- Parties "infinies" (+ de ${limite} tours) : ${nInfinies}/${nParties}</span><br>
        &nbsp; - Parties nulles : ${nNulles}/${nParties}<br>
        &nbsp; - Parties les plus courtes ... longues :<br>
        &nbsp; &nbsp; &nbsp; &nbsp; [${parties_sorted.slice(0, 3)}] &nbsp; ... &nbsp; [${parties_sorted.slice(nn-3, nn)}]<br>
        &nbsp; - Moyenne : ${mean(parties).toFixed(2)} tours, ${mean(pcartes).toFixed(2)} cartes<br>
        &nbsp; - Médiane : ${parties_sorted[~~(nn/2)]} tours, ${pcartes_sorted[~~(nn/2)]} cartes<br>
        &nbsp; - Mode : ${mode(parties)} tours, ${mode(pcartes)} cartes`
        tracer()
    },0)
})


sliderValeurs.dispatchEvent(new Event("change"));
sliderCouleurs.dispatchEvent(new Event("change"));
sliderParties.dispatchEvent(new Event("change"));
checkIntermediaire.checked = true
checkIntermediaire.dispatchEvent(new Event("change"));
// checkLog.checked = false
checkLog.dispatchEvent(new Event("change"));
selectOrdre.dispatchEvent(new Event("change"));


let commandes = document.querySelector('.app-commandes')
/** Rendre la taille du texte proportionnelle à la taille du canvas */
window.onload = function(event) {
    let w = parseInt(commandes.offsetWidth);
    commandes.style.fontSize = w/400 + 'em'
};
window.onresize = function(event) {
    let w = parseInt(commandes.offsetWidth);
    commandes.style.fontSize = w/400 + 'em'
};

boutonLancer.style.fontSize = '0.8em'
boutonReinit.style.fontSize = '0.8em'
boutonSimul.style.fontSize = '0.8em'

/**
 * déjà en mettant un aléatoire dans l'ordre de jeu entre les 2 joueurs, on a plus aucune partie infinie !
 * alors que dans l'ordre prédéfini (gagnant puis perdant), elles existent... https://arxiv.org/pdf/1007.1371.pdf
 * https://www.cristal.univ-lille.fr/~jdelahay/pls/1995/030.pdf
 * https://math.pugetsound.edu/~mspivey/War.pdf
 * 
 * Autres idées de statistiques : grapher les médianes en fonction des paramètres n m, proportion moyenne de batailles, de batailles doubles voire triples, détection des cycles
 * 
*/