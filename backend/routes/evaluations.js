const router = require('express').Router();
const evaluationController = require('../controllers/evaluationController');

// POST /api/evaluations - Submit an evaluation
router.post('/', evaluationController.submitEvaluation);

// GET /api/evaluations - Get all evaluations
router.get('/', evaluationController.getAllEvaluations);

// GET /api/evaluations/document/:documentId - Get evaluation for a document
router.get('/document/:documentId', evaluationController.getEvaluationByDocument);

// GET /api/evaluations/group/:groupId - Get evaluations for a group
router.get('/group/:groupId', evaluationController.getEvaluationsByGroup);

// GET /api/evaluations/summary/:documentId - Get evaluation summary
router.get('/summary/:documentId', evaluationController.getEvaluationSummary);

module.exports = router;
