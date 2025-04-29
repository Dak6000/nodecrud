import express from 'express';
import { getDB } from '../db.js';

const router = express.Router();

// Route pour obtenir les statistiques du dashboard
router.get('/', async(req, res) => {
    try {
        const db = getDB();

        // Récupérer le nombre total d'utilisateurs
        const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');

        // Récupérer le nombre total de produits
        const totalProducts = await db.get('SELECT COUNT(*) as count FROM products');

        // Récupérer le nombre total de commandes
        const totalOrders = await db.get('SELECT COUNT(*) as count FROM commandes');

        // Récupérer le revenu total (somme des montants des commandes)
        const totalRevenue = await db.get('SELECT COALESCE(SUM(montant_total), 0) as total FROM commandes');

        res.status(200).json({
            totalUsers: totalUsers.count,
            totalProducts: totalProducts.count,
            totalOrders: totalOrders.count,
            totalRevenue: totalRevenue.total
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
});

export default router;