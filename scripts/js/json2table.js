/**
  * Utilisé pour postits.html
  * Remplit un tableau à partir d'un fichier .json, et des checkbox pour afficher selon la catégorie.
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
let cat_count = Array(9).fill(0)
let init_lab_html = Array(9).fill("")
Object.keys(dict).forEach(ind => { 
    init_lab_html[ind] = document.getElementById("lab-" + ind).innerHTML
})


const tableau = document.getElementById("tableau");

// Ici on remplit le tableau.
var data_file = "scripts//js//postits.json";
var current_date = "";
var count_by_date = 0;
$.getJSON(data_file, function(data){
    $.each(data.reverse(), function(i){
        let row = document.createElement("tr") // à chaque entrée on initialise la nouvelle ligne
        Object.keys(data[i]).forEach(key => {
            var cell = document.createElement("td") // à chaque attribut on initialise une cellule
            switch (key){
                case "Date":
                    // pour partager cette ligne précisément : un identifiant
                    let date = data[i]["Date"].replaceAll("/", "-")
                    if (date != current_date) {
                        current_date = date
                        count_by_date = 0
                    }
                    count_by_date++
                    row.id = current_date + "-" + String.fromCharCode(96 + count_by_date)
                    row.style.scrollMarginTop = "60px"
                    
                    var addr = document.createElement("a")
                    addr.style.textDecoration = "none"
                    addr.href = "#" + row.id
                    addr.innerHTML = "✪" // j'hésite avec ⨁◶✪◍⚉⨂
                    cell.appendChild(addr)
                    cell.innerHTML += ` ` + data[i]["Date"];
                    break;
                case "URL":
                    if (data[i]["URL"].includes("\n")){ // s'il y a plusieurs url
                        cell.innerHTML = ""
                        data[i]["URL"].split("\n").forEach(elt => {
                            cell.innerHTML += `
                        - <a href=${elt
                            .replace("twitter.com", "nitter.net")
                            } target="_blank">${elt}</a> <br><br>
                        `}) // on les affiche comme liste avec des tirets
                    } else {
                        cell.innerHTML = `
                        <a href=${data[i]["URL"]
                                .replace("twitter.com", "nitter.net")
                            } target="_blank">${data[i]["URL"]}</a>
                        `
                    }
                    break;
                case "Description":
                    // quand il y a des "cf. 01/23/45", introduire un lien vers sa ligne
                    const matches = data[i]["Description"].matchAll(/cf. \d\d\/\d\d\/\d\d/g);
                    for (const match of matches) {
                        const match_d = match[0].substring(4)
                        data[i]["Description"] = data[i]["Description"].replace(match[0], `<a href="#${match_d.replaceAll("/", "-")}-a" style="text-decoration: none; color: gray; font-style:italic">cf. ${match_d}</a>`)
                    }

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
                        if (data[i]["URL"] == "http://www.rubberducky.org/blog/"){ // cas spécial
                            cell.innerHTML += " "
                            var addr = document.createElement("a")
                            addr.style.fontWeight = "bold"
                            addr.href = "postits/chomskybot.html"
                            addr.innerHTML = "j'en parle ici !!!"
                            cell.appendChild(addr)
                        }
                    }    
                    break;
                case "Categorie":
                    row.classList.add("cat-" + data[i]["Categorie"])
                    cell.innerHTML = dict[data[i]["Categorie"]];

                    let ind = data[i]["Categorie"]
                    cat_count[ind]++
                    let lab = document.getElementById("lab-" + ind)
                    lab.innerHTML = init_lab_html[ind] + ` <span style="font-size:small; font-weight:bold">[${cat_count[ind]}]</span>`
                    break;               
            }
            row.appendChild(cell); // la cellule va dans la ligne
        })
        // row.classList.add("hidden")
        tableau.appendChild(row) // la ligne va dans le tableau
    })
})

const btnYes = document.getElementById("btn-yes")
const btnNo = document.getElementById("btn-no")

/** association des groupes de colonnes aux checkboxes */
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

/** checkboxes "Tout cocher" et "Tout décocher" */
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

btnYes.checked = true // on initialise à tout cocher
btnYes.dispatchEvent(new Event("change"))