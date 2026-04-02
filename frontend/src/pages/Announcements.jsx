import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AnnouncementForm from '../components/AnnouncementForm';
import AnnouncementList from '../components/AnnouncementList';
import { FaBullhorn } from 'react-icons/fa';

const Announcements = () => {
    const { user } = useContext(AuthContext);
    const canCreateAnnouncement = user?.role === 'admin' || user?.role === 'sponsor';

    return (
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Hero Section */}
            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                <div className="max-w-6xl mx-auto">
                    <div>
                        <div className="mb-2" style={{ color: "#E8A63A" }}>
                            <span className="text-sm font-semibold tracking-widest">📢 ANNOUNCEMENTS</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Latest Updates</h1>
                        <p className="text-gray-300">
                            {canCreateAnnouncement
                                ? 'Create and manage platform announcements'
                                : 'Stay updated with the latest announcements'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Content */}
                    <div className="space-y-6">
                        {canCreateAnnouncement && (
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Announcement</h2>
                                <AnnouncementForm />
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Announcements</h2>
                            <AnnouncementList />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Announcements;
