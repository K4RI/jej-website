
// attention aux appels de fonctions asynchrones
// https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing/51894627#51894627

// partie 1 : extraire les infos des fichiers .mp3 locaux
async function listFiles() {
    let inite = []

    /* https://stackoverflow.com/questions/67777461/get-audio-metadata-e-g-artist-album-html/79740498#79740498
        https://www.jsdelivr.com/package/npm/music-metadata#id-parseblob-function
        https://stackoverflow.com/questions/11876175/how-to-get-a-file-or-blob-from-an-object-url/52410044#52410044
        https://www.npmjs.com/package/music-metadata#parseblob-function */

    // import { parseBlob } from 'music-metadata';
    
    // We load music-metadata from a CDN in this snippet
    const {parseBlob} = await import('https://cdn.jsdelivr.net/npm/music-metadata@11.12.1/+esm');
    
    const response = await fetch("labo/webamp/filelist.txt");
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const text = await response.text();
    const fileList = text.split('\r\n').filter(elt => elt.length > 0)
    let n = fileList.length;
    let k = 0;
    const chargement = document.getElementById("webamp-loading");
    chargement.innerHTML = `CHARGEMENT MUSIQUES : ${k}/ ${n}`;
    await fileList.reduce(async (a, f) => {
        // https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971#process-each-player-in-serial-using-arrayprototypereduce

        await a;
        
        let url = "labo/webamp/" + f + ".mp3"
        const blob = await fetch(url).then(r => r.blob());
        if (blob) {
            // Create a Blob URL for the audio element
            try {
                // Parse File (which is a Blob) using music-metadata
                const { common, format } = await parseBlob(blob);
                // Display metadata
                const metadata = {
                    title: common.title || "Unknown Title",
                    artist: common.artist || "Unknown Artist",
                    year: common.year || "Unknown Year",
                };
                console.log(JSON.stringify(metadata, null, 2));
                
                inite.push(
                    {
                        metaData: {
                            artist: common.artist,
                            title: common.title,
                        },
                        url: url,
                    }
                )
        
                k+=1;
                chargement.innerHTML = `CHARGEMENT MUSIQUES : ${k}/ ${n}`;

            } catch (err) {
                console.log('Error parsing metadata: ' + err.message);
            }
        } else {
            console.log('No file selected');
        }
    });
    return inite;
}


// partie 2: webamp

/* source dans la section HTML */
    
/**
 * Starting in version 2.2.0, Webamp includes a `webamp/butterchurn`
 * entrypoint which includes the Butterchurn library to enable the
 * Milkdrop visualizer.
 */
import Webamp from "https://unpkg.com/webamp@^2/butterchurn";

async function createWebamp() {
    // attend la construction de la liste de fichiers et la récupère
    const inite = await listFiles();

    inite.unshift(
        {
            metaData: {
            artist: "DJ Mike Llama",
            title: "Llama Whippin' Intro",
            },
            url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
            duration: 5.322286,
        }
    )
    const chargement = document.getElementById("webamp-loading");
    chargement.innerHTML = "CHARGEMENT WEBAMP"

    const webamp = new Webamp({
        initialTracks: inite
    });
    webamp.renderWhenReady(document.getElementById("app"));
    chargement.innerHTML = "WEBAMP CHARGÉ (CHARGÉ)"
}
createWebamp()
