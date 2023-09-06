const express = require('express');
const crypto = require('crypto-js');
const Redis = require('ioredis');
const dotenv = require('dotenv');
const app = express();
const port = 3000;

// Charger les variables d'environnement depuis le fichier .env
dotenv.config({ path: './process.env' });
const { MASTER_KEY, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

// Configurer la connexion à Redis
const client = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD
});

// Événements de connexion et d'erreur pour Redis
client.on('connect', () => {
  console.log('Connecté à Redis');
});
client.on('error', err => {
  console.error('Erreur Redis:', err);
});

// Middleware pour le parsing du JSON et des formulaires
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configurer le moteur de vue EJS
app.set('view engine', 'ejs');

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.render('index');
});

// Route pour l'upload de texte
app.post('/upload', async (req, res, next) => {
  try {
    const clientEncryptedText = req.body.text;
  
    // Validation de l'entrée
    if (!clientEncryptedText || typeof clientEncryptedText !== 'string' || clientEncryptedText.length > 5000) {
      return res.status(400).json({ error: 'Invalid text input' });
    }
  
    const decryptedTextFromClient = crypto.AES.decrypt(clientEncryptedText, "Client-Side Key").toString(crypto.enc.Utf8);
    const serverEncryptedText = crypto.AES.encrypt(decryptedTextFromClient, MASTER_KEY).toString();
  
    const id = new Date().getTime().toString();
  
    await client.set(id, serverEncryptedText, 'EX', 600); // Expire après 600 secondes
  
    const shareLink = `https://note-m.cyclic.app/note/${id}`;
  
    res.render('share', { link: shareLink });
  } catch (err) {
    next(err);
  }
});

// Route pour télécharger une note
app.get('/note/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
  
    // Validation de l'ID
    if (!id || typeof id !== 'string' || id.length !== 13) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
  
    const encryptedText = await client.get(id);
  
    if (!encryptedText) {
      return res.status(404).render('404');
    }
  
    const decryptedText = crypto.AES.decrypt(encryptedText, MASTER_KEY).toString(crypto.enc.Utf8);
  
    res.render('note', { text: decryptedText, id: id });
  } catch (err) {
    next(err);
  }
});

// Route pour marquer une note comme lue et la supprimer
app.post('/markAsRead/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
  
    // Validation de l'ID
    if (!id || typeof id !== 'string' || id.length !== 13) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
  
    const encryptedText = await client.get(id);
  
    if (!encryptedText) {
      return res.status(404).render('404');
    }
  
    await client.del(id);
  
    res.status(200).send('Note marked as read and deleted');
  } catch (err) {
    next(err);
  }
});

// Middleware pour gérer les erreurs 404
app.use((req, res, next) => {
  res.status(404).render('404');
});

// Middleware pour gérer les erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500');  // Assurez-vous d'avoir une vue 500.ejs
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
