// Inclure CryptoJS si vous utilisez un système de modules
// import CryptoJS from 'crypto-js';

document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const textArea = document.querySelector('textarea[name="text"]');

    form.addEventListener("submit", function(event) {
        // Récupérer le texte de la textarea
        const text = textArea.value;

        // Chiffrer le texte côté client
        const encryptedText = CryptoJS.AES.encrypt(text, "Client-Side Key").toString();

        // Mettre à jour la valeur de la textarea avec le texte chiffré
        textArea.value = encryptedText;

        // Le formulaire sera soumis normalement, pas besoin de preventDefault
    });
});
