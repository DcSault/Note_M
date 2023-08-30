const express = require('express');
const crypto = require('crypto-js');
const Redis = require('ioredis');
const dotenv = require('dotenv');
const app = express();
const port = 443;

// ======== Load Environment Variables ========
dotenv.config({ path: './redis.env' });
const { MASTER_KEY, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

// ======== Configuration Redis ========
const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD
});

client.on('connect', () => {
    console.log('Connecté à Redis');
});
client.on('error', err => {
    console.error('Erreur Redis:', err);
});

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', async (req, res) => {
  const { text } = req.body;
  const encryptedText = crypto.AES.encrypt(text, MASTER_KEY).toString();
  const id = new Date().getTime().toString();
  
  // Sauvegarder dans Redis
  await client.set(id, encryptedText, 'EX', 600); // Expire après 600 secondes
  
  const shareLink = `https://note-m.onrender.com/note/${id}`;
  res.render('share', { link: shareLink });
});

app.get('/note/:id', async (req, res) => {
  const { id } = req.params;
  const encryptedText = await client.get(id);
  
  if (!encryptedText) {
    return res.status(404).render('404'); 
  }
  
  const decryptedText = crypto.AES.decrypt(encryptedText, MASTER_KEY).toString(crypto.enc.Utf8);
  
  res.render('note', { text: decryptedText, id: id });
});

app.post('/markAsRead/:id', async (req, res) => {
  const { id } = req.params;
  const encryptedText = await client.get(id);
  
  if (!encryptedText) {
    return res.status(404).render('404'); 
  }
  
  // Supprimer immédiatement l'entrée de Redis
  await client.del(id);
  
  res.status(200).send('Note marked as read and deleted');
});

// Middleware pour gérer les erreurs 404
app.use((req, res, next) => {
  res.status(404).render('404');
});

app.listen(port, () => {
  console.log(`Server running at https://note-m.onrender.com:${port}/`);
});
