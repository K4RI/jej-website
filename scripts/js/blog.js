
const file = "blog-notes.txt";
const hhhh = document.getElementById("éditos");
try {
    const response = await fetch(file);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    const text = await response.text();
    text.split("\n\n------------").forEach((entrée) => {
        let pavés = entrée.split("\n\n");
        if (pavés[0] != "") {
            hhhh.innerHTML += `<h2>${pavés[0]}</h2>`;
        }        

        pavés.slice(1).forEach((pavé) => {
            let paragraphes = pavé.split("\n");

            // le nom du paragraphe
            let p = paragraphes[0];

            // la balise du paragraphe (id, href)
            let pp = p.normalize("NFD").toLowerCase().replace(/[\'| ]/g,'-').replace(/[^a-z0-9-]/g,'')
            
            var article = document.createElement("article");
            article.id = pp
            article.innerHTML += `<h3><a href="#${pp}">${p}</a></h3>`;
    
            paragraphes.slice(1).forEach((paragraphe) => {
                if (paragraphe != "") {
                    article.innerHTML += `<p>${paragraphe}</p>`;
                }
            })
            article.innerHTML += `<br>`;
            hhhh.appendChild(article);
        })
    })


} catch (e) {
    console.error(e);
}
