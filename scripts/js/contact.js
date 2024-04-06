const tNom = document.getElementById("nom")
const tContact = document.getElementById("contact")
const tTitre = document.getElementById("titre")
const tMessage = document.getElementById("message")
const formulaire = document.getElementById("formulaire")

formulaire.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Message envoyé !');
    setTimeout(function(){
        window.location.href = 'index.html'
    }, 1000);
    
    // https://docs.sentry.io/platforms/javascript/user-feedback/
    // https://docs.sentry.io/platforms/javascript/user-feedback/configuration/
    const eventId = Sentry.captureMessage("User Feedback");
    const userFeedback = {
        event_id: eventId,
        name: tNom.value,
        email: tContact.value,
        comments: tMessage.value, // tTitre.value
    };
    Sentry.captureUserFeedback(userFeedback);
})