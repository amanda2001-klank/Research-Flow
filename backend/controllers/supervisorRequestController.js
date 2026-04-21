const SupervisorRequest = require('../models/SupervisorRequest');

// Create a new request
exports.createRequest = async (req, res) => {
    try {
        const newRequest = new SupervisorRequest({
            studentId: req.body.studentId,
            sponsorId: req.body.sponsorId,
            groupId: req.body.groupId,
            membersList: req.body.membersList,
            topic: req.body.topic,
            domain: req.body.domain,
            reason: req.body.reason,
            status: 'Pending'
        });

        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get requests sent by a student
exports.getRequestsByStudent = async (req, res) => {
    try {
        const requests = await SupervisorRequest.find({ studentId: req.params.studentId })
            .populate('sponsorId', 'fullName username expertise')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get requests received by a supervisor
exports.getRequestsBySupervisor = async (req, res) => {
    try {
        const requests = await SupervisorRequest.find({ sponsorId: req.params.sponsorId })
            .populate('studentId', 'fullName username email')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update status (e.g. Accept, Reject, Remove)
exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedRequest = await SupervisorRequest.findByIdAndUpdate(
            req.params.id,
            { $set: { status: status } },
            { new: true }
        );
        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }
        res.status(200).json(updatedRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cancel/Delete request
exports.deleteRequest = async (req, res) => {
    try {
        const deletedRequest = await SupervisorRequest.findByIdAndDelete(req.params.id);
        if (!deletedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }
        res.status(200).json({ message: "Request successfully deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
