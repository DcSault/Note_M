// Inclure CryptoJS si vous utilisez un système de modules
// import CryptoJS from 'crypto-js';

document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");

    form.addEventListener("submit", function(event) {
        // Récupérer le texte de la textarea
        const text = document.querySelector('textarea[name="text"]').value;

        // Chiffrer le texte côté client
        const encryptedText = CryptoJS.AES.encrypt(text, "Client-Side Key").toString();

        // Créer une nouvelle textarea et la cacher
        const hiddenTextArea = document.createElement("textarea");
        hiddenTextArea.style.display = "none";
        hiddenTextArea.name = "text";

        // Mettre le texte chiffré dans la nouvelle textarea
        hiddenTextArea.value = encryptedText;

        // Ajouter la nouvelle textarea au formulaire
        form.appendChild(hiddenTextArea);
    });
});

