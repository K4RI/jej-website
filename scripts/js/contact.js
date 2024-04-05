const tNom = document.getElementById("nom")
const tContact = document.getElementById("contact")
const tTitre = document.getElementById("titre")
const tMessage = document.getElementById("message")
const formulaire = document.getElementById("formulaire")

formulaire.addEventListener('submit', (event) => {
    event.preventDefault();
    setTimeout(function(){
        window.location.href = 'index.html'
    }, 2000);
    Email.send({
        SecureToken : "25f715e6-9738-44fc-99c8-1c91cf229766", // oui je sais mettre des credentials en clair c'est pas bien
        To : "kariassoumani@hotmail.fr", // mais l'accès donné est à une adresse e-mail jetable donc je m'en fous lol
        From : "juj222@proton.me", // <-- à cette adresse celle-là
        Subject : `[JEJ888] ${tTitre.value}`,
        Body : `${tMessage.value.replaceAll('\n', '<br>')} <br><br>
        -- ${tNom.value}, ${tContact.value}` // en attendant d'avoir du back-end sur le serveur mdr allez la bise
    }).then(
      message => alert('Message envoyé !')
    );
})