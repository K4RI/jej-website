import "https://cdnjs.cloudflare.com/ajax/libs/decimal.js/10.4.3/decimal.js";


/** Calcule les chiffres du nombre entier x dans la base b. */
function intToBase(x, b){
    return Array.from(x.toString(b), Number)
};

/** Calcule les chiffres du nombre décimal x dans la base b avec une précision i.
 * Attention ! chaque itération fait perdre une précision
*/
function decToBase(x, b, i){
    if (i==0) {
        return []
    }
    const c = Decimal.trunc(x.times(b));
    console.log(x.toNumber(),  c.toNumber())
    return [c.toNumber()].concat(decToBase(x.minus(c/b).times(b), b, i-1))
}

/** Calcule les chiffres du nombre x dans la base b avec une précision i. */
function numToBase(x, b, i=Decimal.precision/2){
    const xdec = Decimal.trunc(x).toNumber();
    return intToBase(xdec, b).concat(decToBase(x.minus(xdec), b, i))
}

/** Calcule les chiffres de la fraction n/d dans la base b. */
export default function fracToBase(n, d, b){
    // console.log(Decimal.precision)
    let nombre = new Decimal(n).dividedBy(new Decimal(d));
    return numToBase(nombre, b);
}