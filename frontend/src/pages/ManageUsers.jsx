import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'student',
    });

    // Fetch all users
    async function fetchUsers() {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/admin/users');
            setUsers(res.data);
            setErrorMessage('');
        } catch (err) {
            console.error('Error fetching users:', err);
            setErrorMessage('Failed to load users');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Add new user
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const endpoint = formData.role === 'student' 
                ? 'http://localhost:5000/api/admin/students'
                : 'http://localhost:5000/api/admin/sponsors';
            
            await axios.post(endpoint, formData);
            setSuccessMessage(`${formData.role} added successfully!`);
            setShowAddModal(false);
            setFormData({ username: '', email: '', password: '', fullName: '', role: 'student' });
            fetchUsers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to add user');
        }
    };

    // Open edit modal
    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username || '',
            email: user.email || '',
            fullName: user.fullName || '',
            role: user.role || 'student',
        });
        setShowEditModal(true);
    };

    // Update user
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/admin/users/${editingUser._id}`, formData);
            setSuccessMessage('User updated successfully!');
            setShowEditModal(false);
            fetchUsers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to update user');
        }
    };

    // Delete user
    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        
        try {
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
            setSuccessMessage('User deleted successfully!');
            fetchUsers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to delete user');
        }
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = filterRole === 'all' || user.role === filterRole;
        return matchSearch && matchRole;
    });

    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'sponsor': return 'bg-green-100 text-green-800';
            case 'student': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Hero Section */}
            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-2" style={{ color: "#E8A63A" }}>
                                <span className="text-sm font-semibold tracking-widest">● USER MANAGEMENT</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">Manage All Users</h1>
                            <p className="text-gray-300">Add, edit, and delete user accounts</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowAddModal(true);
                                setFormData({ username: '', email: '', password: '', fullName: '', role: 'student' });
                            }}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition hover:shadow-lg"
                            style={{ backgroundColor: "#E8A63A" }}
                        >
                            <FaPlus size={18} />
                            Add New User
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {successMessage && (
                <div className="mx-8 mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                    <FaCheck size={18} />
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="mx-8 mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                    <FaTimes size={18} />
                    {errorMessage}
                </div>
            )}

            {/* Content */}
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Filters */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                            <input
                                type="text"
                                placeholder="Search by name, email, or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0" 
                                style={{ focusRing: "#2c5f5d" }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                                style={{ focusRing: "#2c5f5d" }}
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Students</option>
                                <option value="sponsor">Sponsors</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">
                                <p>Loading users...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <p>No users found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.fullName || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">@{user.username}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {user.isOnline ? 'Online' : 'Offline'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <div className="flex gap-3 justify-center">
                                                        <button
                                                            onClick={() => handleEditClick(user)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit user"
                                                        >
                                                            <FaEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id, user.fullName || user.username)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete user"
                                                        >
                                                            <FaTrash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Info */}
                        {filteredUsers.length > 0 && (
                            <div className="px-6 py-4 text-sm text-gray-600 border-t border-gray-200">
                                Showing {filteredUsers.length} of {users.length} users
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                                    placeholder="johndoe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                                >
                                    <option value="student">Student</option>
                                    <option value="sponsor">Sponsor</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-white font-medium rounded-lg transition"
                                    style={{ backgroundColor: "#2c5f5d" }}
                                >
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                                    placeholder="johndoe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                                >
                                    <option value="student">Student</option>
                                    <option value="sponsor">Sponsor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-white font-medium rounded-lg transition"
                                    style={{ backgroundColor: "#2c5f5d" }}
                                >
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
