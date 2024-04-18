/**
  * JavaScript pour la page jeux/zipdecode du site jej888.fr.
*/

import "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.30.1/plotly.min.js"
import 'https://cdn.jsdelivr.net/npm/jquery-csv@1.0.21/src/jquery.csv.min.js'

/** initialisation des variables et des HTMLElements */
let resolution = 360
let wd = 0.2;
let size = 2;
let zipcode = ''
let zoom = false

let sliderPointsize = document.getElementById("pointSize");
let textPointsize = document.getElementById("pointSize-span");
let sliderWidthD = document.getElementById("widthD");
let textWidthD = document.getElementById("widthD-span");
let inputZIP = document.getElementById("zipcode");
let selectRes = document.getElementById("resolution");
let boutonTelecharger = document.getElementById("telecharger");
let canvas = document.querySelector(".app-canvas");
let loading = document.getElementById("loading");
let checkZoom = document.getElementById("zoom");

checkZoom.checked = false // on initialise à rien cocher
selectRes.value = '1080';
inputZIP.value = '';

inputZIP.disabled = true;
selectRes.disabled = true;
boutonTelecharger.disabled = true;


/** association des boutons aux paramètres */
checkZoom.addEventListener("change", (event) => {
    zoom = checkZoom.checked;
    tracer();
})

sliderPointsize.addEventListener("change", (event) => {
    textPointsize.innerHTML = sliderPointsize.value;
    size = sliderPointsize.value;
    tracer();
})

sliderWidthD.addEventListener("change", (event) => {
    textWidthD.innerHTML = sliderWidthD.value;
    wd = sliderWidthD.value;
    tracer();
})

selectRes.addEventListener("change", (event) => {
    resolution = selectRes.value;
})

boutonTelecharger.addEventListener("click", (event) => {
    Plotly.downloadImage(canvas, {format: 'png', width: resolution, height: resolution, filename: `zipdecode_${zipcode}${'x'.repeat(5-zipcode.length)}_${resolution}p`});
})


let relinLat = x => 9.067125875160348e-6*x -13.362329239550334
let relinLong = x => 1.2408828030287988e-5*x -5.7279126035491315

/** l'aspect ratio de la carte de France */
var aspectRatio = 1

/** initialisation du chemin et des données */
async function initPathRecords(){
    let depLong = x => (0.0294*x -5).toFixed(3)
    let depLat = x => (0.0215*x + 52.23).toFixed(3)

    let paths = []
    await $.get('../../jeux/france_vect.txt', function( data ) { // on lit le texte
        const header = 'x0 y0 x1 y1\n'
        let records = $.csv.toObjects(header + data, {separator: " "});

        let xs = records.map(elt => depLong(elt['x0']))
        let ys = records.map(elt => depLat(-elt['y0']))
        let mx = Math.min(...xs), Mx = Math.max(...xs), my = Math.min(...ys), My = Math.max(...ys)
        aspectRatio = (Mx-mx)/(My-my)

        let pathStr = 'M '
        // les coordonnées précédentes
        let x0p = records[0]['x0'], y0p = -records[0]['y0']
        for (let i = 1; i < records.length; i++) {
            let x0 = records[i]['x0'], y0 = -records[i]['y0']
            if ((x0-x0p)**2 + (y0-y0p)**2 > 60){ // s'il y a un trop grand écart
                // console.log(x0, y0, x0p, y0p, (x0-x0p)**2 + (y0-y0p)**2)
                paths.push(pathStr);
                pathStr = 'M '
            }
            pathStr += `${depLong(x0)},${depLat(y0)} L`
            x0p = x0, y0p = y0;
            
        }
    })
    
    // lire le csv
    let records;
    await $.get('../../jeux/villes_utf8.csv', function( text ) {
        const header = 'index;code_commune;code_postal;nom;habitants;densite;latitude;longitude;x;y\n'
        records = $.csv.toObjects(header + text, {separator: ";"});
    });
    
    return [paths, records]
}

