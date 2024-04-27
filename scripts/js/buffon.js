/**
 * JavaScript pour la page jeux/bertrand-paradox du site jej888.fr.
 */

import "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.30.1/plotly.min.js"

/** initialisation des variables et des HTMLElements */
var maxIters = 1000;
var longueurAiguilles = 5;
var nbrePlanches = 5;

const width = 400, height = 200;
const maxAffiche = 1000;
const w = 2;
const marge = 0.1;


const canvas = document.querySelector('.app-canvas');
const sliderIterations = document.getElementById('iterations');
const textIterations = document.getElementById('iterations-span');
const sliderTaille = document.getElementById('taille');
const textTaille = document.getElementById('taille-span');
const sliderPlanches = document.getElementById('planche');
const textPlanches = document.getElementById('planche-span');
const boutonLancer = document.getElementById('lancer');
const commentaires = document.getElementById('commentaires');


sliderIterations.addEventListener("change", (event) => {
    textIterations.innerHTML = sliderIterations.value;
    maxIters = parseInt(sliderIterations.value);
})

sliderTaille.addEventListener("change", (event) => {
    textTaille.innerHTML = sliderTaille.value;
    longueurAiguilles = parseInt(sliderTaille.value);
})

sliderPlanches.addEventListener("change", (event) => {
    textPlanches.innerHTML = sliderPlanches.value;
    nbrePlanches = parseInt(sliderPlanches.value);
})


function layoutShapes(){
    var shapes = [{
        type: 'rect',
        x0: 0,
        y0: 0,
        x1: width,
        y1: height,
        line: {
            color: 'black',
            width: 2
        }
    }]
    for (let i = 0; i < nbrePlanches; i++){
        shapes.push({
            type: 'line',
            x0: i * (width/nbrePlanches),
            y0: 0,
            x1: i * (width/nbrePlanches),
            y1: height,
            line: {
                color: 'black',
                width: 2,
            },
        })
    }
    return shapes;
}


boutonLancer.addEventListener('click', (event) => {
    var data = [{
            x: [0, 0],
            y: [0, 0],
            mode: 'lines',
            line: { color: 'red', width: w,},
            name: 'coupure',
        },
        {
            x: [0, 0],
            y: [0, 0],
            mode: 'lines',
            line: { color: 'green', width: w,},
            name: 'pas de coupure',
        }
    ]
    let larg = width/nbrePlanches;
    let cpt = 0;
    let color = ''
    for (let i = 0; i < maxIters; i++){
        let x = width*Math.random();
        let y = longueurAiguilles + (height - 2*longueurAiguilles)*Math.random();
        let theta = 2*Math.PI*Math.random();

        let x1 = x + longueurAiguilles*Math.cos(theta)
        let y1 = y + longueurAiguilles*Math.sin(theta)

        if (Math.floor(x/larg) != Math.floor(x1/larg)){
            color = 'red';
            cpt += 1;
        } else {
            color = 'green';
        }
        if (i < maxAffiche){
            data.push({
                x: [x, x1],
                y: [y, y1],
                mode: 'lines', // on affiche une corde et ses extrémités
                line: {
                    color: color,
                    width: w,
                },
                hovertemplate: '(%{x}, %{y})<extra></extra>',
                showlegend: false,
            })
        }
    }
    
    var layout = {
        shapes: layoutShapes(),
        xaxis: {
            range: [-width*marge, width*(1+marge)],
            showgrid: false, // retirer la grille verticale
            zeroline: false, // et l'axe des ordonnées
        },
        yaxis: {
            range: [-height*marge, height*(1+marge)],
            showgrid: false, // retirer la grille verticale
            zeroline: false, // et l'axe des ordonnées
        },
        margin: {
            l: 40, r: 10, b: 30, t: 20, pad: 0
        },
        legend: {
          x: 1,
          xanchor: 'right',
          y: 1,
          "orientation": "h",
        }
    }
    Plotly.newPlot(canvas, data, layout);
    let pth = 2*longueurAiguilles/(Math.PI*larg)
    let pobs = cpt/maxIters
    commentaires.innerHTML = `
    Avec l la longueur d'une aiguille et t la distance entre deux rainures,<br>
    Théorique : p* = 2l/πt = <strong>${pth.toFixed(5)}</strong><br>
    Observé : p = ${cpt} / ${maxIters} = <strong>${pobs.toFixed(5)}</strong><br>
    Marge d'erreur : ${(100 * (pobs-pth)/pth).toFixed(3)}%
    `
})


sliderIterations.dispatchEvent(new Event("change"));
sliderTaille.dispatchEvent(new Event("change"));
sliderPlanches.dispatchEvent(new Event("change"));


let commandes = document.querySelector('.app-commandes')
/** Rendre la taille du texte proportionnelle à la taille du canvas */
window.onload = function(event) {
    let w = parseInt(commandes.offsetWidth);
    commandes.style.fontSize = w/320 + 'em'
};
window.onresize = function(event) {
    let w = parseInt(commandes.offsetWidth);
    commandes.style.fontSize = w/320 + 'em'
};

boutonLancer.style.fontSize = '0.8em'