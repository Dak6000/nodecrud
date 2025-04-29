import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

// Variable pour stocker l'instance de la base de données
let db;

async function createDefaultUsers() {
    try {
        // Vérifier si l'admin existe déjà
        const adminExists = await db.get("SELECT id FROM users WHERE email = 'admin@luxbags.com'");
        if (!adminExists) {
            const hashedAdminPassword = await bcrypt.hash('admin123', 10);
            await db.run(`
                INSERT INTO users (first_name, last_name, email, password, is_admin)
                VALUES (?, ?, ?, ?, ?)
            `, ['Admin', 'System', 'admin@luxbags.com', hashedAdminPassword, 1]);
            console.log('Utilisateur admin créé avec succès');
        }

        // Vérifier si dak existe déjà
        const dakExists = await db.get("SELECT id FROM users WHERE email = 'dak@dak.com'");
        if (!dakExists) {
            const hashedDakPassword = await bcrypt.hash('dak', 10);
            await db.run(`
                INSERT INTO users (first_name, last_name, email, password)
                VALUES (?, ?, ?, ?)
            `, ['Dak', 'User', 'dak@dak.com', hashedDakPassword]);
            console.log('Utilisateur dak créé avec succès');
        }
    } catch (error) {
        console.error('Erreur lors de la création des utilisateurs par défaut:', error);
    }
}

// Fonction pour initialiser la base de données
export async function initDB() {
    // Ouverture de la base de données SQLite
    db = await open({
        filename: './database.db', // Chemin vers le fichier SQLite
        driver: sqlite3.Database, // Utilisation du driver SQLite
    });

    // Création de toutes les tables en une seule transaction
    await db.exec(`
        -- Table des utilisateurs
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            city TEXT,
            country TEXT,
            profile_image TEXT,
            is_admin BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Table des produits
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL CHECK(price >= 0),
            original_price REAL CHECK(original_price >= 0),
            category TEXT NOT NULL,
            badge TEXT,
            stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
            image_path TEXT,
            video_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Table des paniers
        CREATE TABLE IF NOT EXISTS paniers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            utilisateur_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- Table des éléments du panier
        CREATE TABLE IF NOT EXISTS panier_elements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            panier_id INTEGER NOT NULL,
            produit_id INTEGER NOT NULL,
            quantite INTEGER NOT NULL DEFAULT 1 CHECK(quantite > 0),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (panier_id) REFERENCES paniers(id) ON DELETE CASCADE,
            FOREIGN KEY (produit_id) REFERENCES products(id) ON DELETE CASCADE,
            UNIQUE(panier_id, produit_id)
        );

        -- Table des commandes
        CREATE TABLE IF NOT EXISTS commandes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            utilisateur_id INTEGER NOT NULL,
            statut TEXT NOT NULL DEFAULT 'en_attente' CHECK(statut IN ('en_attente', 'en_cours', 'livree', 'annulee')),
            montant_total DECIMAL(10, 2) NOT NULL CHECK(montant_total >= 0),
            adresse_livraison TEXT NOT NULL,
            ville_livraison TEXT NOT NULL,
            pays_livraison TEXT NOT NULL,
            telephone TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- Table des éléments de commande
        CREATE TABLE IF NOT EXISTS commande_elements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            commande_id INTEGER NOT NULL,
            produit_id INTEGER NOT NULL,
            quantite INTEGER NOT NULL CHECK(quantite > 0),
            prix_unitaire DECIMAL(10, 2) NOT NULL CHECK(prix_unitaire >= 0),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
            FOREIGN KEY (produit_id) REFERENCES products(id) ON DELETE CASCADE
        );

        -- Table des factures
        CREATE TABLE IF NOT EXISTS factures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            commande_id INTEGER NOT NULL,
            numero_facture TEXT NOT NULL UNIQUE,
            montant_ht DECIMAL(10, 2) NOT NULL CHECK(montant_ht >= 0),
            tva DECIMAL(10, 2) NOT NULL CHECK(tva >= 0),
            montant_ttc DECIMAL(10, 2) NOT NULL CHECK(montant_ttc >= 0),
            date_emission DATETIME DEFAULT CURRENT_TIMESTAMP,
            statut TEXT NOT NULL DEFAULT 'non_payee' CHECK(statut IN ('non_payee', 'payee', 'annulee')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
        );

        -- Table des paiements
        CREATE TABLE IF NOT EXISTS paiements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            facture_id INTEGER NOT NULL,
            montant DECIMAL(10, 2) NOT NULL CHECK(montant >= 0),
            methode_paiement TEXT NOT NULL CHECK(methode_paiement IN ('carte', 'virement', 'paypal')),
            reference_paiement TEXT,
            statut TEXT NOT NULL DEFAULT 'en_attente' CHECK(statut IN ('en_attente', 'valide', 'refuse', 'annule')),
            date_paiement DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE
        );
    `);

    // Créer les utilisateurs par défaut
    await createDefaultUsers();

    console.log('Base de données initialisée avec succès.');
}

// Fonction pour récupérer l'instance de la base de données
export function getDB() {
    // Vérification que la base de données a été initialisée
    if (!db) {
        throw new Error('La base de données n\'a pas été initialisée. Appelez initDB() d\'abord.');
    }
    return db;
}