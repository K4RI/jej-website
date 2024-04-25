
/** @type {Number} longueur du plateau */
let taille

/** @type {Number} nombre de parties à simuler */
let N

/** @type {Array<Number>} la position des joueurs */
let joueurs = [0,1,2]

/** @type {Boolean} indicateur de si une partie est en cours ou non */
let partieEnCours = false

/** les HTMLElements de la page pour les contrôles */
let canvas = document.querySelector('.app-canvas');
let sliderTaille = document.getElementById('taille');
let textTaille = document.getElementById('taille-span');
let sliderParties = document.getElementById('parties');
let textParties = document.getElementById('parties-span');
let boutonLancer = document.getElementById('lancer');
let boutonSimul = document.getElementById('simul');


/** le canvas l'on dessine le déroulement de la partie */
let canvasText = document.createElement('div')
canvasText.id = 'canvas-text'
canvasText.classList.add("carte-container")
canvas.style.justifyContent = 'center'
canvasText.style.height = '20vh'
canvasText.style.transform = 'translate(5vw, 0)'

let canvasInfos1 = document.createElement('span')
canvasInfos1.id = 'infos-1'
canvasInfos1.setAttribute('style', "display: inline-block; height: 10vh; font-size: 1.2em")
canvasInfos1.innerHTML=' '

let canvasInfos2 = document.createElement('div')
canvasInfos2.id = 'infos-2'
canvasInfos2.setAttribute('style', "display: inline-block; height: 10vh; font-size: 1.5em")
canvasInfos2.innerHTML=' '

let divButtons = document.createElement('div')
divButtons.id = 'div-buttons'
divButtons.setAttribute('style', "display: flex; justify-content: center; align-items: center")
divButtons.innerHTML = `<input type="button" id="bouton-1a" value="2ÈME PLACE" style="font-size: 5vh; font-style: italic; padding: 10px 20px; margin: 10px"></input><input type="button" id="bouton-1b" value="3ÈME PLACE" style="font-size: 5vh; font-style: italic; padding: 10px 20px; margin: 10px"></input><input type="button" id="bouton-2" value="PASSER SON TOUR" style="font-size: 5vh; font-style: italic; color:black; padding: 10px 20px; margin: 10px;"><input type="button" id="bouton-3" value="2ÈME PLACE" style="font-size: 5vh; font-style: italic; color:black; padding: 10px 20px; margin: 10px;"><input type="button" id="bouton-relancer" value="RELANCER LA PARTIE" style="font-size: 5vh; font-style: italic; color:black; padding: 10px 20px; margin: 10px;"></input>`
let [bouton1a, bouton1b, bouton2, bouton3, boutonRelancer] = divButtons.childNodes


/** Modifie le nombre de cartes affichées dans le canvasText */
function changeCanvasSize(n){
    canvasText.innerHTML = ''

    for (let i=0; i<taille+1; i++){
        canvasText.appendChild(document.createElement('div'))
        let c = canvasText.childNodes[i]
        c.classList.add("case")
        if (i>=taille){ c.style.border = '0' }
        c.innerHTML = ''
    }
}

function canvasInit(){  // affiche toute la partie de gauche pour la partie
    canvas.appendChild(canvasText)
    canvas.appendChild(canvasInfos1)
    canvas.appendChild(document.createElement("br"))
    canvas.appendChild(canvasInfos2)
    canvas.appendChild(divButtons)
    for (let j in joueurs){
        canvasText.childNodes[joueurs[j]].innerHTML = j // updateCase()
    }
}

sliderTaille.addEventListener("change", (event) => {
    textTaille.innerHTML = sliderTaille.value;
    taille = parseInt(sliderTaille.value);
    changeCanvasSize(taille)
})

sliderParties.addEventListener("change", (event) => {
    let listeNParties = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000] // 13
    N = listeNParties[sliderParties.value];
    textParties.innerHTML = N
})

/** Le joueur en i-ème place. */
function ind(i){
    return joueurs.indexOf(joueurs.toSorted((a, b) => a - b)[3-i]) // pour trier des nombres !
}

/** La place du joueur n°i. */
function place(i){
    return 3-joueurs.toSorted((a, b) => a - b).indexOf(joueurs[i])
}

/** Tour du joueur numéro j.
 * @param {boolean} auto est-ce qu'on déroule selon la strat par défaut, ou bien on demande à l'utilisateur ? (true)
 * @param {boolean} choix lorsque auto=false, choix de l'utilisateur (false)
 * @param {bool} v Si True, afficher en console le détail de la partie. (true)
 * @param {bool} d Si True, afficher sur le canvas le détail de la partie. (false)
 */
