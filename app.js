const express = require('express');
const crypto = require('crypto-js');
const Redis = require('ioredis');
const dotenv = require('dotenv');
const app = express();
const port = 3000;

// Charger les variables d'environnement
dotenv.config({ path: './process.env' });
const { MASTER_KEY, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

// Configurer la connexion à Redis
const client = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD
});

client.on('connect', async () => {
  console.log('Connecté à Redis');
  if (!(await client.exists('noteCount'))) {
    await client.set('noteCount', 0);
  }
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
  
  await client.set(id, encryptedText, 'EX', 600);
  await client.incr('noteCount');

  console.log(`Note ${id} a été créée.`);

  const dashboardData = {
    created_at: new Date(),
    note_id: id,
    action: "créée"
  };
  await client.lpush('dashboardData', JSON.stringify(dashboardData));

  const shareLink = `https://note-m.cyclic.app/note/${id}`;
  res.render('share', { link: shareLink });
});

app.get('/note/:id', async (req, res) => {
  const { id } = req.params;
  const encryptedText = await client.get(id);
  
  if (!encryptedText) {
    return res.status(404).render('404');
  }
  
  console.log(`Note ${id} a été consultée.`);
  const dashboardData = {
    accessed_at: new Date(),
    note_id: id,
    action: "consultée"
  };
  await client.lpush('dashboardData', JSON.stringify(dashboardData));

  const decryptedText = crypto.AES.decrypt(encryptedText, MASTER_KEY).toString(crypto.enc.Utf8);
  res.render('note', { text: decryptedText, id: id });
});

app.post('/markAsRead/:id', async (req, res) => {
  const { id } = req.params;
  const encryptedText = await client.get(id);
  
  if (!encryptedText) {
    return res.status(404).render('404');
  }
  
  await client.del(id);
  await client.decr('noteCount');

  console.log(`Note ${id} a été marquée comme lue et supprimée.`);
  
  const dashboardData = {
    deleted_at: new Date(),
    note_id: id,
    action: "supprimée"
  };
  await client.lpush('dashboardData', JSON.stringify(dashboardData));

  res.status(200).send('Note marquée comme lue et supprimée');
});

app.get('/dashboard', async (req, res) => {
  const rawData = await client.lrange('dashboardData', 0, -1);
  const dashboardData = rawData.map(data => JSON.parse(data));
  res.json(dashboardData);
});

app.use((req, res, next) => {
  res.status(404).render('404');
});

app.listen(port, () => {
  console.log(`Le serveur fonctionne sur https://note-m.cyclic.app:${port}/`);
});
