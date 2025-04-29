import express from 'express';
import { getDB } from '../db.js';
import bcrypt from 'bcrypt';
import { uploadProfileImage } from '../utils/upload.js';

const router = express.Router();

// Route POST pour insérer un utilisateur dans la base de données
router.post("/", async(req, res) => {
    // Récupération des données envoyées dans le corps de la requête
    const {
        first_name,
        last_name,
        email,
        password,
        phone,
        address,
        city,
        country
    } = req.body;

    // Vérification des champs requis
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
            error: "Les champs prénom, nom, email et mot de passe sont requis."
        });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: "Format d'email invalide."
        });
    }

    try {
        // Récupération de l'instance de la base de données
        const db = getDB();

        // Vérification si l'email existe déjà
        const existingUser = await db.get("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUser) {
            return res.status(409).json({
                error: "Un utilisateur avec cet email existe déjà."
            });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertion des données dans la table `users`
        const result = await db.run(
            `INSERT INTO users (
                first_name, 
                last_name, 
                email, 
                password, 
                phone, 
                address, 
                city, 
                country
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                first_name,
                last_name,
                email,
                hashedPassword,
                phone || null,
                address || null,
                city || null,
                country || null
            ]
        );

        // Création d'un panier pour le nouvel utilisateur
        await db.run(
            "INSERT INTO paniers (utilisateur_id) VALUES (?)", [result.lastID]
        );

        // Réponse avec l'ID de l'utilisateur inséré
        res.status(201).json({
            id: result.lastID,
            message: "Utilisateur créé avec succès."
        });
    } catch (err) {
        // Gestion des erreurs lors de l'insertion
        console.error("Erreur lors de l'insertion :", err.message);
        res.status(500).json({
            error: "Erreur lors de la création de l'utilisateur."
        });
    }
});

// Route GET pour récupérer tous les utilisateurs
router.get("/", async(req, res) => {
    try {
        const db = getDB();
        const users = await db.all("SELECT * FROM users");
        res.status(200).json(users);
    } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs :", err.message);
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
    }
});

// Route GET pour récupérer un utilisateur spécifique
router.get("/:id", async(req, res) => {
    const { id } = req.params;

    try {
        const db = getDB();
        const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        // Suppression du mot de passe de la réponse
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur :", err.message);
        res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur." });
    }
});

// Route PUT pour modifier un utilisateur
router.put("/:id", async(req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, phone, address, city, country } = req.body;

    if (!first_name || !last_name || !email) {
        return res.status(400).json({ error: "Les champs prénom, nom et email sont requis." });
    }

    try {
        const db = getDB();
        const result = await db.run(
            `UPDATE users SET 
                first_name = ?, 
                last_name = ?, 
                email = ?, 
                phone = ?, 
                address = ?, 
                city = ?, 
                country = ? 
            WHERE id = ?`, [first_name, last_name, email, phone, address, city, country, id]
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
router.delete("/:id", async(req, res) => {
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
router.post('/login', async(req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "L'email et le mot de passe sont requis." });
    }

    try {
        const db = getDB();

        // Récupération de l'utilisateur par email
        const user = await db.get(
            "SELECT * FROM users WHERE email = ?", [email]
        );

        if (!user) {
            return res.status(401).json({
                error: "Email ou mot de passe incorrect."
            });
        }

        // Vérification du mot de passe avec bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                error: "Email ou mot de passe incorrect."
            });
        }

        // Suppression du mot de passe de la réponse
        const { password: _, ...userWithoutPassword } = user;

        // Connexion réussie
        res.status(200).json({
            message: "Connexion réussie",
            user: userWithoutPassword
        });
    } catch (err) {
        console.error("Erreur lors de la connexion :", err.message);
        res.status(500).json({
            error: "Erreur lors de la connexion."
        });
    }
});

// Route pour mettre à jour l'image de profil
router.put("/:id/profile-image", uploadProfileImage.single('profile_image'), async(req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ error: "Aucune image n'a été téléchargée." });
    }

    try {
        const db = getDB();
        const imagePath = `/uploads/users/${req.file.filename}`;

        const result = await db.run(
            "UPDATE users SET profile_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [imagePath, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        res.status(200).json({
            message: "Image de profil mise à jour avec succès.",
            imagePath: imagePath
        });
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'image de profil :", err.message);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'image de profil." });
    }
});

export default router;