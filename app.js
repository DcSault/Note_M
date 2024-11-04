const express = require('express');
const crypto = require('crypto-js');
const Redis = require('ioredis');
const dotenv = require('dotenv');
const app = express();
const port = 3000;

// Load environment variables from the .env file
dotenv.config({ path: './.env' });
const { MASTER_KEY, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, BASE_URL } = process.env;

// Vérification des variables d'environnement chargées
console.log("REDIS_HOST:", REDIS_HOST);
console.log("REDIS_PORT:", REDIS_PORT);
console.log("BASE_URL:", BASE_URL);

// Configure Redis connection
const client = new Redis({
  host: REDIS_HOST || '10.20.30.140',
  port: Number(REDIS_PORT) || 2404,
  password: REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  }
});

client.on('connect', () => {
  console.log('Connected to Redis');
});
client.on('error', err => {
  console.error('Redis Error:', err);
});

async function logEvent(eventType) {
  const event = {
    type: eventType,
    timestamp: new Date().toISOString()
  };
  await client.lpush('noteEvents', JSON.stringify(event));
}

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

// Route for text upload
app.post('/upload', async (req, res, next) => {
  try {
    const clientEncryptedText = req.body.text;
    if (!clientEncryptedText || typeof clientEncryptedText !== 'string' || clientEncryptedText.length > 5000) {
      return res.status(400).json({ error: 'Invalid text input' });
    }
    const decryptedTextFromClient = crypto.AES.decrypt(clientEncryptedText, "Client-Side Key").toString(crypto.enc.Utf8);
    const serverEncryptedText = crypto.AES.encrypt(decryptedTextFromClient, MASTER_KEY).toString();
    const id = new Date().getTime().toString();

    // Configure expiration to 1 day (86400 seconds)
    await client.set(id, serverEncryptedText, 'EX', 86400);

    const shareLink = `${BASE_URL}/note/${id}`;
    res.render('share', { link: shareLink });
    
    // Log the creation event
    await logEvent('created');
  } catch (err) {
    next(err);
  }
});

app.get('/note/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.length !== 13) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const encryptedText = await client.get(id);
    if (!encryptedText) {
      return res.status(404).render('404');
    }
    const decryptedText = crypto.AES.decrypt(encryptedText, MASTER_KEY).toString(crypto.enc.Utf8);
    res.render('note', { text: decryptedText, id: id });
    
    await logEvent('read');
  } catch (err) {
    next(err);
  }
});

app.post('/markAsRead/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.length !== 13) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const encryptedText = await client.get(id);
    if (!encryptedText) {
      return res.status(404).render('404');
    }
    await client.del(id);
    res.status(200).send('Note marked as read and deleted');
    
    await logEvent('deleted');
  } catch (err) {
    next(err);
  }
});

app.use((req, res, next) => {
  res.status(404).render('404');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
