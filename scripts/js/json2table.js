
// TODO : checkboxes aux textes de couleur

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

let tableau = document.getElementById("tableau");

var data_file = "scripts//js//postits.json";
$.getJSON(data_file, function(data){
    $.each(data.reverse(), function(i){
        let row = document.createElement("tr")
        Object.keys(data[i]).forEach(key => {
            var cell = document.createElement("td")
            switch (key){
                case "Date":
                    cell.innerHTML = data[i]["Date"];
                    break;
                case "URL":
                    if (data[i]["URL"].includes("\n")){
                        cell.innerHTML = ""
                        data[i]["URL"].split("\n").forEach(elt => {
                            cell.innerHTML += `
                        - <a href=${elt}>${elt}</a> <br><br>
                        `})
                    } else {
                        cell.innerHTML = `
                        <a href=${data[i]["URL"]}>${data[i]["URL"]}</a>
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
                        // cell.innerHTML = "- " + data[i]["Description"].replaceAll("\n", "<br><br>- ");
                    } else {
                        cell.innerHTML = data[i]["Description"]
                    }                   
                    break;
                case "Categorie":
                    row.classList.add("cat-" + data[i]["Categorie"])
                    cell.innerHTML = dict[data[i]["Categorie"]];
                    break;               
            }
            row.appendChild(cell);
        })
        row.classList.add("hidden")
        tableau.appendChild(row)
    })
})

const btnYes = document.getElementById("btn-yes")
const btnNo = document.getElementById("btn-no")

Object.keys(dict).forEach(ind => {
    let btn = document.getElementById("btn-" + ind)
    btn.checked = false
    btn.addEventListener("change", (event) => {
        if (event.bubbles){ // s'il n'est pas envoyé depuis btnYes ou btnNo            
            btnYes.checked = false;
            btnNo.checked = false;
        }
        // var aff = btn.checked ? '' : 'none'
        document.querySelectorAll(".cat-" + ind).forEach((row) => {
            // console.log("bouton " + ind + " cliqué : " + btn.checked)
            btn.checked ? row.classList.remove("hidden") : row.classList.add("hidden")
        })
    })
})

btnYes.addEventListener("change", (event) => {
    // console.log("bouton yes cliqué")
    if (btnYes.checked){
        btnNo.checked = false;
        document.querySelectorAll("#boutons input").forEach(btn => {
            btn.checked = true
            btn.dispatchEvent(new Event("change", {bubbles: false}))
        })
    }
})

document.getElementById("btn-no").addEventListener("change", (event) => {
    // console.log("bouton no cliqué")
    if (btnNo.checked){
        btnYes.checked = false;
        document.querySelectorAll("#boutons input").forEach(btn => {
            btn.checked = false
            btn.dispatchEvent(new Event("change", {bubbles: false}))
        })
    }
})
btnNo.checked = true
btnNo.dispatchEvent(new Event("change"))