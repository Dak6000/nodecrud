import express from 'express';
import { getDB, initDB } from './db.js';
import bodyParser from 'body-parser';
import userRouter from './routes/users.js';
import productRouter from './routes/products.js';
import { uploadProductImage } from './utils/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Initialisation de l'application Express
const app = express();

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware pour servir les fichiers statiques
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes pour les pages HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/products.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/add-product.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add-product.html'));
});

app.get('/edit-product.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'edit-product.html'));
});

app.get('/users.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'users.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Initialisation de la base de données
initDB();

const PORT = 3000;

// Route GET pour vérifier que le serveur fonctionne
app.get("/", (req, res) => {
    res.send("Mon serveur Express est en cours d'exécution !");
});

// Utilisation des routeurs
app.use('/users', userRouter);
app.use('/products', productRouter);

// Démarrage du serveur sur le port spécifié
app.listen(PORT, () => {
    console.log(`Le serveur est lancé sur URL http://localhost:${PORT}`);
});