import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSave } from "react-icons/fa";

const ManageUsers = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        fullName: "",
        password: "",
        role: "student"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/auth/users');
            setUsers(res.data);
            filterUsers(res.data, searchTerm, roleFilter);
        } catch (err) {
            setError("Failed to fetch users");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = (userList, search, role) => {
        let filtered = userList;

        if (search) {
            filtered = filtered.filter(u =>
                u.username.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase()) ||
                u.fullName.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (role !== "all") {
            filtered = filtered.filter(u => u.role === role);
        }

        setFilteredUsers(filtered);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        filterUsers(users, value, roleFilter);
    };

    const handleRoleFilter = (e) => {
        const value = e.target.value;
        setRoleFilter(value);
        filterUsers(users, searchTerm, value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            username: "",
            email: "",
            fullName: "",
            password: "",
            role: "student"
        });
        setEditingUser(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (userToEdit) => {
        setEditingUser(userToEdit);
        setFormData({
            username: userToEdit.username,
            email: userToEdit.email,
            fullName: userToEdit.fullName,
            password: "",
            role: userToEdit.role
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            setError(null);
            setSuccess(null);

            if (!formData.username || !formData.email || !formData.fullName) {
                setError("Please fill all required fields");
                return;
            }

            if (editingUser) {
                // Update existing user
                const updateData = {
                    username: formData.username,
                    email: formData.email,
                    fullName: formData.fullName,
                    role: formData.role
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }

                await axios.put(
                    `http://localhost:5000/api/auth/update/${editingUser._id}`,
                    updateData
                );

                setSuccess("User updated successfully!");
            } else {
                // Create new user
                if (!formData.password) {
                    setError("Password is required for new users");
                    return;
                }

                await axios.post('http://localhost:5000/api/auth/register', formData);
                setSuccess("User created successfully!");
            }

            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save user");
            console.error(err);
        }
    };

    const handleDelete = async (userId) => {
        try {
            setError(null);
            await axios.delete(`http://localhost:5000/api/auth/${userId}`);
            setSuccess("User deleted successfully!");
            setDeleteConfirm(null);
            fetchUsers();
        } catch (err) {
            setError("Failed to delete user");
            console.error(err);
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
                                <span className="text-sm font-semibold tracking-widest">● USER MANAGEMENT</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">Manage Users</h1>
                            <p className="text-gray-300">Add, edit, and delete user accounts</p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg text-white hover:opacity-90 transition font-semibold"
                            style={{ backgroundColor: "#E8A63A" }}
                        >
                            <FaPlus size={18} />
                            Add User
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Messages */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                                    <FaSearch size={16} style={{ color: "#999" }} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or username..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="flex-1 outline-none bg-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Role Filter</label>
                                <select
                                    value={roleFilter}
                                    onChange={handleRoleFilter}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{ '--tw-ring-color': '#E8A63A' }}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="student">Student</option>
                                    <option value="sponsor">Sponsor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading users...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No users found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead style={{ backgroundColor: "#f9f9f9" }}>
                                        <tr className="border-b border-gray-200">
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u) => (
                                            <tr key={u._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{u.fullName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{u.username}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        u.role === 'student' ? 'bg-blue-100 text-blue-800' :
                                                        u.role === 'sponsor' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        u.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {u.isOnline ? 'Online' : 'Offline'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(u)}
                                                            className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"
                                                            title="Edit user"
                                                        >
                                                            <FaEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(u._id)}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
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
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-96 max-h-96 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                    style={{ '--tw-ring-color': '#E8A63A' }}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                    style={{ '--tw-ring-color': '#E8A63A' }}
                                    placeholder="johndoe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                    style={{ '--tw-ring-color': '#E8A63A' }}
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Password {editingUser && '(leave blank to keep current)'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                    style={{ '--tw-ring-color': '#E8A63A' }}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                                    style={{ '--tw-ring-color': '#E8A63A' }}
                                >
                                    <option value="student">Student</option>
                                    <option value="sponsor">Sponsor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                            >
                                <FaSave size={16} />
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-80">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
