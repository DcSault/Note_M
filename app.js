const express = require('express');
const crypto = require('crypto-js');
const Redis = require('ioredis');
const dotenv = require('dotenv');
const app = express();
const port = 3000;

// Load environment variables from the .env file
dotenv.config({ path: './process.env' });
const { MASTER_KEY, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

// Configure Redis connection
const client = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD
});

// Redis connection and error events
client.on('connect', () => {
  console.log('Connected to Redis');
});
client.on('error', err => {
  console.error('Redis Error:', err);
});

// Function to log events in Redis
async function logEvent(eventType) {
  const event = {
    type: eventType,
    timestamp: new Date().toISOString()
  };
  await client.lpush('noteEvents', JSON.stringify(event));
}

// Middleware for JSON parsing and form data
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configure the EJS view engine
app.set('view engine', 'ejs');

// Route for the homepage
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
    await client.set(id, serverEncryptedText, 'EX', 600);
    const shareLink = `https://note-m.cyclic.app/note/${id}`;
    res.render('share', { link: shareLink });
    
    // Log the creation event
    await logEvent('created');
  } catch (err) {
    next(err);
  }
});

// Route to download a note
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
    
    // Log the read event
    await logEvent('read');
  } catch (err) {
    next(err);
  }
});

// Route to mark a note as read and delete it
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
    
    // Log the deletion event
    await logEvent('deleted');
  } catch (err) {
    next(err);
  }
});

// Middleware to handle 404 errors
app.use((req, res, next) => {
  res.status(404).render('404');
});

// Middleware to handle global errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
