import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserShield, FaTrash, FaPlus } from 'react-icons/fa';

const ManageSponsors = () => {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: ''
    });

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

    const handleCreateSponsor = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/sponsors', formData);
            setFormData({ username: '', email: '', password: '', fullName: '' });
            setShowForm(false);
            fetchSponsors();
        } catch (err) {
            console.error('Error creating sponsor:', err);
            alert('Failed to create sponsor');
        }
    };

    const handleDeleteSponsor = async (id) => {
        if (!window.confirm('Are you sure you want to delete this sponsor?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/admin/sponsors/${id}`);
            fetchSponsors();
        } catch (err) {
            console.error('Error deleting sponsor:', err);
            alert('Failed to delete sponsor');
        }
    };

    return (
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Hero Section */}
            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-2" style={{ color: "#E8A63A" }}>
                                <span className="text-sm font-semibold tracking-widest">● SPONSOR MANAGEMENT</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">Manage Sponsors</h1>
                            <p className="text-gray-300">Add, edit, and remove sponsor accounts</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 font-semibold"
                            style={{ backgroundColor: "#E8A63A" }}
                        >
                            <FaPlus />
                            Add Sponsor
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Add Sponsor Form */}
                    {showForm && (
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Sponsor</h2>
                            <form onSubmit={handleCreateSponsor} className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                                    style={{ "--tw-ring-color": "#E8A63A" }}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                                    style={{ "--tw-ring-color": "#E8A63A" }}
                                />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                                    style={{ "--tw-ring-color": "#E8A63A" }}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                                    style={{ "--tw-ring-color": "#E8A63A" }}
                                />
                                <div className="col-span-2 flex gap-3">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all font-medium"
                                        style={{ backgroundColor: "#2c5f5d" }}
                                    >
                                        Create Sponsor
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Sponsors List */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: "#2c5f5d" }}>
                            <h2 className="text-lg font-semibold text-white">Active Sponsors</h2>
                        </div>
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#2c5f5d" }}>Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#2c5f5d" }}>Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#2c5f5d" }}>Username</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#2c5f5d" }}>Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#2c5f5d" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            Loading sponsors...
                                        </td>
                                    </tr>
                                ) : sponsors.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No sponsors found
                                        </td>
                                    </tr>
                                ) : (
                                    sponsors.map((sponsor) => (
                                        <tr key={sponsor._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-gray-800 font-medium">{sponsor.fullName || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-600">{sponsor.email}</td>
                                            <td className="px-6 py-4 text-gray-600">{sponsor.username}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${sponsor.isOnline
                                                        ? 'text-white'
                                                        : 'bg-gray-200 text-gray-700'
                                                    }`}
                                                    style={{ backgroundColor: sponsor.isOnline ? "#27a745" : undefined }}
                                                >
                                                    {sponsor.isOnline ? '● Online' : '○ Offline'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDeleteSponsor(sponsor._id)}
                                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition-colors flex items-center gap-2 font-medium"
                                                >
                                                    <FaTrash size={14} />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSponsors;
