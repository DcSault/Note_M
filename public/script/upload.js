// Inclure CryptoJS si vous utilisez un système de modules
// import CryptoJS from 'crypto-js';

document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Empêche la soumission normale du formulaire

        // Récupérer le texte de la textarea
        const text = document.querySelector('textarea[name="text"]').value;

        // Chiffrer le texte côté client
        const encryptedText = CryptoJS.AES.encrypt(text, "Client-Side Key").toString();

        // Envoyer une requête POST avec le texte chiffré
        fetch('/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: encryptedText }),
        })
        .then(response => response.json())
        .then(data => {
            // Faire quelque chose avec la réponse, comme rediriger vers la page de partage
            window.location.href = data.redirectUrl; // Supposons que le serveur renvoie l'URL de redirection
        });
    });
});
