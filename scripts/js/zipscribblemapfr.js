/**
  * JavaScript pour la page jeux/zipscribblemapFR du site jej888.fr.
*/

import "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.30.1/plotly.min.js"
import 'https://cdn.jsdelivr.net/npm/jquery-csv@1.0.21/src/jquery.csv.min.js'

/** initialisation des variables et des HTMLElements */
let afficheDeps = false;
let resolution = 360;
let w = 0.5;
let wd = 0.2;

let checkDeps = document.getElementById("deps");
let sliderWidth = document.getElementById("width");
let textWidth = document.getElementById("width-span");
let sliderWidthD = document.getElementById("widthD");
let textWidthD = document.getElementById("widthD-span");
let boutonTracer = document.getElementById("tracer");
let boutonReinit = document.getElementById("reinit");
let selectRes = document.getElementById("resolution");
let boutonTelecharger = document.getElementById("telecharger");
let canvas = document.querySelector(".app-canvas");
let loading = document.getElementById("loading");


checkDeps.checked = false // on initialise à rien cocher
selectRes.value = '1080';

boutonTracer.disabled = true;
boutonReinit.disabled = true;
selectRes.disabled = true;
boutonTelecharger.disabled = true;


/** association des boutons aux paramètres */
checkDeps.addEventListener("change", (event) => {
    afficheDeps = checkDeps.checked;
    document.getElementById("wd").style.display = afficheDeps ? 'inline' : 'none'
})

sliderWidth.addEventListener("change", (event) => {
    textWidth.innerHTML = sliderWidth.value;
    w = sliderWidth.value;
})

sliderWidthD.addEventListener("change", (event) => {
    textWidthD.innerHTML = sliderWidthD.value;
    wd = sliderWidthD.value;
})

boutonReinit.addEventListener("click", (event) => {
    canvas.innerHTML = "";
})

selectRes.addEventListener("change", (event) => {
    resolution = selectRes.value;
})

boutonTelecharger.addEventListener("click", (event) => {
    Plotly.downloadImage(canvas, {format: 'png', width: resolution, height: resolution, filename: `zipscribblemap_${resolution}x${resolution}`});
})


let relinLat = x => 9.067125875160348e-6*x -13.362329239550334
let relinLong = x => 1.2408828030287988e-5*x -5.7279126035491315

/** initialisation du chemin et des données */
async function initPathRecords(){
    let depLong = x => (0.0294*x -5).toFixed(3)
    let depLat = x => (0.0215*x + 52.23).toFixed(3)

    let paths = []
    await $.get('../../jeux/france_vect.txt', function( data ) { // on lit le texte
        const header = 'x0 y0 x1 y1\n'
        let records = $.csv.toObjects(header + data, {separator: " "});

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

/** Séparer par département et trier le tableau */
function sepsortRec(records){  
    // séparer les entrées par département
    let separatedRecords = {};
    for (let i = 0; i < records.length; i++) {
        if(records[i]['nom'] == 'Asprières'){ // les dernières entrées avec la localisation qui déconne
            break;
        }
        let dep = ~~(records[i]['code_postal']/1000)
        if (!(dep in separatedRecords)){
            separatedRecords[dep] = [records[i]]
        } else {
            separatedRecords[dep].push(records[i])
        }
    }
    // trier par code postal
    for (let key in separatedRecords){
        separatedRecords[key] = separatedRecords[key].sort((a, b) => a['code_postal'] - b['code_postal']);
    }
    return separatedRecords;
}

selectRes.dispatchEvent(new Event("change"));
checkDeps.dispatchEvent(new Event("change"));
sliderWidth.dispatchEvent(new Event("change"));
sliderWidthD.dispatchEvent(new Event("change"));

const [paths, record] = await initPathRecords();
const records = sepsortRec(record);

loading.style.display = 'none';
boutonTracer.disabled = false;
boutonReinit.disabled = false;

boutonTracer.addEventListener("click", (event) => {
    let shapes = [];
    if (afficheDeps){
        paths.forEach((p) => {
            shapes.push({
                type: 'path',
                path: p,
                line: {color: 'black', width: wd}
            })
        })
    }

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

    let data = []
    // dans chaque liste départementale, l'entrer dans le data
    for (let key in records){
        let xs = [], ys = [], names = [];
        for (let c in records[key]){
            xs.push(relinLong(records[key][c]['x']));
            ys.push(relinLat(records[key][c]['y']));
            names.push(`${records[key][c]['nom']} - ${records[key][c]['code_postal']}`);
        }
        data.push({
            x: xs,
            y: ys,
            text: names,
            type: 'line',
            line: {width: w, color: `rgb(${255*Math.random()}, ${255*Math.random()}, ${255*Math.random()})`},
            hovertemplate: '%{text}<extra></extra>',
            // hovertemplate: '%{text}<br>(%{y}, %{x})<extra></extra>',      
            showlegend: false,      
        })
    }
    
    Plotly.newPlot(canvas, data, layout);
    selectRes.disabled = false;
    boutonTelecharger.disabled = false;
})
