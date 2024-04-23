const tNom = document.getElementById("nom")
const tContact = document.getElementById("contact")
const tTitre = document.getElementById("titre")
const tMessage = document.getElementById("message")
const formulaire = document.getElementById("formulaire")

if (typeof Sentry === 'undefined') {
    document.querySelectorAll("#formulaire input, textarea").forEach(area => {
        area.disabled = true;
    })
    document.querySelectorAll("#formulaire label, legend").forEach(label => {
        label.style.color = "gray";
    })
    document.getElementById("erreur").style.display = 'inline';
}

formulaire.addEventListener('submit', (event) => {
    event.preventDefault();
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
        comments: `--- ${tTitre.value} ---\n${tMessage.value}`,
    };
    console.log(userFeedback)
    Sentry.captureUserFeedback(userFeedback);
    alert('Message envoyé !');
})