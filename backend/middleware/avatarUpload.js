const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/avatars'));
    },
    filename: (req, file, cb) => {
        const unique = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${unique}${ext}`);
    }
});

const imageFileFilter = (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (PNG, JPEG, JPG, GIF, WebP)'));
    }
};

const avatarUpload = multer({
    storage: avatarStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB for avatars
});

module.exports = avatarUpload;
