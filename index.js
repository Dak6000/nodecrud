import express from 'express';
import { getDB, initDB } from './db.js';
import bodyParser from 'body-parser';
import userRouter from './routes/users.js';
import productRouter from './routes/products.js';

// Initialisation de l'application Express
const app = express();

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json({ type: 'application/json' }));

// Middleware pour servir les fichiers statiques
app.use(express.static('./'));
app.use('/uploads', express.static('uploads'));

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