import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaEnvelope, FaUserCheck } from 'react-icons/fa';

const AllSponsors = () => {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchSponsors() {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/sponsors');
            setSponsors(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching sponsors:', err);
            setLoading(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSponsors();
    }, []);

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FaUsers className="text-[#FFD700]" />
                        All Sponsors
                    </h1>
                    <p className="text-gray-600 mt-2">View all registered sponsors</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Sponsors</p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{sponsors.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#FFD700] bg-opacity-20 rounded-full flex items-center justify-center">
                                <FaUsers className="text-[#2F4F4F] text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Online Now</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    {sponsors.filter(s => s.isOnline).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <FaUserCheck className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Offline</p>
                                <p className="text-3xl font-bold text-gray-400 mt-1">
                                    {sponsors.filter(s => !s.isOnline).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <FaUsers className="text-gray-400 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sponsors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            Loading sponsors...
                        </div>
                    ) : sponsors.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No sponsors found
                        </div>
                    ) : (
                        sponsors.map((sponsor) => (
                            <div
                                key={sponsor._id}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        <img
                                            src={sponsor.avatar || `https://ui-avatars.com/api/?name=${sponsor.fullName || sponsor.username}&background=FFD700&color=2F4F4F`}
                                            alt={sponsor.fullName}
                                            className="w-16 h-16 rounded-full border-2 border-gray-200"
                                        />
                                        {sponsor.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-800">
                                            {sponsor.fullName || sponsor.username}
                                        </h3>
                                        <p className="text-sm text-gray-500">@{sponsor.username}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaEnvelope className="text-sm" />
                                        <span className="text-sm">{sponsor.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs ${sponsor.isOnline
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {sponsor.isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllSponsors;
