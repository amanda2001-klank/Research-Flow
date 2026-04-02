const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentController = require('../controllers/documentController');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for document uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// POST /api/documents - Upload a new document
router.post('/', upload.single('file'), documentController.uploadDocument);

// POST /api/documents/:id/version - Upload a new version
router.post('/:id/version', upload.single('file'), documentController.uploadVersion);

// GET /api/documents - Get all documents
router.get('/', documentController.getAllDocuments);

// GET /api/documents/group/:groupId - Get documents by group
router.get('/group/:groupId', documentController.getDocumentsByGroup);

// GET /api/documents/sponsor/:sponsorId - Get documents by sponsor
router.get('/sponsor/:sponsorId', documentController.getDocumentsBySponsor);

// GET /api/documents/:id - Get single document
router.get('/:id', documentController.getDocumentById);

// PATCH /api/documents/:id/status - Update document status
router.patch('/:id/status', documentController.updateDocumentStatus);

// DELETE /api/documents/:id
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
