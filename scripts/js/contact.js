const tNom = document.getElementById("nom")
const tContact = document.getElementById("contact")
const tTitre = document.getElementById("titre")
const tMessage = document.getElementById("message")
const formulaire = document.getElementById("formulaire")


formulaire.addEventListener('submit', (event) => {
    event.preventDefault();
    setTimeout(function(){
        location.reload();
    }, 2000);
    Email.send({
        SecureToken : "25f715e6-9738-44fc-99c8-1c91cf229766",
        To : "kariassoumani@hotmail.fr",
        From : "juj222@proton.me",
        Subject : `[JEJ888] ${tTitre.value}`,
        Body : `${tMessage.value.replaceAll('\n', '<br>')} <br><br>
        -- ${tNom.value}, ${tContact.value}`
    }).then(
      message => console.log("Message envoyé !")
    );
})