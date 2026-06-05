/**
  * Utilisé pour culture.html
  * Remplit un tableau à partir d'un fichier .json.
  * Adapté de json2table.js
*/

// TODO: distinguer les lignes ? tableaux de même largeur ?

var tableau;
// Ici on remplit le tableau.
var data_file = "scripts//js//culture.json";
$.getJSON(data_file, function(data){
    $.each(data, function(i){ // pour chaque tableau
        let section = data[i]["section"];
        tableau = document.getElementById(section);
        $.each(data[i]["entries"], function(j){
            let row = document.createElement("tr"); // à chaque entrée on initialise la nouvelle ligne
            Object.keys(data[i]["entries"][j]).forEach(key => {
                if (key != "visited") {
                    var cell = document.createElement("td"); // à chaque attribut on initialise une cellule
                    cell.style.fontSize='small'
                    switch (key){
                        case "url":
                            let url = data[i]["entries"][j]["url"];
                            cell.innerHTML = `<a href=${url} target="_blank">${url}</a>`;
                            break;
                        default:
                            cell.innerHTML = data[i]["entries"][j][key];
                    }
                    row.appendChild(cell); // la cellule va dans la ligne
                } else {
                    ; // todo: le noter en vert ?
                }
            });
        tableau.appendChild(row); // la ligne va dans le tableau
        })
    })
})
