const Ticket = require('../models/Ticket');

// Create a new support ticket (Student/Leader)
exports.createTicket = async (req, res) => {
    try {
        const { createdBy, group, subject, description, priority, attachments } = req.body;

        if (!createdBy || !subject || !description) {
            return res.status(400).json({ error: 'createdBy, subject, and description are required.' });
        }

        const ticket = new Ticket({
            createdBy,
            group,
            subject,
            description,
            priority: priority || 'low',
            attachments: attachments || []
        });

        await ticket.save();
        res.status(201).json(ticket);
    } catch (err) {
        console.error('Create ticket error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Get tickets for a specific user
exports.getUserTickets = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const tickets = await Ticket.find({ createdBy: userId })
            .sort({ createdAt: -1 });
            
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all tickets (Admin)
exports.getAllTickets = async (req, res) => {
    try {
        // Enforce Admin role if provided in standard body/query pattern, otherwise handled by auth middleware
        const userRole = (req.body && req.body.userRole) || (req.query && req.query.userRole);
        if (userRole && userRole !== 'admin') {
            return res.status(403).json({ error: 'Forbidden - Admin access required' });
        }

        const tickets = await Ticket.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username email fullName role');
            
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin responds to a ticket
exports.respondToTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminResponse, respondedBy, status } = req.body;

        const userRole = (req.body && req.body.userRole) || (req.query && req.query.userRole);
        if (userRole && userRole !== 'admin') {
            return res.status(403).json({ error: 'Forbidden - Admin access required' });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        if (adminResponse) ticket.adminResponse = adminResponse;
        if (respondedBy) ticket.respondedBy = respondedBy;
        
        if (status) {
            ticket.status = status;
            if (status === 'resolved' || status === 'closed') {
                ticket.resolvedAt = new Date();
            } else if (status === 'open' || status === 'in-progress') {
                ticket.resolvedAt = null; // Clear if it gets reopened
            }
        }

        await ticket.save();
        res.json(ticket);
    } catch (err) {
        console.error('Respond to ticket error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Admin updates ticket status (Lifecycle progress)
exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const userRole = (req.body && req.body.userRole) || (req.query && req.query.userRole);
        if (userRole && userRole !== 'admin') {
            return res.status(403).json({ error: 'Forbidden - Admin access required' });
        }

        if (!status) {
            return res.status(400).json({ error: 'Status is required.' });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        ticket.status = status;

        if (status === 'resolved' || status === 'closed') {
            ticket.resolvedAt = new Date();
        } else {
            ticket.resolvedAt = null; 
        }

        await ticket.save();
        res.json(ticket);
    } catch (err) {
        console.error('Update ticket status error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findByIdAndDelete(id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        res.json({ message: 'Ticket deleted successfully' });
    } catch (err) {
        console.error('Delete ticket error:', err);
        res.status(500).json({ error: err.message });
    }
};
