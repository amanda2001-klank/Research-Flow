const Document = require('../models/Document');
const GroupMember = require('../models/GroupMember');
const FortnightCycle = require('../models/FortnightCycle');
const path = require('path');

// Upload a new document
exports.uploadDocument = async (req, res) => {
    try {
        const { groupId, title, documentType, description, uploadedBy } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `/uploads/documents/${req.file.filename}`;

        // Auto-resolve the sponsorId from the FortnightCycle for this group
        let sponsorId = null;
        const cycle = await FortnightCycle.findOne({ groupId }).sort({ createdAt: -1 });
        if (cycle && cycle.supervisorId) {
            sponsorId = cycle.supervisorId;
        }

        const doc = new Document({
            groupId,
            sponsorId,
            title,
            documentType,
            description,
            uploadedBy,
            currentVersion: 1,
            versions: [{
                versionNumber: 1,
                fileUrl,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                uploadedBy,
                uploadedAt: new Date()
            }]
        });

        await doc.save();
        res.status(201).json(doc);
    } catch (err) {
        console.error('Upload document error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Upload a new version to an existing document
exports.uploadVersion = async (req, res) => {
    try {
        const { id } = req.params;
        const { uploadedBy, comments } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const doc = await Document.findById(id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const newVersion = doc.currentVersion + 1;
        const fileUrl = `/uploads/documents/${req.file.filename}`;

        doc.versions.push({
            versionNumber: newVersion,
            fileUrl,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            uploadedBy,
            uploadedAt: new Date(),
            comments: comments || ''
        });
        doc.currentVersion = newVersion;
        doc.status = 'Pending'; // reset status on new version
        doc.revisionRequestNote = '';
        doc.revisionRequestedBy = '';
        doc.revisionRequestedAt = null;

        await doc.save();
        res.json(doc);
    } catch (err) {
        console.error('Upload version error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Get all documents for a specific group
exports.getDocumentsByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const docs = await Document.find({ groupId }).sort({ updatedAt: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all documents (for supervisor — optionally filtered by sponsorId)
exports.getAllDocuments = async (req, res) => {
    try {
        const filter = {};
        if (req.query.sponsorId) {
            filter.sponsorId = req.query.sponsorId;
        }
        const docs = await Document.find(filter).sort({ updatedAt: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get documents only for a specific sponsor
exports.getDocumentsBySponsor = async (req, res) => {
    try {
        const { sponsorId } = req.params;
        const docs = await Document.find({ sponsorId }).sort({ updatedAt: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single document by ID
exports.getDocumentById = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update document status
exports.updateDocumentStatus = async (req, res) => {
    try {
        const { status, revisionNote, requestedBy } = req.body;
        const update = { status };

        if (status === 'Revision Requested') {
            update.revisionRequestNote = (revisionNote || '').trim();
            update.revisionRequestedBy = requestedBy || '';
            update.revisionRequestedAt = new Date();
        } else {
            update.revisionRequestNote = '';
            update.revisionRequestedBy = '';
            update.revisionRequestedAt = null;
        }

        const doc = await Document.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        res.json({ message: 'Document deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
