import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Variable pour stocker l'instance de la base de données
let db;

// Fonction pour initialiser la base de données
export async function initDB() {
  // Ouverture de la base de données SQLite
  db = await open({
    filename: './database.db', // Chemin vers le fichier SQLite
    driver: sqlite3.Database, // Utilisation du driver SQLite
  });

  // Création de la table `users` si elle n'existe pas déjà
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, -- ID unique pour chaque utilisateur
      name TEXT NOT NULL,                   -- Nom de l'utilisateur
      email TEXT NOT NULL UNIQUE,           -- Email unique de l'utilisateur
      password TEXT NOT NULL                -- Mot de passe de l'utilisateur
    )
  `);

  console.log('Base de données initialisée.');
}

// Fonction pour récupérer l'instance de la base de données
export function getDB() {
  // Vérification que la base de données a été initialisée
  if (!db) {
    throw new Error('La base de données n\'a pas été initialisée. Appelez initDB() d\'abord.');
  }
  return db;
}