/*
  Utilisé pour images/pdp.html
  Implémente un slider pour les images.
*/

const slides = document.querySelectorAll(".slide");
let currentSlide = 0;

function showSlide(index) {
  // on se translate jusqu'à la i-ème slide
  slides.forEach((slide, i) => {
    const slideWidth = slide.clientWidth;
    slide.style.transform = `translateX(-${index * slideWidth}px)`;
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

showSlide(currentSlide);
