// radicalement volé ici https://deuxfleurs.fr/script-bon.js
// mais j'ai rajouté avec une feature aller-retour !!!


// dictionary to keep track of frame count for each animation
let frameCounts = {};
let forward = true; // en avant ou arrière ?

function animate(id, delay) {

  // get the container and frames for the amination
  const container = document.getElementById(id);
  const frames = container.children;

  // set up the frame counter
  frameCounts[id] = 0;

  // hide all frames except for the first
  frames[0].style.display = "flex";
  for (let i = 1; i < frames.length; i++) {
    frames[i].style.display = "none";
  }

  // start the animation
  const interval = setInterval(updateAnimation, delay, id, frames, frames.length);
}

function updateAnimation(id, frames, totalFrames) {

    if (forward) { // en avant
        // increment the frame counter for the given id
        frameCounts[id] += 1;
        // hide the previous frame
        frames[frameCounts[id] - 1].style.display = "none";
        if (frameCounts[id] == totalFrames - 1) {
            forward = false;
        }
    } else { // en arrière
        frameCounts[id] -= 1;
        frames[frameCounts[id] + 1].style.display = "none";
        if (frameCounts[id] == 0) {
            forward = true;
        }
    }    
    // show the next frame
    frames[frameCounts[id]].style.display = "flex";


}

// If the user have a setting on their device to minimize the amount of non-essential motion
const preferReduceMotion = window.matchMedia("(prefers-reduced-motion)").matches;

animate("kiwi", preferReduceMotion ? 500 : 120); // Reduce framerate if use preference is to reduce motion
