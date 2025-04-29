import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du stockage pour les images de profil
const profileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/users'));
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configuration du stockage pour les images de produits
const productImageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/products/images'));
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configuration du stockage pour les vidéos de produits
const productVideoStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/products/videos'));
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre pour les images
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées!'), false);
    }
};

// Filtre pour les vidéos
const videoFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les vidéos sont autorisées!'), false);
    }
};

// Middleware pour l'upload des images de profil
export const uploadProfileImage = multer({
    storage: profileStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// Middleware pour l'upload des images de produits
export const uploadProductImage = multer({
    storage: productImageStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// Middleware pour l'upload des vidéos de produits
export const uploadProductVideo = multer({
    storage: productVideoStorage,
    fileFilter: videoFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    }
});