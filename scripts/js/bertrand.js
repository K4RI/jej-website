import "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.30.1/plotly.min.js"

// initialisation des variables et des HTMLElements
var maxIters = [200, 200, 200];
var maxAffiche = 2000;

let canvasLeft = document.querySelectorAll('.app-canvas.left');
let canvasRight = document.querySelectorAll('.app-canvas.right');
let boutonsLancerUn = document.querySelectorAll('.lancer-un');
let boutonsLancer = document.querySelectorAll('.lancer');
let slidersIterations = document.querySelectorAll('.iterations');
let textsIterations = document.querySelectorAll('.iterations-span');
let mathButtons = document.querySelectorAll('.mathbutton');
let mathTexts = document.querySelectorAll('.mathtext');

// association des variables aux sliders
for (let i = 0; i < 3; i++) {
    slidersIterations[i].addEventListener("change", (event) => {
        textsIterations[i].innerHTML = slidersIterations[i].value;
        maxIters[i] = slidersIterations[i].value;
    })
}

// association des boutons d'affichage aux textes
for (let i = 0; i < 6; i++) {
    mathButtons[i].addEventListener("click", (event) => {
        mathTexts[~~(i/2)].style.display = mathTexts[~~(i/2)].style.display === 'inline' ? 'none' : 'inline';
    })
}

// définition des layouts
let layoutLeft = {
    showlegend: false, // retirer la légende
    xaxis: {
        range: [-1.1, 1.1],
        linecolor: 'black', // afficher une bordure à gauche
        mirror: true, // et à droite
        showgrid: false, // retirer la grille verticale
        zeroline: false, // et l'axe des ordonnées
    },      
    yaxis: {
        range: [-1.1, 1.1],
        linecolor: 'black', // afficher une bordure en bas
        mirror: true, // et en haut
        showgrid: false, // retirer la grille horizontale
        zeroline: false, // et l'axe des abscisses
    },
    shapes: [
        {    
            type: 'circle', x0: -1, y0: -1, x1: 1, y1: 1, opacity: 0.5, line: { width: 3 }
        }
    ],
    margin: {
        l: 40, r: 40, b: 40, t: 40, pad: 4
    }
}

const layoutRight = n => ({
    title: `<span style='font-size: 0.8em'>Histogramme de distribution pour ${n} cordes</span>`,
    margin: {
        l: 40, r: 40, b: 40, t: 40, pad: 4
    },
    showlegend: true,
    legend: {
        x: 0,
        xanchor: 'left',
        y: 1
    },
    xaxis: {
        range: [0, 2],
    }
})

const traceColorbar = { // le 1er élément sert juste pour la heatmap-colorbar
    x: [0, 1e-309], // attention c'est un peu technique :
    y: [0, 1e-309], // plotly se casse dès qu'on atteint des pixels plus petits que 2^-1024 = 5e-309
    z: [0, 2], // donc on choisit cette taille pour ne jamais pouvoir les afficher
    type: 'heatmap',
    colorscale: [
        [0, 'red'],
        [1, 'yellow']
    ]
}

function g1() {
    let th1 = 2*Math.PI*Math.random();
    let th2 = 2*Math.PI*Math.random();
    return [Math.cos(th1),
            Math.cos(th2),
            Math.sin(th1),
            Math.sin(th2),
            0,0];
}
function g2() {
    let r = Math.random();
    let theta = 2*Math.PI*Math.random();
    let a = Math.sqrt(1 - r**2);
    return [r*Math.cos(theta) - a*Math.sin(theta),
            r*Math.cos(theta) + a*Math.sin(theta),
            r*Math.sin(theta) + a*Math.cos(theta),
            r*Math.sin(theta) - a*Math.cos(theta),
            r, theta];
}
function g3() {
    let r = Math.sqrt(Math.random());
    let theta = 2*Math.PI*Math.random();
    let a = Math.sqrt(1 - r**2);
    return [r*Math.cos(theta) - a*Math.sin(theta),
            r*Math.cos(theta) + a*Math.sin(theta),
            r*Math.sin(theta) + a*Math.cos(theta),
            r*Math.sin(theta) - a*Math.cos(theta),
            r, theta];
}
const generators = [g1, g2, g3]

const f1 = (x) => 2/(Math.PI * Math.sqrt(4-x**2));
const f2 = (x) => x/(2 * Math.sqrt(4-x**2));
const f3 = (x) => x/2;
const functions = [f1, f2, f3]
const fnames = [
    '2/π√<span style="text-decoration: overline"> 4-x² </span>',
    'x/2√<span style="text-decoration: overline"> 4-x² </span>',
    'x/2'
]


