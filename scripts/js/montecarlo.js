/**
  * JavaScript pour la page jeux/montecarlo du site jej888.fr.
*/

/** initialisation des variables et des HTMLElements */

/** Nombre de tirages */
let N = 0;
let f, fNom;
/** Les bornes d'intégration. */
let x1 = 0, x2 = 0;
const maxAffiche = 5000

let sliderIterations = document.getElementById('iterations');
let textIterations = document.getElementById('iterations-span');
let inputFunc = document.getElementById("func");
let funcErreur = document.getElementById('func-erreur') // fonction non-valide
let funcErreur2 = document.getElementById('func-erreur2') // fonction divergente
let inputx1 = document.getElementById("x1");
let inputx2 = document.getElementById("x2");
let bornesErreur = document.getElementById('bornes-erreur') // bornes sont pas dans le bon sens
let boutonLancer = document.getElementById("lancer");
let canvas = document.querySelector(".app-canvas");

function feuxVertsLancer(){
    if ((funcErreur.style.display == 'none') && (funcErreur2.style.display == 'none') && (bornesErreur.style.display == 'none')){
        boutonLancer.disabled = false
    }
}

sliderIterations.addEventListener("change", (event) => {
    textIterations.innerHTML = sliderIterations.value;
    N = parseInt(sliderIterations.value);
})

/** Dans une formule de maths, remplace les x par leur implémentation Math.x */
function mathReplaceAll(s, formules){
    for (let i in formules){
        // si f n'est pas précédé par 'Math.', on remplace par 'Math.f'
        s = s.replace(new RegExp(`(?<!Math\.a*)${formules[i]}`, 'g'), `Math.${formules[i]}`)
    }
    return s
}

inputFunc.addEventListener("change", (event) => {
    funcErreur.style.display = 'none'
    try {
        fNom = inputFunc.value
        let fNomParsed = mathReplaceAll(fNom, ['acosh', 'acos', 'asinh', 'asin', 'atanh', 'atan', 'cosh', 'sinh', 'tanh',
                                               'cos', 'sin', 'exp', 'sqrt', 'log10', 'log', 'floor', 'round', 'trunc', 'max', 'min'])
                                                .replaceAll('pi', 'Math.PI')
        console.log(fNomParsed)
        f = eval(`x => ${fNomParsed}`) // exemple : aaa -> ReferenceError
        let test = f(x1) // exemple : Math.aaa -> NaN
        if (isNaN(test)){
            throw new SyntaxError('NaN')
        }
        feuxVertsLancer()
    } catch(e) {
        console.log(e)
        boutonLancer.disabled = true // fonction non définie, ou vide
        if (e instanceof ReferenceError || e instanceof SyntaxError){ // fonction non-valide
            funcErreur.style.display = 'inline'
        }
    }
}) // cosh(x)*cos(x)*acosh(x)*acos(1/x)

inputx1.addEventListener("change", (event) => {
    bornesErreur.style.display = 'none'
    x1 = parseFloat(inputx1.value)
    if (isNaN(x1)){ // si input vide par exemple
        inputx1.value = 0
        x1 = 0
    }
    if (x1 >= x2){
        bornesErreur.style.display = 'inline'
        boutonLancer.disabled = true
    } else { 
        feuxVertsLancer()
        inputFunc.dispatchEvent(new Event("change"));
    }
    // x1 = 0, x2 = Math.PI
})

inputx2.addEventListener("change", (event) => {
    bornesErreur.style.display = 'none'
    x2 = parseFloat(inputx2.value)
    if (isNaN(x2)){
        inputx2.value = 0
        x2 = 0
    }
    if (x1 >= x2){
        bornesErreur.style.display = 'inline'
        boutonLancer.disabled = true
    } else { 
        feuxVertsLancer()
        inputFunc.dispatchEvent(new Event("change"));
    }
})

/** Tire uniformément un nombre dans l'intervalle [a,b]. */
let uniform = function(a,b){
    return a + (b-a)*Math.random()
}

