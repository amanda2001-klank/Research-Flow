// Simple role-based authorization middleware
// In production, use JWT tokens for authentication

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        // In a real app, extract user from JWT token
        // For this demo, we'll expect userId and role in request body or query
        const userRole = (req.body && req.body.userRole) || (req.query && req.query.userRole);

        if (!userRole) {
            return res.status(401).json({ error: 'Unauthorized - No role provided' });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
        }

        next();
    };
};

const requireAdmin = (req, res, next) => {
    const userRole = (req.body && req.body.userRole) || (req.query && req.query.userRole);

    if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    next();
};

const requireSponsorOrAdmin = (req, res, next) => {
    const userRole = (req.body && req.body.userRole) || (req.query && req.query.userRole);

    if (userRole !== 'admin' && userRole !== 'sponsor') {
        return res.status(403).json({ error: 'Forbidden - Sponsor or Admin access required' });
    }

    next();
};

module.exports = {
    requireRole,
    requireAdmin,
    requireSponsorOrAdmin
};
