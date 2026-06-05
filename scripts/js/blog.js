
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
        hhhh.innerHTML += `<h2>${pavés[0]}</h2>`;

        pavés.slice(1).forEach((pavé) => {
            let paragraphes = pavé.split("\n");
            hhhh.innerHTML += `<h3>${paragraphes[0]}</h3>`;
    
            paragraphes.slice(1).forEach((paragraphe) => {
                if (paragraphe != "") {
                    hhhh.innerHTML += `<p>${paragraphe}</p>`;
                }
            })
            hhhh.innerHTML += `<br>`;
        })
    })


} catch (e) {
    console.error(e);
}
