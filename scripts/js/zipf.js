/**
  * JavaScript pour la page jeux/zipf du site jej888.fr.
*/

import "https://cdnjs.cloudflare.com/ajax/libs/jschardet/3.2.0/jschardet.min.js"
import "https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.30.1/plotly.min.js"

/** initialisation des variables et des HTMLElements */
let boutonFichier = document.getElementById("bouton-fichier");
let envoi = document.getElementById("envoi");
let textErreur = document.getElementById("encoding-error");

let btnsRadio = document.querySelectorAll("#zoneChoix input");

/** les boutons radio de sélection d'un texte du corpus */
btnsRadio.forEach(btn => {
    btn.checked = false;
    btn.addEventListener("change", async (event) => {
        let filePromise = createTxtFile(`../../jeux/zipf-textes/${btn.value}.txt`, `${btn.value}.txt`)
        let file = {};
        await filePromise.then(
            function(d) {
                file = d
            }
        );
        zipf(file);
    })
})

/** les boutons de téléversement d'un fichier texte */
boutonFichier.addEventListener("click", (event) => {
    textErreur.innerHTML = ""
})

envoi.addEventListener("submit", (event) => {
    event.preventDefault();
    btnsRadio.forEach(btn => {
        btn.checked = false;
    })
    textErreur.innerHTML = ""
    const file = event.target[0].files[0];
    zipf(file);
})

/** 
 * Crée un objet de type File à partir d'un chemin.
 * @param {string} path - le chemin du fichier
 * @param {string} name - le titre du fichier
 * @return {File} un objet de type File correspondant
 */
async function createTxtFile(path, name){
    let response = await fetch(path);
    let data = await response.blob();
    let metadata = {
        type: "text/plain"
    };
    return new File([data], name, metadata);
}


/** 
 * Parse un texte et affiche le résultat du parsing sur la page.
 * @param {File} file - un fichier texte
 */
async function zipf(file) {
    if (file.size > 10000000) {
        textErreur.innerHTML = "Fichier trop lourd !"
    } else {
        try {
            const encoding = await getEncoding(file);
            // console.log(encoding);

            const reader = new FileReader();
            reader.onload = function(e) {
                zipfing(reader.result, file.name);
            };
            reader.readAsText(file, encoding);
        } catch (e){
            textErreur.innerHTML = "Erreur d'encodage du fichier ! Essayez un autre."
        }
    }
}


/** 
 * Renvoie l'encodage d'un fichier texte.
 * @param {File} file - un fichier texte
 * @returns {string} son encodage (UTF-8, ascii...)
 */
function getEncoding(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                resolve(jschardet.detect(reader.result).encoding)
            } catch (e) {
                textErreur.innerHTML = "Erreur d'encodage du fichier ! Essayez un autre."
                // throw TypeError("problème d'encodage");
            }
        };
        reader.readAsBinaryString(file);        
    })
}


/** 
 * Effectue une régression linéaire entre deux listes.
 * @param {Array<Number>} y - la liste des ordonnées
 * @param {Array<Number>} x - la liste des abscisses
 * @returns {Object} les coefficients directeurs + les ordonnées à l'origine + l'erreur quadratique
 */
function linearRegression(y,x){
    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;
    for (var i = 0; i < y.length; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i]*y[i]);
        sum_xx += (x[i]*x[i]);
        sum_yy += (y[i]*y[i]);
    }
    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
    lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

    return lr;
}


/** 
 * Appelé par zipf(). Termine le parsing.
 * @param {string} text - le contenu du fichier 
 * @param {string} name - le nom du fichier
 */
function zipfing(text, name){
    const mots = text.replace(/[^\p{L}]+/gu, ` `)
                     .toLowerCase()
                     .split(" "); // que des lettres, en minuscule, split vers un array
    let n1 = mots.length;
    let compteur = {};
    mots.forEach(mot => {
        if (compteur[mot]) {
            compteur[mot] += 1;
        } else {
            compteur[mot] = 1;
        }
    });
    const occurrences = Object.fromEntries(Object.entries(compteur).sort((a, b) => a[1] - b[1]).reverse());
    const keys = Object.keys(occurrences); // les mots
    const vals = Object.values(occurrences); // les nombres d'occurrences, en ordonnées
    const n = keys.length;
    const rangs = [...Array(n + 1).keys()].slice(1) // les rangs, en abscisses

    // la régression ici !
    let xp = rangs.map(elt => Math.log10(elt))
    let yp = vals.map(elt => Math.log10(elt))
    let lr = linearRegression(yp, xp)

    var data = [
        { // affichage des fréquences
            x: rangs,
            y: vals,
            text: keys,
            type: 'scatter',
            mode: 'markers',
            name: 'occurrences',
            marker: {
                size: 3,
                color: "red",
                opacity: 1
            },
            hovertemplate: '<b>%{text}</b><br>' + 'Rang : %{x}<br>' + '<i>Fréquence</i> : %{y} <extra></extra>',
                // la balise "extra" sert à retirer le nom de la trace à côté !!
            hoverinfo:"x+y",
        },
        
        { // affichage de la régression
            x: [rangs[0], rangs[n-1]],
            y: [rangs[0]**lr['slope'] * 10**lr['intercept'], rangs[n-1]**lr['slope'] * 10**lr['intercept'], 1],
            type: 'scatter',
            mode: 'lines',
            name: `régression linéaire : <br> f ∝ 1/n <sup>${-lr['slope'].toFixed(2)} </sup>`,
            line: {color: "orange", dash: 'dot', width: 2}
        }
    ];
    var layout = {
        title: `Loi de Zipf - ${name} <br><span style="font-size: 0.5em">(${n1} mots dont ${n} différents)</span>`,
        xaxis: {
            title: {
                text: 'rang n'
            },
            type: 'log',
            autorange: true
        },
        yaxis: {
            title: {
                text: "nombre d'occurrences f"
            },
            type: 'log',
            autorange: true
        },
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1
        },
        margin: {
            l: 75,
            r: 50,
            b: 75,
            t: 75,
            pad: 4
        }
    };
    let canvas = document.querySelector('.app-canvas');
    Plotly.newPlot(canvas, data, layout);
    // https://plotly.com/javascript/configuration-options/
}