document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const originalTextArea = document.querySelector('textarea[name="text"]');

    form.addEventListener("submit", function(event) {
        // Récupérer le texte de la textarea
        const text = originalTextArea.value;

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

        // Désactiver la textarea originale pour éviter d'envoyer son contenu
        originalTextArea.disabled = true;

        // Le formulaire sera soumis normalement, pas besoin de preventDefault
    });
});
