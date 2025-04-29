import express from 'express';
import { getDB } from '../db.js';
import { uploadProductImage, uploadProductVideo } from '../utils/upload.js';

const router = express.Router();

// Route POST pour créer un nouveau produit
router.post("/", async(req, res) => {
    const {
        name,
        description,
        price,
        original_price,
        category,
        badge,
        stock,
        image_path,
        video_path
    } = req.body;

    // Vérification des champs requis
    if (!name || !description || !price || !category || !stock) {
        return res.status(400).json({
            error: "Les champs nom, description, prix, catégorie et stock sont requis."
        });
    }

    try {
        const db = getDB();
        const result = await db.run(
            `INSERT INTO products (
                name, 
                description, 
                price, 
                original_price, 
                category, 
                badge, 
                stock, 
                image_path, 
                video_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                name,
                description,
                price,
                original_price || null,
                category,
                badge || null,
                stock,
                image_path || null,
                video_path || null
            ]
        );

        res.status(201).json({
            id: result.lastID,
            message: "Produit créé avec succès."
        });
    } catch (err) {
        console.error("Erreur lors de la création du produit :", err.message);
        res.status(500).json({
            error: "Erreur lors de la création du produit."
        });
    }
});

// Route GET pour récupérer tous les produits
router.get("/", async(req, res) => {
    try {
        const db = getDB();
        const products = await db.all("SELECT * FROM products");
        res.status(200).json(products);
    } catch (err) {
        console.error("Erreur lors de la récupération des produits :", err.message);
        res.status(500).json({ error: "Erreur lors de la récupération des produits." });
    }
});

// Route GET pour récupérer un produit spécifique
router.get("/:id", async(req, res) => {
    const { id } = req.params;

    try {
        const db = getDB();
        const product = await db.get("SELECT * FROM products WHERE id = ?", [id]);

        if (!product) {
            return res.status(404).json({ error: "Produit non trouvé." });
        }

        res.status(200).json(product);
    } catch (err) {
        console.error("Erreur lors de la récupération du produit :", err.message);
        res.status(500).json({ error: "Erreur lors de la récupération du produit." });
    }
});

// Route PUT pour modifier un produit
router.put("/:id", async(req, res) => {
    const { id } = req.params;
    const {
        name,
        description,
        price,
        original_price,
        category,
        badge,
        stock,
        image_path,
        video_path
    } = req.body;

    if (!name || !description || !price || !category || !stock) {
        return res.status(400).json({ error: "Les champs nom, description, prix, catégorie et stock sont requis." });
    }

    try {
        const db = getDB();
        const result = await db.run(
            `UPDATE products SET 
                name = ?, 
                description = ?, 
                price = ?, 
                original_price = ?, 
                category = ?, 
                badge = ?, 
                stock = ?, 
                image_path = ?, 
                video_path = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`, [
                name,
                description,
                price,
                original_price || null,
                category,
                badge || null,
                stock,
                image_path || null,
                video_path || null,
                id
            ]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: "Produit non trouvé." });
        }

        res.status(200).json({ message: "Produit modifié avec succès." });
    } catch (err) {
        console.error("Erreur lors de la modification :", err.message);
        res.status(500).json({ error: "Erreur lors de la modification." });
    }
});

// Route DELETE pour supprimer un produit
router.delete("/:id", async(req, res) => {
    const { id } = req.params;

    try {
        const db = getDB();
        const result = await db.run("DELETE FROM products WHERE id = ?", [id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Produit non trouvé." });
        }

        res.status(200).json({ message: "Produit supprimé avec succès." });
    } catch (err) {
        console.error("Erreur lors de la suppression :", err.message);
        res.status(500).json({ error: "Erreur lors de la suppression." });
    }
});

export default router;