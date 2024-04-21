/** nombre de valeurs */
var N = 13
const arrValeurs = ['2','3','4','5','6','7','8','9','10','V','D','R','A']

/** nombre de couleurs */
var M = 4
const arrCouleurs = ['pique', 'trèfle', 'çoeur', 'carreau']

/** lors d'une bataille, ajoute-t-on une carte au milieu ? */
var carteIntermediaire = true

/** ordre de récupération des cartes à la fin du pli :
 * 0 : aléatoire
 * 1 : le gagnant d'abord
 * 2 : le joueur 1 d'abord
*/
var ordreRecup = 1

/** le nombre de manches après lequel on considère qu'une partie est "infinie" */
const limite = 20000

let paquet1, paquet2
/**[2 pique, ..., A pique,
    2 trèfle, ..., A trèfle,
    2 coeur, ..., A coeur,
    2 carreau, ..., A carreau]

    couleur : ~~(i/13)
    valeur : i%13
        faire correspondre avec 2 3 4 5 6 7 8 9 10 V D R A
*/


/** Mélange un array selon l'algorithme de Fisher-Yates.
 *  Les permutations ont toutes la même probabilité.
 *  De complexité O(n), avec n la longueur de l'array.
*/
function shuffle(arr) {
    let j, index, temp;
    for (index = arr.length - 1; index > 0; index--) {
        j = Math.floor(Math.random() * (index + 1));
        temp = arr[index];
        arr[index] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

/** Renvoient le nom de la carte d'indice n. */
function valeur(n){
    return arrValeurs[n%N]
}
function couleur(n){
    return arrCouleurs[~~(n/N)]
}
function nomCarte(n){
    return `${valeur(n)} de ${couleur(n)}`
}
function nomCarteShort(n){
    return `${valeur(n)}${couleur(n)[0]}`
}

/** Calcule l'ordre de récupération des cartes */
function ordre(c1, c2){
    switch (ordreRecup){
        case 0: // aléatoire
            return Math.random() > 0.5 ? [c1, c2] : [c2, c1]
        case 1: // le gagnant d'abord
            return (c1%N < c2%N) ? [c1, c2] : [c2, c1]
        case 2: // le joueur 1 d'abord
            return [c1, c2]
    }
}

/** Simule une manche de bataille. */
function manche(v, main = []){
    let c1 = paquet1.shift()
    let c2 = paquet2.shift()
    main.push(...ordre(c1, c2))
    if (v) console.log(valeur(c1) + ' ' + valeur(c2))

    if (c1%N > c2%N){
        paquet1.push(...main)
        if (v) console.log("----1 l'emporte")
    } else if (c2%N > c1%N){
        paquet2.push(...main)
        if (v) console.log("----2 l'emporte")
    } else if (paquet1.length && paquet2.length){ // égalité : une carte puis on rejoue
        if (carteIntermediaire){
            c1 = paquet1.shift()
            c2 = paquet2.shift()
            main.push(...ordre(c1, c2))
        }
        if (v) console.log("égalité !!")
        if (v) console.log('avec la main : ', main.map(e => valeur(e)))
        if (paquet1.length && paquet2.length){
            manche(v, main)
        }
    }
}

/** Simule une partie de bataille. */
function partie(v=true){
    let cartes = shuffle([...Array(N*M).keys()]);    
    paquet1 = cartes.slice(0, N*M/2)
    paquet2 = cartes.slice(N*M/2, N*M)

    let tour = 0;
    while(paquet1.length && paquet2.length && tour < limite){
        if (v) console.log(`\nTOUR N°${tour} :
            ${paquet1.length} : ${paquet1.map(e => valeur(e))}
            ${paquet2.length} : ${paquet2.map(e => valeur(e))}
        `)
        manche(v)
        tour++
    }
    if (paquet1.length && paquet2.length){
        if (v) console.log('limite atteinte...')
        return 0
    } else {
        if (v) console.log(paquet1.length ? 'joueur 1 gagne' : 'joueur 2 gagne')
        if (v) console.log(tour + ' tours')
        return tour
    }
}

const numSort = array => array.sort((a, b) => a - b)
const mean = array => array.length ? array.reduce((a, b) => a + b) / array.length : 'VIDE';
const median = array => numSort(array)[~~(array.length/2)]

function test(){
    let nParties = 100000
    let nInfinies = 0
    let parties = []
    for (let i=0; i<nParties; i++){
        let tour = partie(false)
        if (tour){
            parties.push(tour)
        } else {
            nInfinies++
        }
    }

    console.log(`${N} VALEURS x ${M} COULEURS = ${N*M} CARTES
    Ordre : ${ordreRecup == 0 ? 'aléatoire' : ordreRecup == 1 ? 'gagnant en premier' : 'joueur 1 en premier'}
    Carte intermédiaire : ${carteIntermediaire ? 'OUI' : 'NON'}

    Parties infinies (+ de ${limite} tours) : ${nInfinies}/${nParties}
    Parties finies les plus longues : ${numSort(parties).reverse().slice(0, 5)}
    Moyenne : ${mean(parties)}
    Médiane : ${median(parties)}`)
}
test()

/**
 * déjà en mettant un aléatoire dans l'ordre de jeu entre les 2 joueurs, on a plus aucune partie infinie !
 * alors que dans l'ordre prédéfini (gagnant puis perdant), elles existent... https://arxiv.org/pdf/1007.1371.pdf
 * https://www.cristal.univ-lille.fr/~jdelahay/pls/1995/030.pdf
 * https://math.pugetsound.edu/~mspivey/War.pdf
*/