const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const unique = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${unique}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'text/plain',
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed. Accepted: PDF, Word, Excel, PowerPoint, images, text.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
