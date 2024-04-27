import "https://cdnjs.cloudflare.com/ajax/libs/decimal.js/10.4.3/decimal.js";

// https://h3manth.com/posts/HTTP-imports-node/
// https://stackoverflow.com/a/50261569/23503309
// https://stackoverflow.com/a/62806068/23503309 AAAAAAAAAAAAAAAHHHHHHHHH

import Turtle from "./turtle.js";
import fracToBase from "./decimal-array.js";

var num = 1; // la fraction
var denom = 7;
var base = 10; // et la base voulue

var prec = 100; // la précision. proportionnel au nombre de pas
var speed = 2; // fréquence de rafraîchissement
var pas = 5; // taille d'un déplacement

var timeouts = [];

Decimal.set({ precision: 2*prec })

const canvas = document.querySelector('.app-canvas');
const context = canvas.getContext('2d');
const tortue = new Turtle(canvas, pas);
tortue.pendown();

const inputNum = document.getElementById('num');
const inputDenom = document.getElementById('denom');
const textValeur = document.getElementById('valappro');
const textValeurb = document.getElementById('valapprob');
const inputBase = document.getElementById('base');
const sliderIterations = document.getElementById('iterations');
const textIterations = document.getElementById('iterations-span');
const sliderTaille = document.getElementById('taille');
const textTaille = document.getElementById('taille-span');
const sliderDuree = document.getElementById('duree');
const textDuree = document.getElementById('duree-span');
const boutonReinit = document.getElementById('reinit');
const boutonLancer = document.getElementById('lancer');
const boutonTelecharger = document.getElementById('telecharger');

/** Renvoie les premiers chiffres du développement de n/d en base b
 *  dans le but de l'afficher. */
function valapprob(n, d, b){
    if (b!=10 && b>=2 && b<=36 && d>0) {
        return `= (${fracToBase(n, d, b, 10)}...) en base ${b}`;
    } else {
        return "";
    }
    
}

/** Lie les curseurs et les sliders aux paramètres. */
inputNum.addEventListener("input", (event) => {
    num = inputNum.value;
    textValeur.innerHTML = num/denom;
    textValeurb.innerHTML = valapprob(num, denom, base);
})

inputDenom.addEventListener("input", (event) => {
    denom = inputDenom.value;
    textValeur.innerHTML = num/denom;
    textValeurb.innerHTML = valapprob(num, denom, base);
    if (denom == 0){
        desactivations()
        inputDenom.disabled = false;
    } else {
        activations()
    }
})

inputBase.addEventListener("input", (event) => {
    base = inputBase.value;
    textValeurb.innerHTML = valapprob(num, denom, base);
    if (base<2 || base>36){
        desactivations()
        inputBase.disabled = false;
    } else {
        activations()
    }
})

sliderIterations.addEventListener("change", (event) => {
    textIterations.innerHTML = sliderIterations.value;
    prec = sliderIterations.value;
    Decimal.set({ precision: 2*prec })
})

sliderTaille.addEventListener("change", (event) => {
    textTaille.innerHTML = sliderTaille.value;
    pas = sliderTaille.value;
})

sliderDuree.addEventListener("change", (event) => {
    textDuree.innerHTML = sliderDuree.value;
    speed = sliderDuree.value;
})

/** Désactive tous les boutons. */
function desactivations() {
    inputNum.disabled = true;
    inputDenom.disabled = true;
    inputBase.disabled = true;
    sliderIterations.disabled = true;
    sliderDuree.disabled = true;
    sliderTaille.disabled = true;
    boutonReinit.disabled = true;
    boutonLancer.disabled = true;
}

/** Active tous les boutons. */
function activations() {
    inputNum.disabled = false;
    inputDenom.disabled = false;
    inputBase.disabled = false;
    sliderIterations.disabled = false;
    sliderDuree.disabled = false;
    sliderTaille.disabled = false;
    boutonReinit.disabled = false;
    boutonLancer.disabled = false;
}

boutonReinit.addEventListener("click", (event) => {
    tortue.reinitXY(); // replace le curseur de dessin au centre
    for (var i = 0; i < timeouts.length; i++) { // annule tous les déplacements en cours
        clearTimeout(timeouts[i]);
    }
    activations();
})

/** Traçage de la figure */
document.getElementById('envoi').addEventListener("submit", (event) => {
    event.preventDefault()
    tortue.reinitXY();
    context.clearRect(0, 0, canvas.width, canvas.height);

    const digits = fracToBase(num, denom, base);
    // console.log(Decimal.precision)
    // console.log(digits)
    desactivations();
    boutonReinit.disabled = false;
    window.setTimeout(() => {
        activations();
        boutonTelecharger.disabled = false;
    }, digits.length * speed); // à la fin du dessin, réactivera tous les boutons

    for (let i = 0; i < digits.length; i++){ // lance chaque dessin l'un après l'autre
        timeouts.push(
            window.setTimeout(() => { // toutes les i millisecondes, la tortue avance et tourne
                tortue.left(360 * digits[i]/base);
                tortue.forward(pas);
            }, i * speed)
        );
    }
    // console.log(timeouts);
})

boutonTelecharger.addEventListener("click", (event) => {
    var link = document.createElement('a');
    link.download = `drawdecimals_${num}_${denom}_base${base}.png'`;
    link.href = canvas.toDataURL()
    link.click();
})

boutonTelecharger.disabled = true;

/** Initialise les paramètres liées aux inputs/sliders */
inputNum.dispatchEvent(new Event("input"));
inputDenom.dispatchEvent(new Event("input"));
inputBase.dispatchEvent(new Event("input"));
sliderIterations.dispatchEvent(new Event("change"));
sliderDuree.dispatchEvent(new Event("change"));
sliderTaille.dispatchEvent(new Event("change"));



let commandes = document.querySelector('.app-commandes')
/** Rendre la taille du texte proportionnelle à la taille du canvas */
window.onload = function(event) {
    let w = parseInt(commandes.offsetWidth);
    commandes.style.fontSize = w/320 + 'em'
    boutonLancer.style.fontSize = '0.8em'
    boutonReinit.style.fontSize = '0.8em'
    boutonTelecharger.style.fontSize = '0.8em'
    inputNum.style.fontSize = '0.8em'
    inputDenom.style.fontSize = '0.8em'
    inputBase.style.fontSize = '0.8em'
};
window.onresize = function(event) {
    let w = parseInt(commandes.offsetWidth);
    commandes.style.fontSize = w/320 + 'em'
};