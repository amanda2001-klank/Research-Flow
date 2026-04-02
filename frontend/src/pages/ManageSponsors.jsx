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
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <FaUserShield className="text-[#FFD700]" />
                            Manage Sponsors
                        </h1>
                        <p className="text-gray-600 mt-2">Add or remove sponsor accounts</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-[#2F4F4F] text-white rounded-lg hover:bg-[#3A5F5F] transition-colors flex items-center gap-2"
                    >
                        <FaPlus />
                        Add Sponsor
                    </button>
                </div>

                {/* Add Sponsor Form */}
                {showForm && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Sponsor</h2>
                        <form onSubmit={handleCreateSponsor} className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                            />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                            />
                            <div className="col-span-2 flex gap-3">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[#2F4F4F] text-white rounded-lg hover:bg-[#3A5F5F] transition-colors"
                                >
                                    Create Sponsor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Sponsors List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Username</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
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
                                    <tr key={sponsor._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-800">{sponsor.fullName || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-600">{sponsor.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{sponsor.username}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs ${sponsor.isOnline
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {sponsor.isOnline ? 'Online' : 'Offline'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDeleteSponsor(sponsor._id)}
                                                className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-2"
                                            >
                                                <FaTrash />
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
    );
};

export default ManageSponsors;
