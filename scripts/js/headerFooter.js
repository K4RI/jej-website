// https://stackoverflow.com/questions/6005327/how-to-create-header-footer

/**************** 1 : NAVBAR */
const titles = {
    "a-propos" : "à propos de jej",
    "dessins": "dessins",
    "videos" : "vidéos",
    "images" : "images",
    "textes" : "textes",
    "jeux" : "jeux",
    "culture" : "culture",
    "postits" : "post-its",
    "remerciements" : "special thanks"
}

// sur internet ou en local ?
const hostname = (window.location.href.substring(0, 5) == "https") ? "jej888.fr"
               : (window.location.href.substring(0, 5) == "file:") ? "jej-website"
               : ":8000"

let subdirs = window.location.href.split(".html")[0].split(hostname).pop().split('/')
if (subdirs[0] == "") { subdirs.shift() }
console.log(subdirs) // ["dessins"], ou ["dessins", "avelv"] ...

navbar = document.getElementById("navbar");
navbar.innerHTML = ""

if (subdirs.length == 1) { // dossier principal
    Object.keys(titles).forEach(key => {
        if (subdirs[0] == key) {
            navbar.innerHTML += `<span class="active">${titles[key]}</span>`;
        
        } else {
            navbar.innerHTML += `<a href="${key}.html"><span>${titles[key]}</span></a>`;
        }        
    })

} else if (subdirs.length > 1) { // sous-dossier
    let prefix = Array(subdirs.length).join("../") // le répète "subdirs.length - 1" fois
    console.log(prefix)
    Object.keys(titles).forEach(key => {
        if (subdirs[0] == key) {
            navbar.innerHTML += `<a href="${prefix + key}.html" style="background-color: #f9fd83;"><span>${titles[key]}</span></a>`;
        
        } else {
            navbar.innerHTML += `<a href="${prefix + key}.html"><span>${titles[key]}</span></a>`;
        }        
    })
}


/**************** 2 : FOOTER */
footer = document.getElementById("footer");
footer.innerHTML = `
    ___________________________
    <p ><a href="https://www.youtube.com/@jej888" target="_blank">youtube</a> - 
    <a href="./tweets.html">twitter</a> - 
    <a href="https://www.instagram.com/nwaar888/" target="_blank">instagram</a> - 
    mail : jejasfh [at] gmail.com
    </p>
    <p>© smoking borzoi studios 2k24-∞</p>
`
// ajouter des 88x31 comme dans https://manpaint.neocities.org/
