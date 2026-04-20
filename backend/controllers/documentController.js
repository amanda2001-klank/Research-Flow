const Document = require('../models/Document');
const FortnightCycle = require('../models/FortnightCycle');
const DocumentRule = require('../models/DocumentRule');
const path = require('path');

const VALID_DOCUMENT_TYPES = ['Proposal', 'Progress Report', 'Final Report', 'Presentation', 'Other'];

const defaultMilestones = () => ([
    {
        key: 'proposal_submission',
        title: 'Proposal Submission',
        documentType: 'Proposal',
        required: true,
        dueDate: null,
        allowedExtensions: ['pdf', 'doc', 'docx'],
        maxSizeMb: 50,
        minDescriptionLength: 10,
        requiresVersionNotes: false,
        enforceDeadline: false,
        notes: 'Initial problem and approach document.'
    },
    {
        key: 'progress_report',
        title: 'Mid Progress Report',
        documentType: 'Progress Report',
        required: true,
        dueDate: null,
        allowedExtensions: ['pdf', 'doc', 'docx'],
        maxSizeMb: 50,
        minDescriptionLength: 10,
        requiresVersionNotes: true,
        enforceDeadline: false,
        notes: 'Interim update with completed milestones and blockers.'
    },
    {
        key: 'final_report',
        title: 'Final Report',
        documentType: 'Final Report',
        required: true,
        dueDate: null,
        allowedExtensions: ['pdf', 'doc', 'docx'],
        maxSizeMb: 60,
        minDescriptionLength: 20,
        requiresVersionNotes: true,
        enforceDeadline: false,
        notes: 'Final consolidated document for evaluation.'
    },
    {
        key: 'final_presentation',
        title: 'Presentation Deck',
        documentType: 'Presentation',
        required: false,
        dueDate: null,
        allowedExtensions: ['pdf', 'ppt', 'pptx'],
        maxSizeMb: 80,
        minDescriptionLength: 0,
        requiresVersionNotes: false,
        enforceDeadline: false,
        notes: 'Optional deck used for final defense or demos.'
    }
]);

const extFromFileName = (fileName = '') => path.extname(fileName).replace('.', '').toLowerCase();

const asDateOrNull = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeMilestone = (milestone = {}, index = 0) => {
    const normalizedType = VALID_DOCUMENT_TYPES.includes(milestone.documentType)
        ? milestone.documentType
        : 'Other';

    const allowedExtensions = Array.isArray(milestone.allowedExtensions)
        ? [...new Set(milestone.allowedExtensions
            .map((ext) => String(ext || '').trim().replace('.', '').toLowerCase())
            .filter(Boolean))]
        : [];

    return {
        key: String(milestone.key || `${normalizedType.toLowerCase().replace(/\s+/g, '_')}_${index + 1}`).trim(),
        title: String(milestone.title || normalizedType).trim(),
        documentType: normalizedType,
        required: milestone.required !== false,
        dueDate: asDateOrNull(milestone.dueDate),
        allowedExtensions: allowedExtensions.length ? allowedExtensions : ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
        maxSizeMb: Math.max(1, Math.min(500, Number(milestone.maxSizeMb) || 50)),
        minDescriptionLength: Math.max(0, Math.min(2000, Number(milestone.minDescriptionLength) || 0)),
        requiresVersionNotes: Boolean(milestone.requiresVersionNotes),
        enforceDeadline: Boolean(milestone.enforceDeadline),
        notes: String(milestone.notes || '').trim()
    };
};

const getOrCreateRules = async (groupId) => {
    let rules = await DocumentRule.findOne({ groupId });
    if (!rules) {
        rules = await DocumentRule.create({ groupId, milestones: defaultMilestones() });
    }
    return rules;
};

const findRuleForDocumentType = (rulesDoc, documentType) => {
    if (!rulesDoc || !Array.isArray(rulesDoc.milestones)) return null;
    return rulesDoc.milestones.find((milestone) => milestone.documentType === documentType) || null;
};

