import { useState, useContext, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChannelDetails from "../components/ChannelDetails";
import ChannelList from "../components/ChannelList";
import NotificationCenter from "../components/NotificationCenter";
import { AuthContext } from "../context/AuthContext";
import { FaUsers, FaUserGraduate, FaUserTie, FaCircle, FaUserShield, FaUserCheck, FaUsers as FaUsersAlt, FaHeadset } from "react-icons/fa";

import AnnouncementForm from "../components/AnnouncementForm";
import AnnouncementList from "../components/AnnouncementList";
import Announcements from "./Announcements";
import FAQ from "./FAQ";
import AIAssistant from "./AIAssistant";
import ManageSponsors from "./ManageSponsors";
import ManageStudents from "./ManageStudents";
import ManageUsers from "./ManageUsers";
import AllSponsors from "./AllSponsors";
import FortnightPage from "./FortnightPage";
import DocumentsPage from "./DocumentsPage";
import StudentHome from "./StudentHome";
import ProjectMilestoneTimeline from "./ProjectMilestoneTimeline";
import PlagiarismChecker from "./PlagiarismChecker";
import ResearchTimeline from "./ResearchTimeline";
import ResearchIdeas from "./ResearchIdeas";
import RaiseTicket from "./RaiseTicket";
import MyTickets from "./MyTickets";
import ManageTickets from "./ManageTickets";

const Dashboard = () => {
    const [chatWith, setChatWith] = useState(null);
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('Dashboard');
    const [stats, setStats] = useState({
        totalUsers: 0,
        students: 0,
        sponsors: 0,
        admins: 0,
        onlineUsers: 0,
        pendingReviews: 0,
        resubmissions: 0,
        approvedCycles: 0,
        documents: 0,
        assignedCycles: 24
    });
    const [loading, setLoading] = useState(false);

    // Fetch admin/sponsor stats
    useEffect(() => {
        const fetchStats = async () => {
            if (view !== 'Dashboard') return;
            setLoading(true);
            try {
                if (user?.role === 'admin') {
                    const [studentsRes, sponsorsRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/admin/students'),
                        axios.get('http://localhost:5000/api/admin/sponsors')
                    ]);
                    
                    const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
                    const sponsors = Array.isArray(sponsorsRes.data) ? sponsorsRes.data : [];
                    const onlineStudents = students.filter(s => s.isOnline).length;
                    const onlineSponsors = sponsors.filter(s => s.isOnline).length;
                    
                    setStats(prev => ({
                        ...prev,
                        totalUsers: students.length + sponsors.length + 1,
                        students: students.length,
                        sponsors: sponsors.length,
                        admins: 1,
                        onlineUsers: onlineStudents + onlineSponsors + 1
                    }));
                } else if (user?.role === 'sponsor') {
                    // Sponsor dashboard stats (demo data for now)
                    setStats(prev => ({
                        ...prev,
                        pendingReviews: 0,
                        resubmissions: 0,
                        approvedCycles: 0,
                        documents: 0,
                        assignedCycles: 24
                    }));
                }
            } catch (err) {
                console.log('Error fetching stats:', err);
                // Set demo data
                if (user?.role === 'admin') {
                    setStats(prev => ({
                        ...prev,
                        totalUsers: 12,
                        students: 7,
                        sponsors: 4,
                        admins: 1,
                        onlineUsers: 11
                    }));
                }
            }
            setLoading(false);
        };
        fetchStats();
    }, [view, user?.role]);

    // Render content based on selected view
    const renderContent = () => {
        switch (view) {
            case 'Chat':
                return (
                    <>
                        {/* Middle: Channel List */}
                        <ChannelList setChatWith={setChatWith} chatWith={chatWith} />

                        {/* Main: Chat Window */}
                        <div className="flex-1 flex flex-col min-w-0 bg-white shadow-sm mx-2 my-2 rounded-2xl overflow-hidden border border-gray-200">
                            <ChatWindow chatWith={chatWith} />
                        </div>

                        {/* Right: Channel Details */}
                        <ChannelDetails chatWith={chatWith} />
                    </>
                );

            case 'Dashboard':
                if (user?.role === 'sponsor') {
                    return (
                        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
                            {/* Hero Section */}
                            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                                <div className="max-w-6xl mx-auto">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="mb-2" style={{ color: "#E8A63A" }}>
                                                <span className="text-sm font-semibold tracking-widest">● SUPERVISOR PANEL</span>
                                            </div>
                                            <h1 className="text-4xl font-bold text-white mb-2">Supervisor Dashboard</h1>
                                            <p className="text-gray-300">Review student work, manage cycles, and provide feedback</p>
                                        </div>
                                        <NotificationCenter />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="max-w-6xl mx-auto">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-4 gap-4 mb-8 -mt-4">
                                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#E8A63A" }}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Pending Reviews</p>
                                                    <p className="text-3xl font-bold mt-2" style={{ color: "#E8A63A" }}>{stats.pendingReviews}</p>
                                                    <p className="text-gray-500 text-xs mt-1">Cycles waiting for your feedback</p>
                                                </div>
                                                <div className="text-2xl">📋</div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#ff6b6b" }}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Resubmissions</p>
                                                    <p className="text-3xl font-bold mt-2" style={{ color: "#ff6b6b" }}>{stats.resubmissions}</p>
                                                    <p className="text-gray-500 text-xs mt-1">Groups that need another pass</p>
                                                </div>
                                                <div className="text-2xl">⚠️</div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#27a745" }}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Approved Cycles</p>
                                                    <p className="text-3xl font-bold mt-2" style={{ color: "#27a745" }}>{stats.approvedCycles}</p>
                                                    <p className="text-gray-500 text-xs mt-1">0% of assigned cycles completed</p>
                                                </div>
                                                <div className="text-2xl">✅</div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#2c5f5d" }}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Documents</p>
                                                    <p className="text-3xl font-bold mt-2" style={{ color: "#2c5f5d" }}>{stats.documents}</p>
                                                    <p className="text-gray-500 text-xs mt-1">0 evaluated so far</p>
                                                </div>
                                                <div className="text-2xl">📄</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Queue and Sponsor Toolkit */}
                                    <div className="grid grid-cols-2 gap-8">
                                        {/* Review Queue */}
                                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-800">Review Queue</h2>
                                                    <p className="text-gray-600 text-sm mt-1">Prioritized cycles that need attention first</p>
                                                </div>
                                                <span className="text-xs font-semibold" style={{ color: "#2c5f5d" }}>{stats.assignedCycles} ASSIGNED CYCLES</span>
                                            </div>
                                            
                                            <div className="text-center py-12">
                                                <p className="text-gray-500">No cycles are waiting for review right now. Your queue is clear.</p>
                                            </div>
                                        </div>

                                        {/* Sponsor Toolkit */}
                                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                            <div className="mb-6">
                                                <h2 className="text-xl font-bold text-gray-800">Supervisor Toolkit</h2>
                                                <p className="text-gray-600 text-sm mt-1">The most used actions for this role</p>
                                            </div>

                                            <div className="space-y-3">
                                                {/* Document Review */}
                                                <button
                                                    onClick={() => setView('Documents')}
                                                    className="w-full p-4 rounded-lg border border-gray-200 hover:shadow-md transition text-left"
                                                    style={{ backgroundColor: "rgba(44, 95, 93, 0.05)" }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="text-2xl">📄</div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800">Document Review</h3>
                                                            <p className="text-gray-600 text-xs mt-1">Open uploaded work, version history, and evaluations</p>
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Fortnight Review */}
                                                <button
                                                    onClick={() => setView('Fortnight Log')}
                                                    className="w-full p-4 rounded-lg border border-gray-200 hover:shadow-md transition text-left"
                                                    style={{ backgroundColor: "rgba(232, 166, 58, 0.05)" }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="text-2xl">📊</div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800">Fortnight Review</h3>
                                                            <p className="text-gray-600 text-xs mt-1">Check progress reports and leave feedback</p>
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* AI Assistant */}
                                                <button
                                                    onClick={() => setView('AI Assistant')}
                                                    className="w-full p-4 rounded-lg border border-gray-200 hover:shadow-md transition text-left relative"
                                                    style={{ backgroundColor: "rgba(50, 150, 100, 0.05)" }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="text-2xl">🤖</div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800">AI Assistant</h3>
                                                            <p className="text-gray-600 text-xs mt-1">Get intelligent suggestions and insights</p>
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: "#E8A63A" }}>
                                                        AI Assistant
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
                
                // Admin Dashboard
                return (
                    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
                        {/* Hero Section */}
                        <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                            <div className="max-w-6xl mx-auto">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="mb-2" style={{ color: "#E8A63A" }}>
                                            <span className="text-sm font-semibold tracking-widest">● ADMIN PANEL</span>
                                        </div>
                                        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                                        <p className="text-gray-300">Manage announcements, systems, and communications platform-wide</p>
                                    </div>
                                    <NotificationCenter />
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="max-w-6xl mx-auto">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-4 gap-4 mb-8 -mt-4">
                                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#2c5f5d" }}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                                                <p className="text-3xl font-bold mt-2" style={{ color: "#2c5f5d" }}>{stats.totalUsers}</p>
                                                <p className="text-gray-500 text-xs mt-1">Students, sponsors, and admins</p>
                                            </div>
                                            <div className="text-3xl" style={{ color: "#E8A63A" }}>😊</div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#E8A63A" }}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-gray-600 text-sm font-medium">Students</p>
                                                <p className="text-3xl font-bold mt-2" style={{ color: "#E8A63A" }}>{stats.students}</p>
                                                <p className="text-gray-500 text-xs mt-1">Registered research students</p>
                                            </div>
                                            <div className="text-2xl">👨‍🎓</div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#2c5f5d" }}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-gray-600 text-sm font-medium">Sponsors</p>
                                                <p className="text-3xl font-bold mt-2" style={{ color: "#2c5f5d" }}>{stats.sponsors}</p>
                                                <p className="text-gray-500 text-xs mt-1">Active sponsor accounts</p>
                                            </div>
                                            <div className="text-2xl">👔</div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#27a745" }}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-gray-600 text-sm font-medium">Online Now</p>
                                                <p className="text-3xl font-bold mt-2" style={{ color: "#27a745" }}>{stats.onlineUsers}</p>
                                                <p className="text-gray-500 text-xs mt-1">Currently offline</p>
                                            </div>
                                            <div className="text-2xl">✅</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions and System Snapshot */}
                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    {/* Quick Actions */}
                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
                                            <p className="text-gray-600 text-sm mt-1">The most common admin tasks</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setView('Manage Sponsors')}
                                                className="p-4 rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition text-left"
                                                style={{ backgroundColor: "rgba(232, 166, 58, 0.05)" }}
                                            >
                                                <div className="text-2xl mb-2" style={{ color: "#E8A63A" }}>👔</div>
                                                <h3 className="font-semibold text-gray-800 text-sm">Manage Sponsors</h3>
                                                <p className="text-gray-600 text-xs mt-1">Create, review, and remove sponsor accounts</p>
                                            </button>

                                            <button
                                                onClick={() => setView('Manage Students')}
                                                className="p-4 rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition text-left"
                                                style={{ backgroundColor: "rgba(44, 95, 93, 0.05)" }}
                                            >
                                                <div className="text-2xl mb-2">👨‍🎓</div>
                                                <h3 className="font-semibold text-gray-800 text-sm">Manage Students</h3>
                                                <p className="text-gray-600 text-xs mt-1">Review student accounts and access status</p>
                                            </button>

                                            <button
                                                onClick={() => setView('Manage Users')}
                                                className="p-4 rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition text-left"
                                                style={{ backgroundColor: "rgba(232, 166, 58, 0.05)" }}
                                            >
                                                <div className="text-2xl mb-2">🔧</div>
                                                <h3 className="font-semibold text-gray-800 text-sm">Manage All Users</h3>
                                                <p className="text-gray-600 text-xs mt-1">Add, edit, and delete any user account</p>
                                            </button>

                                            <button
                                                onClick={() => setView('All Sponsors')}
                                                className="p-4 rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition text-left"
                                                style={{ backgroundColor: "rgba(100, 150, 150, 0.05)" }}
                                            >
                                                <div className="text-2xl mb-2">👥</div>
                                                <h3 className="font-semibold text-gray-800 text-sm">All Sponsors</h3>
                                                <p className="text-gray-600 text-xs mt-1">See every sponsor and their status</p>
                                            </button>

                                            <button
                                                onClick={() => setView('Announcements')}
                                                className="p-4 rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition text-left"
                                                style={{ backgroundColor: "rgba(50, 100, 200, 0.05)" }}
                                            >
                                                <div className="text-2xl mb-2">📢</div>
                                                <h3 className="font-semibold text-gray-800 text-sm">Announcements</h3>
                                                <p className="text-gray-600 text-xs mt-1">Broadcast messages to users</p>
                                            </button>

                                            <button
                                                className="p-4 rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition text-left"
                                                style={{ backgroundColor: "rgba(50, 150, 100, 0.05)" }}
                                            >
                                                <div className="text-2xl mb-2">🏠</div>
                                                <h3 className="font-semibold text-gray-800 text-sm">Admin Home</h3>
                                                <p className="text-gray-600 text-xs mt-1">Return to admin home screen</p>
                                            </button>

                                            <button
                                                className="p-4 rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition text-left"
                                                style={{ backgroundColor: "rgba(200, 100, 50, 0.05)" }}
                                            >
                                                <div className="text-2xl mb-2">🎧</div>
                                                <h3 className="font-semibold text-gray-800 text-sm">Support Center</h3>
                                                <p className="text-gray-600 text-xs mt-1">Help and support resources</p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* System Snapshot */}
                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-800">System Snapshot</h2>
                                            <p className="text-gray-600 text-sm mt-1">Role breakdown and live status</p>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-semibold" style={{ color: "#2c5f5d" }}>USER DISTRIBUTION</span>
                                                    <span className="text-sm font-bold" style={{ color: "#2c5f5d" }}>{stats.totalUsers} TOTAL</span>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm text-gray-700">Students</span>
                                                            <span className="text-sm font-semibold text-gray-700">{stats.students}</span>
                                                        </div>
                                                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${(stats.students / stats.totalUsers) * 100}%`, backgroundColor: "#E8A63A" }}></div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm text-gray-700">Sponsors</span>
                                                            <span className="text-sm font-semibold text-gray-700">{stats.sponsors}</span>
                                                        </div>
                                                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${(stats.sponsors / stats.totalUsers) * 100}%`, backgroundColor: "#2c5f5d" }}></div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm text-gray-700">Admins</span>
                                                            <span className="text-sm font-semibold text-gray-700">{stats.admins}</span>
                                                        </div>
                                                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: "100%", backgroundColor: "#555" }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Announcements Section */}
                                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                    <div className="flex flex-col gap-6">
                                        {(user?.role === 'sponsor' || user?.role === 'admin') && <AnnouncementForm />}
                                        <AnnouncementList />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Announcements':
                return <Announcements />;

            case 'FAQ':
                return <FAQ />;

            case 'AI Assistant':
                return <AIAssistant />;

            case 'Manage Sponsors':
                return <ManageSponsors />;

            case 'Manage Students':
                return <ManageStudents />;

            case 'Manage Users':
                return <ManageUsers />;

            case 'All Sponsors':
                return <AllSponsors />;

            case 'Fortnight Log':
            case 'Fortnight Review':
                return <FortnightPage />;

            case 'Documents':
                return <DocumentsPage />;

            case 'Student Home':
                return <StudentHome onNavigate={setView} />;

            case 'Project Milestones':
                return <ProjectMilestoneTimeline />;

            case 'Plagiarism Checker':
                return <PlagiarismChecker />;

            case 'Research Timeline':
                return <ResearchTimeline />;

            case 'Research Ideas':
                return <ResearchIdeas />;

            case 'Raise Ticket':
                return <RaiseTicket setView={setView} />;

            case 'My Tickets':
                return <MyTickets />;

            case 'Support Tickets':
                return <ManageTickets />;

            default:
                return (
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-3xl font-bold text-gray-800">{view}</h1>
                                <NotificationCenter />
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="text-center py-20 text-gray-400">
                                    Content for {view} goes here.
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-50 flex overflow-hidden font-sans relative">
            {/* 1. Main Navigation Sidebar */}
            <Sidebar view={view} setView={setView} />

            {/* 2. Content Area based on View */}
            {renderContent()}

            {/* 3. Floating AI Assistant Button */}
            {view !== 'AI Assistant' && (
                <button
                    onClick={() => setView('AI Assistant')}
                    className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center z-50 text-2xl"
                    style={{ backgroundColor: "#2c5f5d" }}
                    title="Open AI Assistant"
                >
                    🤖
                </button>
            )}
        </div>
    );
};

export default Dashboard;
