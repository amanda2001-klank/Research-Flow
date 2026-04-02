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
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Hero Section */}
            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-2" style={{ color: "#E8A63A" }}>
                                <span className="text-sm font-semibold tracking-widest">📅 RESEARCH TIMELINE</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">Research Events</h1>
                            <p className="text-gray-300">Track all important dates and milestones for your research</p>
                        </div>
                        <NotificationCenter />
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 -mt-4">
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#27a745" }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Completed</p>
                                    <p className="text-3xl font-bold mt-2" style={{ color: "#27a745" }}>{completedCount}</p>
                                    <p className="text-gray-500 text-xs mt-1">Finished tasks</p>
                                </div>
                                <FaCheckCircle size={32} style={{ color: "#27a745" }} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#E8A63A" }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">In Progress</p>
                                    <p className="text-3xl font-bold mt-2" style={{ color: "#E8A63A" }}>{inProgressCount}</p>
                                    <p className="text-gray-500 text-xs mt-1">Currently working</p>
                                </div>
                                <FaClock size={32} style={{ color: "#E8A63A" }} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#2c5f5d" }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Upcoming</p>
                                    <p className="text-3xl font-bold mt-2" style={{ color: "#2c5f5d" }}>{upcomingCount}</p>
                                    <p className="text-gray-500 text-xs mt-1">Pending tasks</p>
                                </div>
                                <FaCalendarAlt size={32} style={{ color: "#2c5f5d" }} />
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Timeline Events</h2>
                            <button 
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition font-medium"
                                style={{ backgroundColor: "#E8A63A" }}
                            >
                                <FaPlus size={16} /> Add Event
                            </button>
                        </div>

                        <div className="space-y-4">
                            {events.map((event, idx) => (
                                <div key={event.id} className="relative">
                                    {/* Timeline connector */}
                                    {idx !== events.length - 1 && (
                                        <div className="absolute left-8 top-16 w-1 h-8" style={{ backgroundColor: "#ddd" }}></div>
                                    )}

                                    <div className="flex gap-6">
                                        {/* Timeline dot */}
                                        <div className="flex flex-col items-center">
                                            <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 border-white`} style={{
                                                backgroundColor: event.status === 'completed' ? '#d4edda' :
                                                event.status === 'in-progress' ? '#fff3cd' :
                                                '#e2e3e5'
                                            }}>
                                                {event.status === 'completed' ? (
                                                    <FaCheckCircle style={{ color: "#27a745" }} size={24} />
                                                ) : event.status === 'in-progress' ? (
                                                    <FaClock style={{ color: "#E8A63A" }} size={24} />
                                                ) : (
                                                    <FaCalendarAlt style={{ color: "#999" }} size={24} />
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
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize`} style={{
                                                                backgroundColor: event.priority === 'high' ? '#f8d7da' :
                                                                event.priority === 'medium' ? '#fff3cd' :
                                                                '#d1ecf1',
                                                                color: event.priority === 'high' ? '#721c24' :
                                                                event.priority === 'medium' ? '#856404' :
                                                                '#0c5460'
                                                            }}>
                                                                {event.priority} Priority
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                                                        <p className="text-sm text-gray-500 font-medium">
                                                            📅 {formatDate(event.date)}
                                                        </p>
                                                    </div>
                                                    <button className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-teal-600">
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 text-white py-2 rounded-lg hover:opacity-90 transition font-medium"
                                            style={{ backgroundColor: "#E8A63A" }}
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
        </div>
    );
};

export default ResearchTimeline;