const validateAgainstRule = ({ rule, file, description, comments, isVersionUpload }) => {
    if (!rule) return [];

    const errors = [];
    const extension = extFromFileName(file?.originalname || '');
    const maxBytes = Number(rule.maxSizeMb || 50) * 1024 * 1024;
    const now = new Date();

    if (Array.isArray(rule.allowedExtensions) && rule.allowedExtensions.length > 0) {
        const allowed = rule.allowedExtensions.map((ext) => String(ext).toLowerCase());
        if (extension && !allowed.includes(extension)) {
            errors.push(`Allowed file types: ${allowed.join(', ')}.`);
        }
    }

    if (file?.size > maxBytes) {
        errors.push(`File exceeds maximum size of ${rule.maxSizeMb} MB.`);
    }

    if (!isVersionUpload && Number(rule.minDescriptionLength) > 0) {
        const text = String(description || '').trim();
        if (text.length < Number(rule.minDescriptionLength)) {
            errors.push(`Description must be at least ${rule.minDescriptionLength} characters.`);
        }
    }

    if (isVersionUpload && rule.requiresVersionNotes && String(comments || '').trim().length === 0) {
        errors.push('Version notes are required for this document type.');
    }

    if (rule.enforceDeadline && rule.dueDate && now > new Date(rule.dueDate)) {
        errors.push('Submission deadline has passed for this milestone.');
    }

    return errors;
};

// Upload a new document
exports.uploadDocument = async (req, res) => {
    try {
        const { groupId, title, documentType, description, uploadedBy } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!groupId || !title || !documentType) {
            return res.status(400).json({ error: 'groupId, title, and documentType are required.' });
        }

        if (!VALID_DOCUMENT_TYPES.includes(documentType)) {
            return res.status(400).json({ error: 'Invalid documentType provided.' });
        }

        const rules = await getOrCreateRules(groupId);
        const rule = findRuleForDocumentType(rules, documentType);
        const validationErrors = validateAgainstRule({
            rule,
            file: req.file,
            description,
            comments: '',
            isVersionUpload: false
        });

        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Submission rule validation failed.',
                details: validationErrors
            });
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

        const rules = await getOrCreateRules(doc.groupId);
        const rule = findRuleForDocumentType(rules, doc.documentType);
        const validationErrors = validateAgainstRule({
            rule,
            file: req.file,
            description: doc.description,
            comments,
            isVersionUpload: true
        });

        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Submission rule validation failed.',
                details: validationErrors
            });
        }

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
        doc.feedbackActions = [];

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

