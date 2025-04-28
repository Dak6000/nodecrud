import express from 'express';
import { getDB, initDB } from './db.js';
import bodyParser from 'body-parser';

// Initialisation de l'application Express
const app = express();

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json({ type: 'application/json' }));

// Middleware pour servir les fichiers statiques (comme index.html dans le dossier public)
app.use(express.static('./'));

// Initialisation de la base de données
initDB();

const PORT = 3000;

// Route GET pour vérifier que le serveur fonctionne
app.get("/", (req, res) => {
  res.send("Mon serveur Express est en cours d'exécution !");
});

// Route POST pour insérer un utilisateur dans la base de données
app.post("/users", async (req, res) => {
  // Récupération des données envoyées dans le corps de la requête
  const { name, email, password } = req.body;

  // Vérification que tous les champs requis sont présents
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    // Récupération de l'instance de la base de données
    const db = getDB();

    // Insertion des données dans la table `users`
    const result = await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    // Réponse avec l'ID de l'utilisateur inséré
    res.status(201).json({ id: result.lastID });
  } catch (err) {
    // Gestion des erreurs lors de l'insertion
    console.error("Erreur lors de l'insertion :", err.message);
    res.status(500).json({ error: "Erreur lors de l'insertion." });
  }
});

// Route GET pour récupérer tous les utilisateurs
app.get("/users", async (req, res) => {
  try {
    // Récupération de l'instance de la base de données
    const db = getDB();

    // Récupération de toutes les données de la table `users`
    const users = await db.all("SELECT * FROM users");

    // Envoi des données au client
    res.status(200).json(users);
  } catch (err) {
    // Gestion des erreurs lors de la récupération
    console.error("Erreur lors de la récupération des utilisateurs :", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
  }
});

// Route PUT pour modifier un utilisateur
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    const db = getDB();
    const result = await db.run(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    res.status(200).json({ message: "Utilisateur modifié avec succès." });
  } catch (err) {
    console.error("Erreur lors de la modification :", err.message);
    res.status(500).json({ error: "Erreur lors de la modification." });
  }
});

// Route DELETE pour supprimer un utilisateur
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const db = getDB();
    const result = await db.run("DELETE FROM users WHERE id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    res.status(200).json({ message: "Utilisateur supprimé avec succès." });
  } catch (err) {
    console.error("Erreur lors de la suppression :", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

// Route POST pour la connexion des utilisateurs inscrits
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    const db = getDB();

    // Vérification des informations d'identification dans la base de données
    const user = await db.get(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (user) {
      // Connexion réussie
      res.status(200).json({ message: 'Connexion réussie' });
    } else {
      // Connexion échouée
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
  } catch (err) {
    console.error("Erreur lors de la connexion :", err.message);
    res.status(500).json({ error: "Erreur lors de la connexion." });
  }
});

// Démarrage du serveur sur le port spécifié
app.listen(PORT, () => {
  console.log(`Le serveur est lancé sur URL http://localhost:${PORT}`);
});