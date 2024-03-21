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
    return [c.toNumber()].concat(decToBase(x.minus(c/b).times(b), b, i-1))
}

/** Calcule les chiffres du nombre x dans la base b avec une précision i. */
function numToBase(x, b, i=Decimal.precision){
    const xdec = Decimal.trunc(x).toNumber();
    return intToBase(xdec, b).concat(decToBase(x.minus(xdec), b, i))
}

/** Calcule les chiffres de la fraction n/d dans la base b. */
export default function fracToBase(n, d, b){
    let nombre = new Decimal(n).dividedBy(new Decimal(d));
    return numToBase(nombre, b);
}