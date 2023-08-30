const express = require('express');
const fs = require('fs');
const crypto = require('crypto-js');
const app = express();
const port = 443;

// Réinitialiser le fichier json.db à chaque redémarrage du serveur
fs.writeFileSync('json.db', JSON.stringify({}));
app.use(express.json());
app.use(express.static('public'));


app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


const dbFile = 'json.db';
let db = {};

if (fs.existsSync(dbFile)) {
  const rawData = fs.readFileSync(dbFile);
  db = JSON.parse(rawData);
}

const saveDb = () => {
  const data = JSON.stringify(db);
  fs.writeFileSync(dbFile, data);
};

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', (req, res) => {
    const { text } = req.body;
    const encryptedText = crypto.AES.encrypt(text, 'secret-key').toString();
    const id = new Date().getTime().toString();
    
    db[id] = encryptedText;
    saveDb();
    
    const shareLink = `https://note-m.onrender.com/download/${id}`;
    
    res.render('share', { link: shareLink });
  });

app.get('/download/:id', (req, res) => {
   const { id } = req.params;
   const db = JSON.parse(fs.readFileSync('json.db'));
   const encryptedText = db[id];
    
   if (!encryptedText) {
     return res.status(404).send('Text not found');
   }
    
   const decryptedText = crypto.AES.decrypt(encryptedText, 'secret-key').toString(crypto.enc.Utf8);
    
   // Supprimer immédiatement l'entrée de la base de données
  delete db[id];
   fs.writeFileSync('json.db', JSON.stringify(db));
    
  res.render('download', { text: decryptedText }); 
  });

app.listen(port, () => {
  console.log(`Server running at https://note-m.onrender.com:${port}/`);
});
