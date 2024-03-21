import "https://cdnjs.cloudflare.com/ajax/libs/decimal.js/10.4.3/decimal.js";

// https://h3manth.com/posts/HTTP-imports-node/
// https://stackoverflow.com/a/50261569/23503309
// https://stackoverflow.com/a/62806068/23503309 AAAAAAAAAAAAAAAHHHHHHHHH

import Turtle from "./turtle.js";
import fracToBase from "./decimal-array.js";

const prec = 100; // la précision. proportionnel au nombre de pas.
const base = 10; // la base voulue
let speed = 2; // fréquence de rafraîchissement
let pas = 0.4; // taille d'un déplacement

Decimal.set({ precision: 2*prec })

let nConv = fracToBase(1, 7, base); // 52 + 1/9

let canvas = document.getElementById('monCanvas');
let tortue = new Turtle(canvas, pas);

tortue.pendown()
for (let i = 0; i < nConv.length; i++){
    window.setTimeout(() => {
        tortue.left(360 * nConv[i]/base);
        tortue.forward(30);
    }, i * speed);
}