boutonLancer.addEventListener("click", (event) => {
    // Détermination des min et max en dimension verticale
    funcErreur.style.display = 'none'
    funcErreur2.style.display = 'none'
    let y1 = 0, y2 = 0
    for (let i = 0; i <= N; i++){
        let x = x1 + (i/N)*(x2-x1)
        let y = f(x)
        if (y < y1){ y1 = y }
        if (y > y2){ y2 = y }
        if (!(isFinite(y))){
            funcErreur2.innerHTML = `fonction divergente ou non-définie en x=${x} !<br>`
            funcErreur2.style.display = 'inline'
            return;
        }
    }

    /** Nombre de tirages où f(x) < 0, resp f(x) > 0. */
    let Nmoins = 0, Nplus = 0
    /** Nombre de tirages dans où y < f(x) < 0, resp 0 < f(x) < y. */
    let Nmoinssup = 0, Nplusinf = 0

    let xMoins = [], xMoinsSup = [], xPlus = [], xPlusInf = []
    let yMoins = [], yMoinsSup = [], yPlus = [], yPlusInf = []

    for (let i = 0; i < N; i++){
        let x = uniform(x1, x2)
        if (f(x) < 0){
            Nmoins++
            let y = uniform(y1, 0)
            if (y > f(x)){
                Nmoinssup++
                if (i < maxAffiche){
                    xMoinsSup.push(x)
                    yMoinsSup.push(y)
                }
            } else if (i < maxAffiche) {
                xMoins.push(x)
                yMoins.push(y)
            }
        } else if (f(x) > 0){
            Nplus++
            let y = uniform(0, y2)
            if (y < f(x)){
                Nplusinf++
                if (i < maxAffiche){
                    xPlusInf.push(x)
                    yPlusInf.push(y)
                }
            } else if (i < maxAffiche) {
                xPlus.push(x)
                yPlus.push(y)
            }
        }
    }

    /** Surfaces totales où on a samplé les points de Nmoins, resp de Nplus */
    let surfaceIntegreeMoins = -y1 * (x2-x1)*(Nmoins/N)
    let surfaceIntegreePlus = y2 * (x2-x1)*(Nplus/N)

    // Pour obtenir les aires négatives et positives,
    // on multiplie la proportion de points ""sous"" la courbe par la surface totale
    let Anegative = (Nmoins > 0) ? (Nmoinssup/Nmoins)*surfaceIntegreeMoins : 0
    let Apositive = (Nplus > 0) ? (Nplusinf/Nplus)*surfaceIntegreePlus : 0

    // Affichage
    let s1 = 2, s2 = 3
    let xs = Array.from({length: maxAffiche+1}, (_, i) => x1 + i*(x2-x1)/maxAffiche);
    let ys = xs.map(f)
    let data = [
        {
            x: xs, y: ys,
            mode: 'line',
            showlegend: true,
            name: 'y = ' + fNom,
        },
        {
            x: xPlus, y: yPlus,
            mode: 'markers', marker: { size: s1, color: 'lightgreen', symbol: 'o' }, hovertemplate: '(%{x}, %{y})<extra></extra>',
            showlegend: false,
            name: 'Plus',
        },
        {
            x: xPlusInf, y: yPlusInf,
            mode: 'markers', marker: { size: s2, color: 'green', symbol: 'o' }, hovertemplate: '(%{x}, %{y})<extra></extra>',
            showlegend: false,
            name: 'PlusInf',
        },
        {
            x: xMoins, y: yMoins,
            mode: 'markers', marker: { size: s1, color: 'orange', symbol: 'o' }, hovertemplate: '(%{x}, %{y})<extra></extra>',
            showlegend: false,
            name: 'Moins',
        },
        {
            x: xMoinsSup, y: yMoinsSup,
            mode: 'markers', marker: { size: s2, color: 'red', symbol: 'o' }, hovertemplate: '(%{x}, %{y})<extra></extra>',
            showlegend: false,
            name: 'MoinsSup',
        }
    ]
    let layout = {
        hovermode:'closest',
        xaxis: {
            range: [x1, x2],
        },      
        yaxis: {
            range: [y1, y2],
        },
        margin: {
            l: 40, r: 40, b: 40, t: 40, pad: 4
        },
        legend: {
            x: 1, y: 1.1, xanchor: 'right', "orientation": "h",
        },
        itemwidth: 20
    }

    Plotly.newPlot(canvas, data, layout);

    let HTMLpos = Nplus ? `
        Aire positive :<br>
            &nbsp;&nbsp; <span style='color: green'>${Nplusinf}</span>/<span style='color: lightgreen'>${Nplus}</span> points sous la courbe<br>
            &nbsp;&nbsp; Aire totale sur zéro : ${surfaceIntegreePlus.toFixed(3)}<br>
            &nbsp;&nbsp; Donc I<sup>+</sup> = ${Apositive.toFixed(3)}<br><br>
    ` : ''

    let HTMLneg = Nmoins ? `            
        Aire négative :<br>
        &nbsp;&nbsp; <span style='color: red'>${Nmoinssup}</span>/<span style='color: orange'>${Nmoins}</span> points sur la courbe<br>
        &nbsp;&nbsp; Aire totale sous zéro : ${surfaceIntegreeMoins.toFixed(3)}<br>
        &nbsp;&nbsp; Donc I<sup>-</sup> = ${Anegative.toFixed(3)}<br><br>
    ` : ''
    
    document.getElementById('commentaires').innerHTML = `
        ${HTMLpos}
        ${HTMLneg}        
        Donc l'aire totale vaut :<br>
            &nbsp;&nbsp; I = I<sup>+</sup> - I<sup>-</sup> = <strong>${(Apositive - Anegative).toFixed(3)}</strong>
    `
})


sliderIterations.dispatchEvent(new Event("change"));
inputx1.dispatchEvent(new Event("change"));
inputx2.dispatchEvent(new Event("change"));
inputFunc.dispatchEvent(new Event("change"));