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
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Hero Section */}
            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                <div className="max-w-6xl mx-auto">
                    <div>
                        <div className="mb-2" style={{ color: "#E8A63A" }}>
                            <span className="text-sm font-semibold tracking-widest">● SPONSOR DIRECTORY</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">All Sponsors</h1>
                        <p className="text-gray-300">View and manage all registered sponsors in the system</p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-6 mb-8 -mt-6">
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#E8A63A" }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Sponsors</p>
                                    <p className="text-3xl font-bold mt-2" style={{ color: "#E8A63A" }}>{sponsors.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(232, 166, 58, 0.1)" }}>
                                    <FaUsers className="text-xl" style={{ color: "#E8A63A" }} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: "#27a745" }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Online Now</p>
                                    <p className="text-3xl font-bold mt-2" style={{ color: "#27a745" }}>
                                        {sponsors.filter(s => s.isOnline).length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(39, 167, 69, 0.1)" }}>
                                    <FaUserCheck className="text-xl" style={{ color: "#27a745" }} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Offline</p>
                                    <p className="text-3xl font-bold text-gray-500 mt-2">
                                        {sponsors.filter(s => !s.isOnline).length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                                    <FaUsers className="text-xl text-gray-400" />
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
                                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="relative">
                                            <img
                                                src={sponsor.avatar || `https://ui-avatars.com/api/?name=${sponsor.fullName || sponsor.username}&background=2c5f5d&color=E8A63A`}
                                                alt={sponsor.fullName}
                                                className="w-16 h-16 rounded-full border-2"
                                                style={{ borderColor: sponsor.isOnline ? "#27a745" : "#ccc" }}
                                            />
                                            {sponsor.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: "#27a745" }}></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-800">
                                                {sponsor.fullName || sponsor.username}
                                            </h3>
                                            <p className="text-sm text-gray-500">@{sponsor.username}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-t border-gray-200 pt-3">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaEnvelope className="text-sm" style={{ color: "#E8A63A" }} />
                                            <span className="text-sm">{sponsor.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white" style={{
                                                backgroundColor: sponsor.isOnline ? "#27a745" : "#999"
                                            }}>
                                                {sponsor.isOnline ? '● Online' : '○ Offline'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllSponsors;
