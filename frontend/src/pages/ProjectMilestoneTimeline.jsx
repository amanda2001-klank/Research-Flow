import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import NotificationCenter from "../components/NotificationCenter";
import { FaCheckCircle, FaCircle, FaPlus, FaCalendarAlt } from "react-icons/fa";

const ProjectMilestoneTimeline = () => {
    const { user } = useContext(AuthContext);
    const [milestones, setMilestones] = useState([
        {
            id: 1,
            title: "Literature Review",
            description: "Complete comprehensive literature review on the topic",
            dueDate: "2026-05-15",
            status: "completed",
            progress: 100
        },
        {
            id: 2,
            title: "Research Proposal",
            description: "Finalize and submit the research proposal",
            dueDate: "2026-06-30",
            status: "in-progress",
            progress: 60
        },
        {
            id: 3,
            title: "Ethics Approval",
            description: "Obtain ethics committee approval for research",
            dueDate: "2026-07-31",
            status: "pending",
            progress: 0
        },
        {
            id: 4,
            title: "Data Collection",
            description: "Conduct experiments and collect research data",
            dueDate: "2026-09-30",
            status: "pending",
            progress: 0
        }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newMilestone, setNewMilestone] = useState({
        title: "",
        description: "",
        dueDate: "",
        status: "pending",
        progress: 0
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "text-green-600";
            case "in-progress":
                return "text-blue-600";
            case "pending":
                return "text-gray-400";
            default:
                return "text-gray-400";
        }
    };

    const getStatusBgColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-50 border-green-200";
            case "in-progress":
                return "bg-blue-50 border-blue-200";
            case "pending":
                return "bg-gray-50 border-gray-200";
            default:
                return "bg-gray-50 border-gray-200";
        }
    };

    const handleAddMilestone = async (e) => {
        e.preventDefault();
        
        if (!newMilestone.title || !newMilestone.dueDate) {
            alert("Please fill in title and due date");
            return;
        }

        const milestone = {
            id: milestones.length + 1,
            ...newMilestone
        };

        setMilestones([...milestones, milestone]);
        
        // Create notification
        try {
            await axios.post("http://localhost:5000/api/notifications", {
                recipient: user._id,
                type: "system",
                content: `New milestone "${newMilestone.title}" has been added to your project timeline`,
                isRead: false
            });
        } catch (err) {
            console.log("Notification failed:", err);
        }
        
        setNewMilestone({
            title: "",
            description: "",
            dueDate: "",
            status: "pending",
            progress: 0
        });
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMilestone({
            ...newMilestone,
            [name]: name === "progress" ? parseInt(value) : value
        });
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Project Milestone Timeline</h1>
                        <p className="text-gray-600 mt-2">Track your project progress and milestones</p>
                    </div>
                    <NotificationCenter />
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400"></div>

                    {/* Milestones */}
                    <div className="space-y-6">
                        {milestones.map((milestone, idx) => (
                            <div key={milestone.id} className="relative pl-24">
                                {/* Timeline dot */}
                                <div className={`absolute left-0 top-6 flex items-center justify-center ${getStatusColor(milestone.status)}`}>
                                    {milestone.status === "completed" ? (
                                        <FaCheckCircle size={32} className="bg-white rounded-full" />
                                    ) : (
                                        <FaCircle size={24} />
                                    )}
                                </div>

                                {/* Milestone card */}
                                <div className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition ${getStatusBgColor(milestone.status)}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800">{milestone.title}</h3>
                                            <p className="text-gray-600 text-sm mt-2">{milestone.description}</p>
                                            
                                            {/* Progress bar */}
                                            <div className="mt-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-gray-600">Progress</span>
                                                    <span className="text-xs font-bold text-gray-800">{milestone.progress}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                                        style={{ width: `${milestone.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Due date */}
                                        <div className="ml-4 text-right">
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <FaCalendarAlt size={14} />
                                                {new Date(milestone.dueDate).toLocaleDateString()}
                                            </div>
                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                                milestone.status === "completed" ? "bg-green-200 text-green-800" :
                                                milestone.status === "in-progress" ? "bg-blue-200 text-blue-800" :
                                                "bg-gray-200 text-gray-800"
                                            }`}>
                                                {milestone.status.replace("-", " ")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Milestone Button */}
                <div className="mt-8 flex justify-center">
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                    >
                        <FaPlus size={16} />
                        Add New Milestone
                    </button>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Milestone</h2>
                            
                            <form onSubmit={handleAddMilestone} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newMilestone.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter milestone title"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={newMilestone.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter milestone description"
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Due Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={newMilestone.dueDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={newMilestone.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Progress (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="progress"
                                        value={newMilestone.progress}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                                    >
                                        Add Milestone
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setNewMilestone({
                                                title: "",
                                                description: "",
                                                dueDate: "",
                                                status: "pending",
                                                progress: 0
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

export default ProjectMilestoneTimeline;