function manche({j, auto = true, choix = false, v = true, d = false}){
    let p = place(j)
    switch(p){
        case 1: // première place
            if (v) console.log(`TOUR DU JOUEUR N°${j} - 1ère place`)
            if (auto){
                choix = 2 + Math.floor(2*Math.random()) // un entier au hasard entre 2 et 3
            }
            if (v) console.log(`il fait avancer la ${choix}ème place, càd le joueur ${ind(choix)} !`)
            joueurs[ind(choix)] = joueurs[j]+1
            break;
        case 2: // deuxième place
            if (v) console.log(`TOUR DU JOUEUR N°${j} - 2ème place`)
            if (v) console.log(`on ne fait rien.`)
            break;
        case 3: // troisième place
            if (v) console.log(`TOUR DU JOUEUR N°${j} - 3ème place`)
            let deuz = ind(2)
            joueurs[j] = joueurs[deuz] // prend la place du 2ème
            joueurs[deuz]-- // et le fait reculer
            if (v) console.log(`il prend la place du 2ème, càd le joueur ${deuz} !`)
            break;
    }
}


/** Réinitialise les conditions de la partie, càd le paquet, ligne, i, points. */
function initPartie(){
    joueurs = [0,1,2]
    partieEnCours = true
}

/** Simule une partie.
 * @param {bool} v Si true (par défaut oui), afficher en console le détail de la partie.
*/
function partie(v=true){
    initPartie()
    let t = 0
    while(joueurs.filter(e => e>=taille-1).length < 2){
        if (v) console.log('---tour ' + t + ' - ' + joueurs)
        manche({j:2-t%3, v:v}) // joueur 2, 1, 0, 2, 1, 0...
        t++
        if (t>200){throw new Error('trop de tours')}
    }
    partieEnCours = false
    return ind(1).toString() + ind(2).toString() + ind(3).toString()
}

/** @type {Array<Number>} les issues de parties */ 
let parties = {}

/** Simule un nombre N de parties.
 */
function test(){
    let parties = {"012":0, '021':0, '102':0, '120':0, '201':0, '210':0}
    for (let i=0; i<N; i++){ //N
        parties[partie(false)]++
    }
    return parties
}


/** Bouton pour lancer d'une manche et l'afficher dans le canvas. */
boutonLancer.addEventListener("click", (event) => {
    parties = {}
    initPartie()
    sliderTaille.disabled = true
    divButtons.style.display = ''
    bouton1a.style.display = ''
    bouton1a.style.display = ''
    bouton2.style.display = 'none'
    bouton3.style.display = 'none'
    boutonRelancer.style.display = 'none'
    canvas.innerHTML = '' // on le vide du précédent texte, ou du plotly

    canvasInit()
    // canvasInfos1.style.color = 'black'
    canvasInfos1.innerHTML = `bienvenue dans une nouvelle partie !`
    canvasInfos2.innerHTML = `c'est au tour du joueur <strong>2</strong>`
    boutonLancer.value = "Relancer une partie du début"
})

/** Trace l'histogramme. */
function tracer(){
    let keys = Object.keys(parties).sort()
    let data = [
        {
            x: keys,
            y: keys.map(e => 100*parties[e]/N),
            hovertemplate: '<b>Ordre %{x}</b> : %{y:.2f} % des parties<extra></extra>',
            type: 'bar'
        },
        // {
        //     x: keys,
        //     y: Array(6).fill(100/6),
        //     mode: 'lines',
        //     line: { color: 'black'},
        //     hoverinfo: 'skip',
        // }
    ]
    let layout = {
        title: `<span style='font-size: 0.8em'>Proportion de chaque ordre d'arrivée pour ${N} parties simulées</span>`,
        shapes: {
            type: "line",
            xref: "paper",
            yref: "paper",
            x0: 0,
            y0: 0.8,
            x1: 1,
            y1: 0.8,
            line: { color: "magenta", width: 3,}
        },
        xaxis: {
            title: {
                text: "ordre"
            },
            type: 'category',
        },
        yaxis: {
            tickformat: '2',
            ticksuffix: "%",
            // range: [0,1],
            title: {
                text: "pourcentage de parties qui ont fini avec cet ordre"
            },
        },
        margin: { l: 90, r: 40, b: 60, t: 50, pad: 14 },
        showlegend: false,
        legend: { x: 1, xanchor: 'right', y: 0.2 }
    }
    
    Plotly.newPlot(canvas, data, layout);
}

/** Simuler des parties et afficher leurs statistiques. */
boutonSimul.addEventListener("click", (event) => {
    sliderTaille.disabled = false
    
    setTimeout(() => {
        parties = test()
        tracer()
    },0)
})



sliderTaille.dispatchEvent(new Event("change"));
sliderParties.dispatchEvent(new Event("change"));