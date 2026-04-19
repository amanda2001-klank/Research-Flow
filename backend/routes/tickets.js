const router = require('express').Router();
const ticketController = require('../controllers/ticketController');
const { requireRole, requireAdmin } = require('../middleware/authMiddleware');

// POST /api/tickets
// Create ticket (assumes students or leaders use this)
router.post('/', requireRole(['student', 'admin']), ticketController.createTicket);

// GET /api/tickets/user/:userId
// Get tickets for logged-in user
router.get('/user/:userId', requireRole(['student', 'admin', 'sponsor']), ticketController.getUserTickets);

// GET /api/tickets
// Get all tickets (admin only)
router.get('/', requireAdmin, ticketController.getAllTickets);

// PUT /api/tickets/:id/respond
// Respond to ticket (admin only)
router.put('/:id/respond', requireAdmin, ticketController.respondToTicket);

// PATCH /api/tickets/:id/status
// Update ticket status (admin only)
router.patch('/:id/status', requireAdmin, ticketController.updateTicketStatus);

// DELETE /api/tickets/:id
// Delete a ticket
router.delete('/:id', requireRole(['student', 'admin', 'sponsor']), ticketController.deleteTicket);

module.exports = router;