const [paths, records] = await initPathRecords();
loading.style.display = 'none';
inputZIP.disabled = false;
selectRes.dispatchEvent(new Event("change"));
sliderPointsize.dispatchEvent(new Event("change"));
sliderWidthD.dispatchEvent(new Event("change"));

inputZIP.addEventListener("change", (event) => {
    zipcode = inputZIP.value;
    tracer();
})

/** Étire un intervalle [x1, x2] d'un facteur f. */
function extendRange(x1, x2, f){
    let centre = (x1 + x2)/2, demilargeur = (x2 - x1)/2
    return [centre - f*demilargeur, centre + f*demilargeur]
}

function tracer(){    
    let shapes = [];
    paths.forEach((p) => {
        shapes.push({
            type: 'path',
            path: p,
            line: {color: 'black', width: wd}
        })
    })

    let layout = {
        shapes: shapes,
        xaxis: {
            showgrid: true, // retirer la grille verticale
            zeroline: false, // et l'axe des ordonnées
            // dtick: 1
        },
        yaxis: {
            showgrid: true, // retirer la grille verticale
            zeroline: false, // et l'axe des ordonnées
            // dtick: 1
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

    if (zoom && zipcode.length >= 2){ // on zoome sur le département
        const dep = zipcode.slice(0, 2)
        const depRegex = new RegExp(`^${dep}[0-9]*`)
        let recordsDep = records.filter(elt => depRegex.test(elt['code_postal']))
        let xs = recordsDep.map(elt => relinLong(elt['x']))
        let ys = recordsDep.map(elt => relinLat(elt['y']))

        let mx = Math.min(...xs), Mx = Math.max(...xs), my = Math.min(...ys), My = Math.max(...ys)

        /** l'aspect ratio d'une fenêtre exactement bornée par les points du département */
        let aspectRatioT = (Mx-mx)/(My-my)

        /** l'espace que l'on souhaite laisser autour de l'enveloppe des points */
        let fact = 1.7

        if (aspectRatioT < aspectRatio){ // il faut étendre les x
            let xc = (mx+Mx)/2, xr = (My-my)*aspectRatio
            layout['xaxis']['range'] = extendRange(xc - xr/2, xc + xr/2, fact)
            layout['yaxis']['range'] = extendRange(my, My, fact)
        } else { // il faut étendre les y
            let yc = (my+My)/2, yr = (Mx-mx)/aspectRatio
            layout['xaxis']['range'] = extendRange(mx, Mx, fact)
            layout['yaxis']['range'] = extendRange(yc - yr/2, yc + yr/2, fact)
        }
    }

    let data = [];
    if (zipcode){
        const zipRegex = new RegExp(`^${zipcode}[0-9]*`);

        /** les communes avec le bon code postal */
        let xsYes = [], ysYes = [], namesYes = [];
        /** les communes avec le mauvais code postal */
        let xsNo = [], ysNo = [], namesNo = [];

        for (let key in records){
            if (zipRegex.test(records[key]['code_postal'])){
                xsYes.push(relinLong(records[key]['x']));
                ysYes.push(relinLat(records[key]['y']));
                namesYes.push(`${records[key]['nom']} - ${records[key]['code_postal']}`);
            } else {
                xsNo.push(relinLong(records[key]['x']));
                ysNo.push(relinLat(records[key]['y']));
                namesNo.push(`${records[key]['nom']} - ${records[key]['code_postal']}`);
            }
        }
        console.log(namesYes)

        data = [
            {
                x: xsYes,
                y: ysYes,
                text: namesYes,
                mode: 'markers',
                marker: {color: 'red', size: size},
                hovertemplate: '%{text}<extra></extra>',
                showlegend: false,
            }
        ]
    } else {
        data = [
            {
                x: [0], y: [45], mode: 'lines', hoverinfo: 'skip', showlegend: false,
            }
        ]
    }

    Plotly.newPlot(canvas, data, layout);
    selectRes.disabled = false;
    boutonTelecharger.disabled = false;
}

tracer();