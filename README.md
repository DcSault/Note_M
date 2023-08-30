# 🚀 Note_M

Bienvenue dans l'application "note_m" ! Cette application permet de créer des notes textuelles sécurisées et de les partager via un lien unique.

## 📖 Sommaire

- [Caractéristiques](#-caractéristiques)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Fonctionnement](#-fonctionnement)
- [Contribution](#-contribution)
- [Crédits](#-crédits)

## 🌟 Caractéristiques

- Création de notes textuelles sécurisées 📝
- Cryptage AES des notes 🛡
- Génération d'un lien unique pour chaque note 🌐
- Suppression automatique des notes après lecture 🗑
- Interface utilisateur simple et intuitive 🖥
- Utilisation de Redis pour le stockage temporaire 📦

## 🔧 Installation

1. Clonez ce dépôt:
```
git clone https://github.com/DcSault/Note_M
```
2. Installez les dépendances:
```
npm install
```
3. Configurez vos variables d'environnement en créant un fichier `.env` avec les clés nécessaires (par exemple, `MASTER_KEY` pour le cryptage et les Identifiant Redis).

4. Démarrez l'application:
```
node app.js
```
## 🚀 Utilisation

- Accédez à la page d'accueil pour créer une nouvelle note.
- Écrivez votre texte et cliquez sur "Upload".
- Copiez le lien généré et partagez-le.
- Le destinataire peut ouvrir le lien pour lire la note, qui sera ensuite automatiquement supprimée.

## 🔧 Fonctionnement
![Cover](https://github.com/DcSault/Note_M/blob/8d39f2c3d3317c93adeb1598df17c13aa8b241a0/info.png)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## 📜 Crédits

Conçu et développé par ROSIQUE Victor .
Merci à tous ceux qui ont contribué au projet !


