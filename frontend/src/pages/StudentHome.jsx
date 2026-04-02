import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import NotificationCenter from "../components/NotificationCenter";
import { FaUserGraduate, FaCalendarAlt, FaFileAlt, FaChartLine, FaArrowRight, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const StudentHome = () => {
    const { user } = useContext(AuthContext);

    const stats = [
        { 
            label: "Next Deadline", 
            value: "Oct 15", 
            subtext: "Fortnight 1 Log",
            icon: <FaCalendarAlt size={24} />
        },
        { 
            label: "Pending Tasks", 
            value: "3", 
            subtext: "2 Logs, 1 Document",
            icon: <FaFileAlt size={24} />
        },
        { 
            label: "System Status", 
            value: "ACTIVE", 
            subtext: "All systems operational",
            icon: <FaChartLine size={24} />,
            isActive: true
        }
    ];

    const recentActivities = [
        {
            id: 1,
            type: "system",
            title: "System: Welcome to ResearchFlow v1.0",
            time: "Just now",
            icon: <FaCheckCircle/>
        },
        {
            id: 2,
            type: "admin",
            title: "Admin: Please complete your group profile by Friday.",
            time: "2 hours ago",
            icon: <FaExclamationCircle/>
        },
        {
            id: 3,
            type: "submission",
            title: "Submission: Draft Proposal approved for review.",
            time: "Yesterday at 4:30 PM",
            icon: <FaCheckCircle/>
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Hero Section */}
            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-2" style={{ color: "#E8A63A" }}>
                                <span className="text-sm font-semibold tracking-widest">● STUDENT OVERVIEW</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.fullName || "Student"}!</h1>
                            <p className="text-gray-300">Monitor your milestones, manage submissions, and keep your research timeline moving.</p>
                        </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1" style={{ backgroundColor: "#E8A63A" }}>2</span>
                                        <NotificationCenter />
                                    </div>
                                    <button className="px-6 py-2 rounded-lg text-white" style={{ backgroundColor: "#E8A63A" }}>
                                        View Details
                                    </button>
                                </div>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 -mt-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-l-4" 
                                style={{ borderColor: stat.isActive ? "#27a745" : "#E8A63A" }}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                                        <p className="text-3xl font-bold" style={{ color: stat.isActive ? "#27a745" : "#E8A63A" }}>{stat.value}</p>
                                        <p className="text-gray-500 text-xs mt-1">{stat.subtext}</p>
                                    </div>
                                    <div className="text-gray-400">{stat.icon}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Activity */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                                    <button className="text-sm hover:underline" style={{ color: "#E8A63A" }}>
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition border-l-4 border-gray-200">
                                            <div className="text-gray-400 mt-1" style={{ color: activity.type === "admin" ? "#E8A63A" : "#2c5f5d" }}>
                                                {activity.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-700 text-sm">{activity.title}</p>
                                                <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Completion Progress */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Completion Progress</h2>
                            
                            <div className="space-y-6">
                                {/* Task Completion */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-600" style={{ color: "#E8A63A" }}>TASK COMPLETION</span>
                                        <span className="text-sm font-bold" style={{ color: "#E8A63A" }}>65%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: "65%", backgroundColor: "#E8A63A" }}></div>
                                    </div>
                                </div>

                                {/* Proposal */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-800">Proposal</span>
                                        <span className="text-xs font-bold text-green-600">DONE</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-green-500" style={{ width: "100%" }}></div>
                                    </div>
                                </div>

                                {/* Literature Review */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-800">Literature Review</span>
                                        <span className="text-xs font-bold" style={{ color: "#E8A63A" }}>IN PROGRESS</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: "60%", backgroundColor: "#E8A63A" }}></div>
                                    </div>
                                </div>

                                {/* Methodology */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-800">Methodology</span>
                                        <span className="text-xs font-bold text-gray-500">PENDING</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-gray-300" style={{ width: "20%" }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
