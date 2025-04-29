import express from 'express';
import { getDB } from '../db.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configuration du stockage pour les fichiers
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let uploadPath = 'uploads/';
        if (file.fieldname === 'image_path') {
            uploadPath += 'images/';
        } else if (file.fieldname === 'video_path') {
            uploadPath += 'videos/';
        }
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configuration de multer pour gérer les fichiers
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max
    },
    fileFilter: function(req, file, cb) {
        if (file.fieldname === 'image_path') {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Seules les images sont autorisées'), false);
            }
        } else if (file.fieldname === 'video_path') {
            if (!file.mimetype.startsWith('video/')) {
                return cb(new Error('Seules les vidéos sont autorisées'), false);
            }
        }
        cb(null, true);
    }
});

// Route pour créer un nouveau produit
router.post('/', upload.fields([
    { name: 'image_path', maxCount: 1 },
    { name: 'video_path', maxCount: 1 }
]), async(req, res) => {
    try {
        const { name, description, price, original_price, category, badge, stock } = req.body;

        if (!name || !description || !price || !category || !stock) {
            return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
        }

        const db = await getDB();
        const result = await db.run(
            `INSERT INTO products (name, description, price, original_price, category, badge, stock, image_path, video_path)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                name,
                description,
                price,
                original_price || null,
                category,
                badge || null,
                stock,
                req.files && req.files.image_path && req.files.image_path[0] ? req.files.image_path[0].path : null,
                req.files && req.files.video_path && req.files.video_path[0] ? req.files.video_path[0].path : null
            ]
        );

        res.status(201).json({
            success: true,
            id: result.lastID
        });
    } catch (error) {
        console.error('Erreur lors de la création du produit:', error);
        res.status(500).json({ error: 'Une erreur est survenue lors de la création du produit' });
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
router.put("/:id", upload.fields([
    { name: 'image_path', maxCount: 1 },
    { name: 'video_path', maxCount: 1 }
]), async(req, res) => {
    const { id } = req.params;
    const {
        name,
        description,
        price,
        original_price,
        category,
        badge,
        stock
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
                image_path = COALESCE(?, image_path), 
                video_path = COALESCE(?, video_path),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`, [
                name,
                description,
                price,
                original_price || null,
                category,
                badge || null,
                stock,
                req.files && req.files.image_path && req.files.image_path[0] ? req.files.image_path[0].path : null,
                req.files && req.files.video_path && req.files.video_path[0] ? req.files.video_path[0].path : null,
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