// Get checklist for required document milestones
exports.getMilestoneChecklist = async (req, res) => {
    try {
        const { groupId } = req.params;
        const rules = await getOrCreateRules(groupId);
        const docs = await Document.find({ groupId }).sort({ updatedAt: -1 });
        const now = new Date();

        const milestones = (rules.milestones || []).map((rule) => {
            const matches = docs.filter((doc) => doc.documentType === rule.documentType);
            const latest = matches[0] || null;
            const dueDate = rule.dueDate ? new Date(rule.dueDate) : null;
            const submitted = Boolean(latest);
            const isOverdue = Boolean(rule.required && dueDate && !submitted && dueDate < now);

            let status = 'pending';
            if (submitted && latest) {
                if (latest.status === 'Evaluated') status = 'completed';
                else if (latest.status === 'Revision Requested') status = 'revision_requested';
                else if (latest.status === 'Under Review') status = 'under_review';
                else status = 'submitted';
            } else if (!rule.required) {
                status = 'optional';
            } else if (isOverdue) {
                status = 'overdue';
            }

            const overdueDays = isOverdue && dueDate
                ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                : 0;

            return {
                ...rule.toObject(),
                submitted,
                status,
                overdueDays,
                latestDocument: latest
                    ? {
                        _id: latest._id,
                        title: latest.title,
                        status: latest.status,
                        currentVersion: latest.currentVersion,
                        updatedAt: latest.updatedAt
                    }
                    : null
            };
        });

        const requiredCount = milestones.filter((m) => m.required).length;
        const completedCount = milestones.filter((m) => m.required && m.submitted).length;
        const completionRate = requiredCount > 0
            ? Math.round((completedCount / requiredCount) * 100)
            : 100;

        res.json({
            groupId,
            rulesLastUpdatedAt: rules.updatedAt,
            progress: {
                requiredCount,
                completedCount,
                completionRate
            },
            milestones
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get document submission rules by group
exports.getDocumentRules = async (req, res) => {
    try {
        const { groupId } = req.params;
        const rules = await getOrCreateRules(groupId);
        res.json(rules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create or update document submission rules by group
exports.upsertDocumentRules = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { milestones, updatedBy } = req.body;

        if (!Array.isArray(milestones) || milestones.length === 0) {
            return res.status(400).json({ error: 'milestones array is required.' });
        }

        const sanitizedMilestones = milestones.map((m, idx) => normalizeMilestone(m, idx));

        const rules = await DocumentRule.findOneAndUpdate(
            { groupId },
            {
                groupId,
                milestones: sanitizedMilestones,
                updatedBy: String(updatedBy || '').trim()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json(rules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Compare two versions of a document
exports.compareDocumentVersions = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Document.findById(id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const latestVersion = Number(doc.currentVersion || 1);
        const fromVersionNumber = Number(req.query.from) || Math.max(1, latestVersion - 1);
        const toVersionNumber = Number(req.query.to) || latestVersion;

        const fromVersion = doc.versions.find((v) => Number(v.versionNumber) === fromVersionNumber);
        const toVersion = doc.versions.find((v) => Number(v.versionNumber) === toVersionNumber);

        if (!fromVersion || !toVersion) {
            return res.status(404).json({ error: 'Requested versions not found for this document.' });
        }

        const fromSize = Number(fromVersion.fileSize || 0);
        const toSize = Number(toVersion.fileSize || 0);
        const sizeDiff = toSize - fromSize;
        const fromDate = new Date(fromVersion.uploadedAt);
        const toDate = new Date(toVersion.uploadedAt);
        const hoursDiff = Math.round(((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60)) * 10) / 10;

        const result = {
            documentId: doc._id,
            title: doc.title,
            fromVersion: fromVersion.versionNumber,
            toVersion: toVersion.versionNumber,
            comparison: {
                fileNameChanged: fromVersion.fileName !== toVersion.fileName,
                fileTypeChanged: extFromFileName(fromVersion.fileName) !== extFromFileName(toVersion.fileName),
                fileSizeDeltaBytes: sizeDiff,
                fileSizeDeltaMb: Math.round((sizeDiff / (1024 * 1024)) * 100) / 100,
                timeDeltaHours: hoursDiff,
                commentsChanged: (fromVersion.comments || '') !== (toVersion.comments || ''),
                from: {
                    versionNumber: fromVersion.versionNumber,
                    fileName: fromVersion.fileName,
                    fileSize: fromVersion.fileSize,
                    uploadedBy: fromVersion.uploadedBy,
                    uploadedAt: fromVersion.uploadedAt,
                    comments: fromVersion.comments || ''
                },
                to: {
                    versionNumber: toVersion.versionNumber,
                    fileName: toVersion.fileName,
                    fileSize: toVersion.fileSize,
                    uploadedBy: toVersion.uploadedBy,
                    uploadedAt: toVersion.uploadedAt,
                    comments: toVersion.comments || ''
                }
            }
        };

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update one feedback action status for a document
exports.updateFeedbackActionStatus = async (req, res) => {
    try {
        const { id, actionId } = req.params;
        const { status, resolutionNote, resolvedBy } = req.body;

        if (!['open', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'status must be either open or resolved.' });
        }

        const doc = await Document.findById(id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const action = doc.feedbackActions.id(actionId);
        if (!action) {
            return res.status(404).json({ error: 'Feedback action not found' });
        }

        action.status = status;
        if (status === 'resolved') {
            action.resolutionNote = String(resolutionNote || '').trim();
            action.resolvedBy = String(resolvedBy || '').trim();
            action.resolvedAt = new Date();
        } else {
            action.resolutionNote = '';
            action.resolvedBy = '';
            action.resolvedAt = null;
        }

        await doc.save();

        const resolvedCount = doc.feedbackActions.filter((item) => item.status === 'resolved').length;

        res.json({
            message: 'Feedback action updated successfully.',
            action,
            resolvedCount,
            totalActions: doc.feedbackActions.length,
            feedbackActions: doc.feedbackActions
        });
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
        const { status, revisionNote, requestedBy, revisionActions } = req.body;
        const update = { status };

        if (status === 'Revision Requested') {
            const actions = Array.isArray(revisionActions)
                ? revisionActions
                    .map((item) => String(item || '').trim())
                    .filter(Boolean)
                : [];

            update.revisionRequestNote = (revisionNote || '').trim();
            update.revisionRequestedBy = requestedBy || '';
            update.revisionRequestedAt = new Date();
            update.feedbackActions = actions.map((title) => ({ title, status: 'open' }));
        } else {
            update.revisionRequestNote = '';
            update.revisionRequestedBy = '';
            update.revisionRequestedAt = null;
            update.feedbackActions = [];
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
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        if (doc.status === 'Evaluated') {
            return res.status(403).json({
                error: 'Evaluated documents cannot be deleted.'
            });
        }

        await doc.deleteOne();
        res.json({ message: 'Document deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
