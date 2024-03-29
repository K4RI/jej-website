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

let canvas = document.getElementById('app-canvas');
let context = canvas.getContext('2d');
let tortue = new Turtle(canvas, pas);
tortue.pendown();

let inputNum = document.getElementById('num');
let inputDenom = document.getElementById('denom');
let textValeur = document.getElementById('valappro');
let textValeurb = document.getElementById('valapprob');
let inputBase = document.getElementById('base');
let sliderIterations = document.getElementById('iterations');
let textIterations = document.getElementById('iterations-span');
let sliderTaille = document.getElementById('taille');
let textTaille = document.getElementById('taille-span');
let sliderDuree = document.getElementById('duree');
let textDuree = document.getElementById('duree-span');
let reinit = document.getElementById('reinit');
let lancer = document.getElementById('lancer');
let telecharger = document.getElementById('telecharger');

function valapprob(n, d, b){
    if (b!=10 && b>=2 && b<=36 && d>0) {
        return `= (${fracToBase(n, d, b, 10)}) en base ${b}`;
    } else {
        return "";
    }
    
}

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

function desactivations() {
    inputNum.disabled = true;
    inputDenom.disabled = true;
    inputBase.disabled = true;
    sliderIterations.disabled = true;
    sliderDuree.disabled = true;
    sliderTaille.disabled = true;
    reinit.disabled = true;
    lancer.disabled = true;
}

function activations() {
    inputNum.disabled = false;
    inputDenom.disabled = false;
    inputBase.disabled = false;
    sliderIterations.disabled = false;
    sliderDuree.disabled = false;
    sliderTaille.disabled = false;
    reinit.disabled = false;
    lancer.disabled = false;
}

reinit.addEventListener("click", (event) => {
    tortue.reinitXY();
    for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    activations();
})

lancer.addEventListener("click", (event) => {
    tortue.reinitXY();
    context.clearRect(0, 0, canvas.width, canvas.height);

    const digits = fracToBase(num, denom, base); // 52 + 1/9
    // console.log(Decimal.precision)
    // console.log(digits)
    desactivations();
    reinit.disabled = false;
    window.setTimeout(() => {
        activations();
        telecharger.disabled = false;
    }, digits.length * speed);
    for (let i = 0; i < digits.length; i++){
        timeouts.push(
            window.setTimeout(() => {
                tortue.left(360 * digits[i]/base);
                tortue.forward(pas);
            }, i * speed)
        );
    }
    // console.log(timeouts);
})

telecharger.addEventListener("click", (event) => {
    var link = document.createElement('a');
    link.download = `drawdecimals_${num}_${denom}_base${base}.png'`;
    link.href = canvas.toDataURL()
    link.click();
})

telecharger.disabled = true;

inputNum.dispatchEvent(new Event("input"));
inputDenom.dispatchEvent(new Event("input"));
inputBase.dispatchEvent(new Event("input"));
sliderIterations.dispatchEvent(new Event("change"));
sliderDuree.dispatchEvent(new Event("change"));
sliderTaille.dispatchEvent(new Event("change"));