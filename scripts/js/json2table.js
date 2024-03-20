/*
  Utilisé pour postits.html
  Remplit un tableau à partir d'un fichier .json, et des checkbox pour afficher selon la catégorie.
*/

const dict = {
    1 : "article scientifique",
    2 : "article de journal ou de blog",
    3 : "jeu ou animation web",
    4 : "page wikipédia",
    5 : "carte",
    6 : "joli blog",
    7 : "art et musique",
    8 : "utile et/ou créatif"
}

const tableau = document.getElementById("tableau");

// Ici on remplit le tableau.
var data_file = "scripts//js//postits.json";
$.getJSON(data_file, function(data){
    $.each(data.reverse(), function(i){
        let row = document.createElement("tr") // à chaque entrée on initialise la nouvelle ligne
        Object.keys(data[i]).forEach(key => {
            var cell = document.createElement("td") // à chaque attribut on initialise une cellule
            switch (key){
                case "Date":
                    cell.innerHTML = data[i]["Date"];
                    break;
                case "URL":
                    if (data[i]["URL"].includes("\n")){ // s'il y a plusieurs url
                        cell.innerHTML = ""
                        data[i]["URL"].split("\n").forEach(elt => {
                            cell.innerHTML += `
                        - <a href=${elt} target="_blank">${elt}</a> <br><br>
                        `}) // on les affiche comme liste avec des tirets
                    } else {
                        cell.innerHTML = `
                        <a href=${data[i]["URL"]} target="_blank">${data[i]["URL"]}</a>
                        `
                    }
                    break;
                case "Description":
                    if (data[i]["Description"].includes("\n")){
                        cell.innerHTML = ""
                        data[i]["Description"].split("\n").forEach(elt => {
                            if (elt){
                                cell.innerHTML += `
                                - ${elt} <br><br>
                                `
                            } else {
                                cell.innerHTML += `
                                <br><br>
                                `
                            }
                        })
                    } else {
                        cell.innerHTML = data[i]["Description"]
                    }                   
                    break;
                case "Categorie":
                    row.classList.add("cat-" + data[i]["Categorie"])
                    cell.innerHTML = dict[data[i]["Categorie"]];
                    break;               
            }
            row.appendChild(cell); // la cellule va dans la ligne
        })
        row.classList.add("hidden")
        tableau.appendChild(row) // la ligne va dans le tableau
    })
})

const btnYes = document.getElementById("btn-yes")
const btnNo = document.getElementById("btn-no")

// Ici on ajoute les eventListener aux checkboxes
Object.keys(dict).forEach(ind => {
    let btn = document.getElementById("btn-" + ind)
    btn.checked = false
    btn.addEventListener("change", (event) => {
        if (event.bubbles){ // s'il n'est pas envoyé depuis btnYes ou btnNo            
            btnYes.checked = false;
            btnNo.checked = false;
        }
        document.querySelectorAll(".cat-" + ind).forEach((row) => {
            btn.checked ? row.classList.remove("hidden") : row.classList.add("hidden")
            // toutes les rows de la catégorie sont cachées/affichées
        })
    })
})

// Ici on ajoute les eventListener aux checkboxes "Tout cocher" et "Tout décocher"
btnYes.addEventListener("change", (event) => {
    if (btnYes.checked){
        btnNo.checked = false;
        document.querySelectorAll("#boutons input").forEach(btn => {
            btn.checked = true // activation de tous les boutons !
            btn.dispatchEvent(new Event("change", {bubbles: false}))
        })
    }
})

document.getElementById("btn-no").addEventListener("change", (event) => {
    if (btnNo.checked){
        btnYes.checked = false;
        document.querySelectorAll("#boutons input").forEach(btn => {
            btn.checked = false // désactivation de tous les boutons !
            btn.dispatchEvent(new Event("change", {bubbles: false}))
        })
    }
})
btnNo.checked = true // on initialise à rien cocher
btnNo.dispatchEvent(new Event("change"))