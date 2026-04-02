import { useState, useContext } from "react";
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
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md">
                        <FaPlus size={16} />
                        Add New Milestone
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectMilestoneTimeline;
