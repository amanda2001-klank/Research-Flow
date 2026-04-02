import { useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChannelDetails from "../components/ChannelDetails";
import ChannelList from "../components/ChannelList";
import NotificationCenter from "../components/NotificationCenter";
import { AuthContext } from "../context/AuthContext";

import AnnouncementForm from "../components/AnnouncementForm";
import AnnouncementList from "../components/AnnouncementList";
import Announcements from "./Announcements";
import FAQ from "./FAQ";
import AIAssistant from "./AIAssistant";
import ManageSponsors from "./ManageSponsors";
import ManageStudents from "./ManageStudents";
import AllSponsors from "./AllSponsors";
import FortnightPage from "./FortnightPage";
import DocumentsPage from "./DocumentsPage";
import StudentHome from "./StudentHome";
import ProjectMilestoneTimeline from "./ProjectMilestoneTimeline";
import PlagiarismChecker from "./PlagiarismChecker";
import ResearchTimeline from "./ResearchTimeline";

const Dashboard = () => {
    const [chatWith, setChatWith] = useState(null);
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('Dashboard');

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
                return (
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                                <NotificationCenter />
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex flex-col gap-6">
                                    {(user?.role === 'sponsor' || user?.role === 'admin') && <AnnouncementForm />}
                                    <AnnouncementList />
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

            case 'All Sponsors':
                return <AllSponsors />;

            case 'Fortnight Log':
            case 'Fortnight Review':
                return <FortnightPage />;

            case 'Documents':
                return <DocumentsPage />;

            case 'Student Home':
                return <StudentHome />;

            case 'Project Milestones':
                return <ProjectMilestoneTimeline />;

            case 'Plagiarism Checker':
                return <PlagiarismChecker />;

            case 'Research Timeline':
                return <ResearchTimeline />;

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
        <div className="h-screen w-screen bg-gray-50 flex overflow-hidden font-sans">
            {/* 1. Main Navigation Sidebar */}
            <Sidebar view={view} setView={setView} />

            {/* 2. Content Area based on View */}
            {renderContent()}
        </div>
    );
};

export default Dashboard;
