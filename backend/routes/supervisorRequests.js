const router = require('express').Router();
const requestController = require('../controllers/supervisorRequestController');

// CREATE new request
router.post('/', requestController.createRequest);

// GET all requests for a specific student
router.get('/student/:studentId', requestController.getRequestsByStudent);

// GET all requests for a specific supervisor
router.get('/supervisor/:sponsorId', requestController.getRequestsBySupervisor);

// UPDATE request status (Accept, Reject, Remove)
router.put('/:id/status', requestController.updateRequestStatus);

// DELETE (cancel) a request
router.delete('/:id', requestController.deleteRequest);

module.exports = router;
