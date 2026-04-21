import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import NotificationCenter from "../components/NotificationCenter";
import AIBot from "../components/AIBot";
import { FaUserGraduate, FaCalendarAlt, FaFileAlt, FaChartLine, FaArrowRight, FaCheckCircle, FaExclamationCircle, FaUpload, FaClock, FaBook, FaComments, FaSearch, FaLightbulb, FaPencilAlt, FaTasks, FaAward, FaGraduationCap, FaBell } from "react-icons/fa";

const StudentHome = ({ setView }) => {
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
        <>
            <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f0f4f8" }}>
                {/* Hero Section with Urgency */}
                <div className="p-8 bg-gradient-to-r from-[#2c5f5d] to-[#1a3a39]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">👋 Welcome back, {user?.fullName || "Student"}!</h1>
                                <p className="text-gray-200 text-lg">Your research journey continues here. Let's make progress today!</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <NotificationCenter />
                                <div className="text-right">
                                    <p className="text-sm text-gray-300">Last active</p>
                                    <p className="text-sm text-white font-semibold">Today at 10:30 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        
                        {/* Quick Action Buttons */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: "#E8A63A" }}>
                            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                                <FaTasks style={{ color: "#E8A63A" }} />
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <button 
                                    onClick={() => setView && setView('Documents')}
                                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#E8A63A] hover:shadow-lg transition group bg-gradient-to-br from-blue-50 to-blue-100">
                                    <FaUpload className="text-2xl mb-2" style={{ color: "#2c5f5d" }} />
                                    <p className="font-semibold text-gray-800 group-hover:text-[#2c5f5d] transition">Upload Document</p>
                                    <p className="text-xs text-gray-600">Submit research work</p>
                                </button>
                                
                                <button 
                                    onClick={() => setView && setView('Fortnight Log')}
                                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#E8A63A] hover:shadow-lg transition group bg-gradient-to-br from-green-50 to-green-100">
                                    <FaPencilAlt className="text-2xl mb-2" style={{ color: "#27a745" }} />
                                    <p className="font-semibold text-gray-800 group-hover:text-[#27a745] transition">Fortnight Log</p>
                                    <p className="text-xs text-gray-600">Submit progress report</p>
                                </button>
                                
                                <button 
                                    onClick={() => setView && setView('Plagiarism Checker')}
                                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#E8A63A] hover:shadow-lg transition group bg-gradient-to-br from-purple-50 to-purple-100">
                                    <FaSearch className="text-2xl mb-2" style={{ color: "#8b5cf6" }} />
                                    <p className="font-semibold text-gray-800 group-hover:text-[#8b5cf6] transition">Plagiarism Check</p>
                                    <p className="text-xs text-gray-600">Check originality</p>
                                </button>
                                
                                <button 
                                    onClick={() => setView && setView('Chat')}
                                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#E8A63A] hover:shadow-lg transition group bg-gradient-to-br from-orange-50 to-orange-100">
                                    <FaComments className="text-2xl mb-2" style={{ color: "#ff6b6b" }} />
                                    <p className="font-semibold text-gray-800 group-hover:text-[#ff6b6b] transition">Chat Support</p>
                                    <p className="text-xs text-gray-600">Message supervisor</p>
                                </button>
                            </div>
                        </div>

                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Days Until Deadline */}
                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border-l-4 border-red-500 shadow-md hover:shadow-lg transition">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Days Until Deadline</p>
                                        <p className="text-3xl font-bold text-red-600 mt-2">7</p>
                                        <p className="text-xs text-gray-600 mt-1">Fortnight 1 Log</p>
                                    </div>
                                    <FaClock className="text-3xl text-red-400" />
                                </div>
                            </div>

                            {/* Tasks Pending */}
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border-l-4 border-orange-500 shadow-md hover:shadow-lg transition">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Pending Tasks</p>
                                        <p className="text-3xl font-bold text-orange-600 mt-2">3</p>
                                        <p className="text-xs text-gray-600 mt-1">2 Logs, 1 Document</p>
                                    </div>
                                    <FaTasks className="text-3xl text-orange-400" />
                                </div>
                            </div>

                            {/* Overall Progress */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-500 shadow-md hover:shadow-lg transition">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Overall Progress</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-2">65%</p>
                                        <p className="text-xs text-gray-600 mt-1">2 of 3 completed</p>
                                    </div>
                                    <FaAward className="text-3xl text-blue-400" />
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500 shadow-md hover:shadow-lg transition">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">System Status</p>
                                        <p className="text-3xl font-bold text-green-600 mt-2">ACTIVE</p>
                                        <p className="text-xs text-gray-600 mt-1">All systems operational</p>
                                    </div>
                                    <FaCheckCircle className="text-3xl text-green-400" />
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Left Column - Upcoming Deadlines & Activity */}
                            <div className="lg:col-span-2 space-y-6">
                                
                                {/* Upcoming Deadlines */}
                                <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: "#2c5f5d" }}>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaCalendarAlt style={{ color: "#2c5f5d" }} />
                                        Upcoming Deadlines
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { title: "Fortnight 1 Log Submission", date: "Oct 15, 2024", days: 7, icon: "📝", priority: "high" },
                                            { title: "Literature Review Document", date: "Oct 22, 2024", days: 14, icon: "📚", priority: "medium" },
                                            { title: "Methodology Approval", date: "Nov 1, 2024", days: 24, icon: "✅", priority: "low" }
                                        ].map((deadline, idx) => (
                                            <div key={idx} className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                                                deadline.priority === 'high' ? 'bg-red-50 border-red-500' :
                                                deadline.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                                                'bg-blue-50 border-blue-500'
                                            }`}>
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="text-2xl">{deadline.icon}</span>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{deadline.title}</p>
                                                        <p className="text-xs text-gray-600">{deadline.date}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    deadline.priority === 'high' ? 'bg-red-200 text-red-700' :
                                                    deadline.priority === 'medium' ? 'bg-yellow-200 text-yellow-700' :
                                                    'bg-blue-200 text-blue-700'
                                                }`}>
                                                    {deadline.days} days
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Announcements & Activity */}
                                <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: "#E8A63A" }}>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaBell style={{ color: "#E8A63A" }} />
                                        Recent Updates
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { type: "admin", title: "Admin Notice: Complete your profile by Friday", time: "2 hours ago", icon: "📢" },
                                            { type: "feedback", title: "Your Draft Proposal has been reviewed", time: "Yesterday", icon: "✏️" },
                                            { type: "system", title: "System Update: New features available", time: "2 days ago", icon: "⚙️" }
                                        ].map((activity, idx) => (
                                            <div key={idx} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition border-l-4 border-gray-200">
                                                <span className="text-2xl">{activity.icon}</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-800">{activity.title}</p>
                                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Progress & Resources */}
                            <div className="space-y-6">
                                
                                {/* Research Progress */}
                                <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: "#2c5f5d" }}>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaChartLine style={{ color: "#2c5f5d" }} />
                                        Research Progress
                                    </h3>
                                    <div className="space-y-5">
                                        {[
                                            { name: "Proposal", status: 100, color: "#27a745" },
                                            { name: "Literature Review", status: 60, color: "#E8A63A" },
                                            { name: "Methodology", status: 20, color: "#ff6b6b" },
                                            { name: "Data Collection", status: 0, color: "#d3d3d3" }
                                        ].map((item, idx) => (
                                            <div key={idx}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                                                    <span className="text-xs font-bold" style={{ color: item.color }}>{item.status}%</span>
                                                </div>
                                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full rounded-full transition-all duration-500" 
                                                        style={{ width: `${item.status}%`, backgroundColor: item.color }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Resources */}
                                <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: "#27a745" }}>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaBook style={{ color: "#27a745" }} />
                                        Quick Resources
                                    </h3>
                                    <div className="space-y-2">
                                        <button onClick={() => setView && setView('Guidelines')} className="w-full flex items-center p-3 rounded-lg hover:bg-green-50 transition text-gray-700 hover:text-[#27a745] font-medium">
                                            <FaGraduationCap className="mr-3" /> Guidelines
                                        </button>
                                        <button onClick={() => setView && setView('Resources')} className="w-full flex items-center p-3 rounded-lg hover:bg-green-50 transition text-gray-700 hover:text-[#27a745] font-medium">
                                            <FaLightbulb className="mr-3" /> Tips & Best Practices
                                        </button>
                                        <button onClick={() => setView && setView('FAQ')} className="w-full flex items-center p-3 rounded-lg hover:bg-green-50 transition text-gray-700 hover:text-[#27a745] font-medium">
                                            <FaComments className="mr-3" /> FAQs
                                        </button>
                                        <button onClick={() => setView && setView('ResearchIdeas')} className="w-full flex items-center p-3 rounded-lg hover:bg-green-50 transition text-gray-700 hover:text-[#27a745] font-medium">
                                            <FaBook className="mr-3" /> Research Templates
                                        </button>
                                    </div>
                                </div>

                                {/* Help & Support */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md p-6 border-2 border-indigo-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        💡 Need Help?
                                    </h3>
                                    <p className="text-sm text-gray-700 mb-4">Use the AI Assistant chatbox (bottom right) to get instant answers about deadlines, submissions, and more!</p>
                                    <button onClick={() => {
                                        // Scroll to bottom to make AIBot visible
                                        window.scrollTo({ bottom: 0, behavior: 'smooth' });
                                    }} className="w-full px-4 py-2 rounded-lg text-white font-semibold transition hover:shadow-lg" style={{ backgroundColor: "#2c5f5d" }}>
                                        Ask AI Assistant
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AIBot />
        </>
    );
};

export default StudentHome;
