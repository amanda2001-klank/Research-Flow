import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AnnouncementForm from '../components/AnnouncementForm';
import AnnouncementList from '../components/AnnouncementList';
import { FaBullhorn } from 'react-icons/fa';

const Announcements = () => {
    const { user } = useContext(AuthContext);
    const canCreateAnnouncement = user?.role === 'admin' || user?.role === 'sponsor';

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FaBullhorn className="text-[#FFD700]" />
                        Announcements
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {canCreateAnnouncement
                            ? 'Create and manage announcements'
                            : 'Stay updated with the latest announcements'}
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {canCreateAnnouncement && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Announcement</h2>
                            <AnnouncementForm />
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Announcements</h2>
                        <AnnouncementList />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Announcements;
