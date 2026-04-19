import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NotificationCenter from "../components/NotificationCenter";
import { FaUserGraduate, FaCalendarAlt, FaFileAlt, FaChartLine, FaArrowRight, FaCheckCircle, FaExclamationCircle, FaBell, FaClock, FaTimesCircle } from "react-icons/fa";

const StudentHome = ({ onNavigate }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [weeklyDigest, setWeeklyDigest] = useState(null);
    const [selectedDeadline, setSelectedDeadline] = useState(null);

    // Mock weekly digest data
    const mockWeeklyDigest = {
        weekOf: "Oct 9 - Oct 15",
        submissionsCount: 2,
        tasksCompleted: 5,
        deadlinesThisWeek: 3,
        documentViewed: 12,
        feedbackReceived: 3,
        highlights: [
            { title: "Proposal submitted", status: "completed" },
            { title: "Fortnight Log Week 2 submitted", status: "completed" },
            { title: "Received mentor feedback", status: "new" }
        ]
    };

    // Mock escalation alerts (missed deadlines)
    const missedDeadlines = [
        {
            id: 1,
            title: "Fortnight Log - Week 1",
            dueDate: "Oct 8",
            daysPassed: 2,
            severity: "high",
            supervisor: "Dr. Smith"
        },
        {
            id: 2,
            title: "Group Reflection Form",
            dueDate: "Oct 10",
            daysPassed: 1,
            severity: "moderate",
            supervisor: "Dr. Johnson"
        }
    ];

    // Upcoming deadlines
    const upcomingDeadlines = [
        {
            id: 1,
            title: "Fortnight Log - Week 3",
            dueDate: "Oct 17",
            daysUntil: 2,
            severity: "high"
        },
        {
            id: 2,
            title: "Research Proposal Revision",
            dueDate: "Oct 20",
            daysUntil: 5,
            severity: "moderate"
        },
        {
            id: 3,
            title: "Literature Review Draft",
            dueDate: "Oct 25",
            daysUntil: 10,
            severity: "low"
        }
    ];

    useEffect(() => {
        setWeeklyDigest(mockWeeklyDigest);
    }, []);

    // Navigation Handlers
    const handleViewDetails = () => {
        // Navigate to Documents/Submissions page for detailed view
        if (onNavigate) onNavigate('Documents');
    };

    const handleViewAllActivities = () => {
        // Show all activities - could be a modal or dedicated page
        console.log("View all activities clicked");
        // Could open a modal or navigate to detailed activities page
    };

    const handleSubmitMissedDeadline = (deadlineId) => {
        // Navigate to document upload for submission
        setSelectedDeadline(deadlineId);
        if (onNavigate) onNavigate('Documents');
    };

    const handleViewFullReport = () => {
        // Navigate to detailed weekly digest/analytics
        if (onNavigate) onNavigate('Analytics');
    };

    const handleViewCalendar = () => {
        // Navigate to calendar/fortnight view
        if (onNavigate) onNavigate('Fortnight Log');
    };

    const handleViewDeadlineDetails = (deadline) => {
        // Show deadline details - could open modal or navigate
        setSelectedDeadline(deadline);
        if (onNavigate) onNavigate('Documents');
    };

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
                                    <button 
                                        onClick={handleViewDetails}
                                        className="px-6 py-2 rounded-lg text-white hover:opacity-90 transition" 
                                        style={{ backgroundColor: "#E8A63A" }}
                                    >
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
                                    <button 
                                        onClick={handleViewAllActivities}
                                        className="text-sm hover:underline" 
                                        style={{ color: "#E8A63A" }}
                                    >
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

                    {/* Alerts & Digest Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        {/* Escalation Alerts - Missed Deadlines */}
                        {missedDeadlines.length > 0 && (
                            <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-red-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <FaTimesCircle size={24} style={{ color: "#E74C3C" }} />
                                    <div>
                                        <h2 className="text-xl font-bold text-red-900">Missed Deadlines</h2>
                                        <p className="text-sm text-red-700">Action required</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {missedDeadlines.map((deadline) => (
                                        <div key={deadline.id} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-bold text-red-900">{deadline.title}</p>
                                                    <p className="text-sm text-red-700 mt-1">
                                                        <FaClock size={14} className="inline mr-1" />
                                                        Due: {deadline.dueDate} ({deadline.daysPassed} days ago)
                                                    </p>
                                                    <p className="text-xs text-red-600 mt-1">Supervisor: {deadline.supervisor}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${
                                                    deadline.severity === 'high' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'
                                                }`}>
                                                    {deadline.severity.toUpperCase()}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleSubmitMissedDeadline(deadline.id)}
                                                className="mt-3 w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-semibold transition"
                                            >
                                                Submit Now
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Weekly Digest */}
                        {weeklyDigest && (
                            <div className="bg-white p-6 rounded-lg shadow-sm border-2" style={{ borderColor: "#E8A63A" }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <FaBell size={24} style={{ color: "#E8A63A" }} />
                                    <div>
                                        <h2 className="text-xl font-bold" style={{ color: "#2c5f5d" }}>Weekly Digest</h2>
                                        <p className="text-sm text-gray-600">Week of {weeklyDigest.weekOf}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold" style={{ color: "#E8A63A" }}>{weeklyDigest.submissionsCount}</div>
                                        <p className="text-xs text-gray-600 mt-1">Submissions</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold" style={{ color: "#27a745" }}>{weeklyDigest.tasksCompleted}</div>
                                        <p className="text-xs text-gray-600 mt-1">Tasks Completed</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold" style={{ color: "#2c5f5d" }}>{weeklyDigest.feedbackReceived}</div>
                                        <p className="text-xs text-gray-600 mt-1">Feedback</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-900 mb-3">Highlights</h3>
                                    <div className="space-y-2">
                                        {weeklyDigest.highlights.map((highlight, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <FaCheckCircle size={16} style={{ color: highlight.status === 'completed' ? '#27a745' : '#E8A63A' }} />
                                                <span className="text-sm text-gray-700">{highlight.title}</span>
                                                {highlight.status === 'new' && (
                                                    <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-bold">NEW</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={handleViewFullReport}
                                    className="w-full px-4 py-2 rounded-lg font-semibold transition text-white hover:opacity-90" 
                                    style={{ backgroundColor: "#E8A63A" }}
                                >
                                    View Full Report
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaCalendarAlt size={20} style={{ color: "#2c5f5d" }} />
                                Upcoming Deadlines
                            </h2>
                            <button 
                                onClick={handleViewCalendar}
                                className="text-sm hover:underline" 
                                style={{ color: "#E8A63A" }}
                            >
                                View Calendar
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {upcomingDeadlines.map((deadline) => {
                                const severityColor = {
                                    high: '#E74C3C',
                                    moderate: '#E8A63A',
                                    low: '#27a745'
                                }[deadline.severity];

                                return (
                                    <div key={deadline.id} className="p-4 rounded-lg border-l-4" style={{ borderColor: severityColor, backgroundColor: `${severityColor}15` }}>
                                        <p className="font-semibold text-gray-900">{deadline.title}</p>
                                        <div className="flex items-center gap-2 mt-2 text-sm">
                                            <FaClock size={14} style={{ color: severityColor }} />
                                            <span style={{ color: severityColor }}>
                                                {deadline.daysUntil} {deadline.daysUntil === 1 ? 'day' : 'days'} left
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">{deadline.dueDate}</p>
                                        <button 
                                            onClick={() => handleViewDeadlineDetails(deadline)}
                                            className="mt-3 w-full px-3 py-2 rounded text-sm font-semibold text-white transition hover:opacity-90" 
                                            style={{ backgroundColor: severityColor }}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
