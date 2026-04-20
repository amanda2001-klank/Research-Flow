import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const RaiseTicket = ({ setView }) => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        priority: "low",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        if (!formData.subject || !formData.description) {
            setMessage({ type: "error", text: "Please fill in all required fields." });
            setLoading(false);
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/tickets", {
                createdBy: user._id,
                subject: formData.subject,
                description: formData.description,
                priority: formData.priority,
                userRole: user.role
            });
            setMessage({ type: "success", text: "Support ticket submitted successfully!" });
            setFormData({ subject: "", description: "", priority: "low" });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Failed to submit ticket." });
        }
        setLoading(false);
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Raise a Support Ticket</h1>
                        <p className="text-gray-600 mt-2">Submit a request for help, bug reports, or administrative assistance.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setView('My Tickets')}
                        className="px-4 py-2 mt-1 bg-white hover:bg-gray-50 text-[#2c5f5d] font-semibold rounded-lg shadow-sm border border-gray-200 transition flex items-center gap-2 whitespace-nowrap"
                    >
                        🎟️ View My Tickets
                    </button>
                </div>

                {message.text && (
                    <div className={`p-4 mb-6 rounded-lg font-medium text-sm border-l-4 shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-500' : 'bg-red-50 text-red-800 border-red-500'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="mb-5">
                        <label className="block text-gray-700 font-medium mb-2 text-sm">Target Department / Subject *</label>
                        <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c5f5d] focus:border-transparent transition"
                        >
                            <option value="">Select a subject...</option>
                            <option value="Technical Issue / Bug">Technical Issue / Bug</option>
                            <option value="Account / Access Issue">Account / Access Issue</option>
                            <option value="Group / Milestone Query">Group / Milestone Query</option>
                            <option value="General Support">General Support</option>
                        </select>
                    </div>

                    <div className="mb-5">
                        <label className="block text-gray-700 font-medium mb-2 text-sm">Priority Level</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c5f5d] focus:border-transparent transition"
                        >
                            <option value="low">Low - General query</option>
                            <option value="medium">Medium - Needs attention</option>
                            <option value="high">High - Blocking progress</option>
                            <option value="urgent">Urgent - Critical system failure</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2 text-sm">Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="6"
                            placeholder="Please provide as much detail as possible to help us resolve your issue..."
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c5f5d] focus:border-transparent transition resize-none"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ subject: "", description: "", priority: "low" })}
                            className="px-6 py-2 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                        >
                            Clear
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 rounded-lg font-medium text-white transition disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "#2c5f5d" }}
                        >
                            {loading ? "Submitting..." : "Submit Ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RaiseTicket;
