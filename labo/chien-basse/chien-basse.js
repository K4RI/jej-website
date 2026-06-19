const bienvenueCB = document.getElementById("bienvenue-cb")
const compteurCB = document.getElementById("compteur-cb")
const terrainCB = document.getElementById("terrain-cb")
let L; // nombre de mètres : 20 50 100 ?
const vitesse = 0.5;
let metres; // distance parcourue
let started = false; // on peut avancer ou non
let running = false; // on court là ou non
let prevkey; // touche précédente : gauche, droite, autre
let tempsDepart; // temps de départ à soustraire pour la durée de course
var compteurID; // boucle de setInterval clearInterval

const buttonsCB = document.createElement("span");
[20, 50, 100].forEach((n) => buttonsCB.appendChild(newButton(n)))

function newButton(val){
    let button = document.createElement("button");
    button.innerText = `${val} mètres`
    button.addEventListener('click', () => { // 2b - bouton qui peut lancer la course
        L = val;
        started = true;
        metres = 0;
        compteurCB.innerHTML = "À vos marques...";
        bienvenueCB.innerHTML = `Bienvenue à la course de chien-basse sur ${L} mètres !<br>Avancez sur la route en alternant les touches ← →`
        terrainCB.innerHTML = afficheTerrain(Math.floor(metres))
    })
    return button
}

function afficheTerrain(k){
    if (k > 0 & k < L) {
        return "📍" + ".".repeat(k-1) + ";" + ".".repeat(L-k-1) + "📍"
    } else {
        return "📍" + ".".repeat(L-1) + "📍"
    }
}

function formatDuree(t){ // au format " 1.02s"
    let secs = Math.floor(t/1000);
    let cents = Math.floor((t - secs*1000)/10).toString();
    return " ".repeat(Math.max(0, 2-secs.toString().length))
            + secs
            + "."
            + "0".repeat(Math.max(0, 2-cents.length))
            + cents
            + "s";
}

function formatDistance(d){ // au format " 1.0 mètres"
        let mets = Math.floor(d).toString();
        return " ".repeat(Math.max(0, 2-mets.length))
                + mets
                + " mètres";
}

function afficheCompteur(){
    compteurCB.innerHTML = formatDistance(metres) + " - " + formatDuree((new Date().getTime()) - depart)
}

// 1a - état initial
bienvenueCB.innerHTML = "Bienvenue à la course de chien-basse !<br>Quelle distance ? ";      
bienvenueCB.appendChild(buttonsCB)
compteurCB.innerHTML = "<br>";
terrainCB.innerHTML = "📍📍";

window.addEventListener('keydown', (event) => { // 2 - avancement de course
    gd = (event.key == "ArrowLeft") ? "left" :
        (event.key == "ArrowRight") ? "right" :
        "none";
    handleCB(gd)
})

const divCB = document.getElementById("chien-basse");
divCB.addEventListener("touchstart", (event) => {
    gd = (event.touches[0].pageX <= divCB.clientWidth / 2) ? "left" : "right";
    handleCB(gd)
});

function handleCB(gd) {
    if (started) {
        if (!running) {
            if (gd == "left" | gd == "right"){
                depart = new Date().getTime();
                compteurID = setInterval(afficheCompteur, 50)
                running = true; // si on mettait "if (metres == 0)" il le lancerait deux fois bref
            }
        }
        if (metres < L) {
            if ((gd == "left" & prevkey == "right") | (gd == "right" & prevkey == "left")){
                metres += vitesse;
            }
            if (gd == "left" | gd == "right"){
                terrainCB.innerHTML = afficheTerrain(Math.floor(metres))
            }
            prevkey = gd
        }
        if (metres >= L) { // 3 - on vient de terminer, on est à metres = L
            clearInterval(compteurID);
            compteurCB.innerHTML = `Course de ${L} mètres finie en <strong style="color:red">${Math.floor(((new Date().getTime()) - depart)/10)/100}</strong> secondes :)`
            terrainCB.innerHTML = afficheTerrain(Math.floor(metres))
            bienvenueCB.innerHTML = "Relancer une course de chien-basse ?<br>Quelle distance ? ";      
            bienvenueCB.appendChild(buttonsCB)
            started = false; // désactive l'event listener
            running = false; // désactive la boucle d'affichage
        }
    }
};

// TODO: un graphique de la vitesse à la fin
// bizarre mon bot est 2-3x plus rapide sans l'activation des couleurs... mais à la main aucune diff
// et la course mobile-touch est 3-5x plus lente qu'avec ordi-clic...


// https://developer.mozilla.org/en-US/docs/Web/API/Touch
/*
const divCB = document.getElementById("chien-basse");
divCB.addEventListener("touchstart", (event) => {
    alert(`pageX=${event.touches[0].pageX}, pageY=${event.touches[0].pageY}
screenX=${event.touches[0].screenX}, screenY=${event.touches[0].screenY}
clientX=${event.touches[0].clientX}, clientY=${event.touches[0].clientY}
screenWidth=${window.screen.width}, screenHeight=${window.screen.height}
clientWidth=${divCB.clientWidth}, clientHeight=${divCB.clientHeight}
offsetWidth=${divCB.offsetWidth}, offsetHeight=${divCB.offsetHeight}`)
});

divCB.addEventListener("click", (event) => {
    console.log(divCB.clientWidth, divCB.clientHeight, divCB.offsetWidth, divCB.offsetHeight)
});
*/