for (let i = 0; i < 3; i++) {
    boutonsLancerUn[i].addEventListener("click", (event) => {
        let [x1, x2, y1, y2, r, theta] = generators[i]();
        var d = Math.sqrt((y2-y1)**2 + (x2-x1)**2);
        var data = [
            traceColorbar,
            {
                x: [x1, x2],
                y: [y1, y2],
                mode: 'lines+markers',
                line: {
                    color: `rgb(255, ${255*d/2}, 0)`,
                    width: 3,
                },
                marker: { size: 10, color: 'black' },
                hovertemplate: '(%{x}, %{y})<extra></extra>',
            }
        ];
        if (i >= 1){
            data.push({
                x: [0, r*Math.cos(theta)],
                y: [0, r*Math.sin(theta)],
                mode: 'lines+markers',
                line: {
                    color: `black`,
                    width: 1,
                },
                marker: { size: 8, color: 'grey', symbol: 'x' },
                hovertemplate: '(%{x}, %{y})<extra></extra>',
            })
        }

        Plotly.newPlot(canvasLeft[i], data, layoutLeft);
        switch (i){
            case 0:
                canvasRight[i].innerHTML = `
                    <div style="padding: 40px">
                        Les points tirés sont, en noir : 
                        <ul>
                            <li> (${x1.toFixed(3)}, ${y1.toFixed(3)})
                            <li> (${x2.toFixed(3)}, ${y2.toFixed(3)})
                        </ul>
                        La taille de la corde les reliant vaut : <strong>${d.toFixed(3)}</strong>
                    </div>
                `;
                break;
            
            case 1:
                canvasRight[i].innerHTML = `
                    <div style="padding: 30px">
                        La distance au centre choisie est : ${r.toFixed(3)}
                        <br>
                        Un point correspondant, en gris : (${(r*Math.cos(theta)).toFixed(3)}, ${(r*Math.sin(theta)).toFixed(3)})
                        <br><br>
                        Il est le centre de la corde reliant les points, en noir :
                        <ul>
                            <li> (${x1.toFixed(3)}, ${y1.toFixed(3)})
                            <li> (${x2.toFixed(3)}, ${y2.toFixed(3)})
                        </ul>
                        La taille de cette corde vaut : <strong>${d.toFixed(3)}</strong>
                    </div>
                `;
                break;
            
            case 2:
                canvasRight[i].innerHTML = `
                    <div style="padding: 30px">
                        Le point tiré est, en gris : (${(r*Math.cos(theta)).toFixed(3)}, ${(r*Math.sin(theta)).toFixed(3)})
                        <br><br>
                        Il est le centre de la corde reliant les points, en noir :
                        <ul>
                            <li> (${x1.toFixed(3)}, ${y1.toFixed(3)})
                            <li> (${x2.toFixed(3)}, ${y2.toFixed(3)})
                        </ul>
                        La taille de cette corde vaut : <strong>${d.toFixed(3)}</strong>
                    </div>
                `;
                break;
        }
        
    })
}

for (let i = 0; i < 3; i++) {
    boutonsLancer[i].addEventListener("click", (event) => {
        var data = [traceColorbar];
        var dists = [];
        for (let j = 0; j < maxIters[i]; j++) {
            
            let [x1, x2, y1, y2] = generators[i]();
            var d = Math.sqrt((y2-y1)**2 + (x2-x1)**2);

            if (j < maxAffiche){
                var obj = {
                    x: [x1, x2],
                    y: [y1, y2],
                    mode: 'lines',
                    line: {
                        color: `rgb(255, ${255*d/2}, 0)`,
                        width: 1,
                    },
                    hovertemplate: '(%{x}, %{y})<extra></extra>',
                };
                data.push(obj);
            }
            dists.push(d);
        }

        Plotly.newPlot(canvasLeft[i], data, layoutLeft);

        var arange = Array.from({length: 200}, (_, j) => 0 + 0.01 * j); // de 0 à 1.99
        var datahist = [
            {
                x: dists,
                type: 'histogram',
                xbins: {
                    start: 0, end: 1.99, size: 0.01,
                },
                name: `Distribution des tailles de cordes`,
                hovertemplate: '<b>Taille observée</b> <br>Entre %{x} : %{y} cordes<extra></extra>',
            },
            {
                x: arange,
                y: arange.map(x => maxIters[i]*0.01 * functions[i](x)),
                line: {color: "black", dash: 'dot', width: 2},
                name: `(distribution théorique : ${fnames[i]})`,
                hovertemplate: '<b>Théorique</b> <br>f(%{x}) = %{y}<extra></extra>',
            }
        ];
        canvasRight[i].innerHTML = ''
        Plotly.newPlot(canvasRight[i], datahist, layoutRight(maxIters[i]));
    })
}

for (let i = 0; i < 3; i++) {
    slidersIterations[i].dispatchEvent(new Event("change"))
}