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
app.post('/upload', async (req, res) => {
  const { text, accessCode } = req.body;
  const encryptedText = crypto.AES.encrypt(text, MASTER_KEY).toString();
  const id = new Date().getTime().toString();
  
  const dataToStore = { 'text': encryptedText };

  if (accessCode) {
    const encryptedAccessCode = crypto.AES.encrypt(accessCode, MASTER_KEY).toString();
    dataToStore['accessCode'] = encryptedAccessCode;
  }

  // Sauvegarder dans Redis
  await client.hset(id, dataToStore);
  
  // Définir l'expiration
  await client.expire(id, 600);

  const shareLink = `https://note-m.cyclic.app/note/${id}`;
  res.render('share', { link: shareLink });
});

// Route pour télécharger une note
app.get('/note/:id', async (req, res) => {
  const { id } = req.params;
  const encryptedData = await client.hgetall(id);
  
  if (!encryptedData || !encryptedData.text) {
    return res.status(404).render('404'); 
  }

  let promptScript = "";

  if (encryptedData.accessCode) {
    const decryptedAccessCode = crypto.AES.decrypt(encryptedData.accessCode, MASTER_KEY).toString(crypto.enc.Utf8);
    promptScript = `
      <script>
        const userAccessCode = prompt("Entrez le code d'accès pour cette note:");
        if (userAccessCode !== "${decryptedAccessCode}") {
          alert("Code d'accès incorrect");
          window.location.href = "/"; // Redirige vers la page d'accueil
        }
      </script>
    `;
  }

  const decryptedText = crypto.AES.decrypt(encryptedData.text, MASTER_KEY).toString(crypto.enc.Utf8);
  
  res.render('note', { text: decryptedText, id: id, promptScript: promptScript });
});


// Route pour marquer une note comme lue et la supprimer
app.post('/markAsRead/:id', async (req, res) => {
  const { id } = req.params;
  const encryptedText = await client.get(id);
  
  if (!encryptedText) {
    return res.status(404).render('404'); // Page d'erreur 404
  }
  
  // Supprimer la note de Redis
  await client.del(id);
  
  res.status(200).send('Note marked as read and deleted');
});

// Middleware pour gérer les erreurs 404
app.use((req, res, next) => {
  res.status(404).render('404');
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running at https://note-m.cyclic.app:${port}/`);
});
