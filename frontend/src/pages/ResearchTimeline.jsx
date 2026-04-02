import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import NotificationCenter from "../components/NotificationCenter";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaFlag, FaEdit, FaPlus } from "react-icons/fa";

const ResearchTimeline = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([
        {
            id: 1,
            title: "Research Proposal Submission",
            date: "2026-05-15",
            status: "completed",
            priority: "high",
            description: "Submit final research proposal to supervisor"
        },
        {
            id: 2,
            title: "Literature Review Meeting",
            date: "2026-05-20",
            status: "completed",
            priority: "high",
            description: "Meet with supervisor to discuss literature findings"
        },
        {
            id: 3,
            title: "Methodology Approval",
            date: "2026-06-10",
            status: "in-progress",
            priority: "high",
            description: "Get supervisor approval on research methodology"
        },
        {
            id: 4,
            title: "Ethics Committee Review",
            date: "2026-06-30",
            status: "upcoming",
            priority: "high",
            description: "Obtain ethics approval for research"
        },
        {
            id: 5,
            title: "Data Collection Phase 1",
            date: "2026-07-15",
            status: "upcoming",
            priority: "medium",
            description: "Begin first phase of data collection"
        },
        {
            id: 6,
            title: "Mid-term Progress Report",
            date: "2026-08-31",
            status: "upcoming",
            priority: "medium",
            description: "Submit progress report to supervisor"
        },
        {
            id: 7,
            title: "Data Analysis Phase",
            date: "2026-09-15",
            status: "upcoming",
            priority: "medium",
            description: "Start analyzing collected data"
        },
        {
            id: 8,
            title: "Final Report Submission",
            date: "2026-12-15",
            status: "upcoming",
            priority: "high",
            description: "Submit final research report"
        }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        date: "",
        status: "upcoming",
        priority: "medium"
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "text-green-600";
            case "in-progress":
                return "text-blue-600";
            case "upcoming":
                return "text-gray-400";
            default:
                return "text-gray-400";
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        
        if (!newEvent.title || !newEvent.date) {
            alert("Please fill in title and date");
            return;
        }

        const event = {
            id: events.length + 1,
            ...newEvent
        };

        setEvents([...events, event]);
        
        // Create notification
        try {
            await axios.post("http://localhost:5000/api/notifications", {
                recipient: user._id,
                type: "system",
                content: `New event "${newEvent.title}" has been added to your research timeline`,
                isRead: false
            });
        } catch (err) {
            console.log("Notification failed:", err);
        }
        
        setNewEvent({
            title: "",
            description: "",
            date: "",
            status: "upcoming",
            priority: "medium"
        });
        setShowModal(false);
    };

    const handleEventInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvent({
            ...newEvent,
            [name]: value
        });
    };

    const completedCount = events.filter(e => e.status === 'completed').length;
    const inProgressCount = events.filter(e => e.status === 'in-progress').length;
    const upcomingCount = events.filter(e => e.status === 'upcoming').length;

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Research Timeline</h1>
                        <p className="text-gray-600 mt-2">Track all important dates and milestones for your research</p>
                    </div>
                    <NotificationCenter />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Completed</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}</p>
                            </div>
                            <FaCheckCircle size={32} className="text-green-600" />
                        </div>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{inProgressCount}</p>
                            </div>
                            <FaClock size={32} className="text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Upcoming</p>
                                <p className="text-3xl font-bold text-gray-600 mt-2">{upcomingCount}</p>
                            </div>
                            <FaCalendarAlt size={32} className="text-gray-600" />
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Timeline Events</h2>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <FaPlus size={16} /> Add Event
                        </button>
                    </div>

                    <div className="space-y-4">
                        {events.map((event, idx) => (
                            <div key={event.id} className="relative">
                                {/* Timeline connector */}
                                {idx !== events.length - 1 && (
                                    <div className="absolute left-8 top-16 w-1 h-8 bg-gray-200"></div>
                                )}

                                <div className="flex gap-6">
                                    {/* Timeline dot */}
                                    <div className="flex flex-col items-center">
                                        <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 border-white ${
                                            event.status === 'completed' ? 'bg-green-100' :
                                            event.status === 'in-progress' ? 'bg-blue-100' :
                                            'bg-gray-100'
                                        }`}>
                                            {event.status === 'completed' ? (
                                                <FaCheckCircle className="text-green-600" size={24} />
                                            ) : event.status === 'in-progress' ? (
                                                <FaClock className="text-blue-600" size={24} />
                                            ) : (
                                                <FaCalendarAlt className="text-gray-400" size={24} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Event content */}
                                    <div className="flex-1 pb-4">
                                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getPriorityBadgeColor(event.priority)}`}>
                                                            {event.priority} Priority
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                                                    <p className="text-sm text-gray-500 font-medium">
                                                        📅 {formatDate(event.date)}
                                                    </p>
                                                </div>
                                                <button className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-blue-600">
                                                    <FaEdit size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Event</h2>
                            
                            <form onSubmit={handleAddEvent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newEvent.title}
                                        onChange={handleEventInputChange}
                                        placeholder="Enter event title"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={newEvent.description}
                                        onChange={handleEventInputChange}
                                        placeholder="Enter event description"
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={newEvent.date}
                                        onChange={handleEventInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={newEvent.status}
                                        onChange={handleEventInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="completed">Completed</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="upcoming">Upcoming</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        name="priority"
                                        value={newEvent.priority}
                                        onChange={handleEventInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                                    >
                                        Add Event
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setNewEvent({
                                                title: "",
                                                description: "",
                                                date: "",
                                                status: "upcoming",
                                                priority: "medium"
                                            });
                                        }}
                                        className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResearchTimeline;
