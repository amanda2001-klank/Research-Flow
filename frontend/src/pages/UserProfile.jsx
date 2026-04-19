import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { FiArrowLeft, FiEdit2, FiSave, FiX, FiUpload, FiBell } from "react-icons/fi";

const UserProfile = () => {
    const { user, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [savingPreferences, setSavingPreferences] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        fullName: "",
        avatar: "",
        role: "",
    });

    const [notificationPreferences, setNotificationPreferences] = useState({
        email: true,
        push: true,
        sms: false,
        deadlineAlerts: {
            enabled: true,
            oneWeekBefore: true,
            threeDaysBefore: true,
            oneDayBefore: true,
            sameDayAlert: true,
            escalationAlert: true
        },
        weeklyDigest: true,
        weeklyDigestDay: 'Monday',
        immediateNotifications: true,
        quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00'
        }
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                fullName: user.fullName || "",
                avatar: user.avatar || "",
                role: user.role || "student",
            });
            
            // Load notification preferences with defaults merged
            if (user.notificationPreferences) {
                setNotificationPreferences(prev => ({
                    ...prev,
                    ...user.notificationPreferences,
                    deadlineAlerts: {
                        ...prev.deadlineAlerts,
                        ...(user.notificationPreferences.deadlineAlerts || {})
                    },
                    quietHours: {
                        ...prev.quietHours,
                        ...(user.notificationPreferences.quietHours || {})
                    }
                }));
            }
        } else {
            navigate("/login");
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setError('Please select a valid image file (PNG, JPEG, JPG, GIF, or WebP)');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            setSelectedFile(file);
            setError(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadAvatar = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        try {
            setUploadingAvatar(true);
            setError(null);
            setSuccess(null);

            const formDataForUpload = new FormData();
            formDataForUpload.append('avatar', selectedFile);

            const response = await axios.post(
                `http://localhost:5000/api/auth/upload-avatar/${user._id}`,
                formDataForUpload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setFormData(prev => ({
                ...prev,
                avatar: response.data.avatarUrl || response.data.avatar
            }));

            dispatch({ type: "LOGIN_SUCCESS", payload: response.data });

            setSelectedFile(null);
            setPreviewUrl(null);
            setSuccess('Avatar uploaded successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to upload avatar');
            console.error("Upload error:", err);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError(null);
        setSuccess(null);
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                fullName: user.fullName || "",
                avatar: user.avatar || "",
                role: user.role || "student",
            });
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await axios.put(
                `http://localhost:5000/api/auth/update/${user._id}`,
                formData
            );

            dispatch({ type: "LOGIN_SUCCESS", payload: response.data });

            setIsEditing(false);
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data || "Failed to update profile");
            console.error("Update error:", err);
        } finally {
            setLoading(false);
        }
    };

    const saveNotificationPreferences = async () => {
        try {
            setSavingPreferences(true);
            setError(null);
            setSuccess(null);

            const response = await axios.put(
                `http://localhost:5000/api/auth/notification-preferences/${user._id}`,
                { notificationPreferences }
            );

            dispatch({ type: "LOGIN_SUCCESS", payload: response.data });

            setSuccess("Notification preferences saved successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save preferences");
            console.error("Preferences error:", err);
        } finally {
            setSavingPreferences(false);
        }
    };

    const handleNotificationToggle = (path, value) => {
        setNotificationPreferences(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let current = updated;
            
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            
            return updated;
        });
    };

    if (!user) {
        return <div className="text-center py-10">Loading...</div>;
    }

    const getRoleColor = (role) => {
        const colors = {
            student: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
            sponsor: { bg: "bg-green-50", border: "border-green-400", text: "text-green-700", badge: "bg-green-100 text-green-800" },
            admin: { bg: "bg-red-50", border: "border-red-400", text: "text-red-700", badge: "bg-red-100 text-red-800" }
        };
        return colors[role] || colors.student;
    };

    const getRoleLabel = (role) => {
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const roleColors = getRoleColor(formData.role);

    return (
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Hero Section */}
            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-2" style={{ color: "#E8A63A" }}>
                                <span className="text-sm font-semibold tracking-widest">● USER PROFILE</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">{formData.fullName || "User Profile"}</h1>
                            <p className="text-gray-300">Manage your account information and preferences</p>
                        </div>
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition font-medium"
                        >
                            <FiArrowLeft size={20} />
                            Back
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-3 font-semibold transition ${
                                activeTab === 'profile'
                                    ? 'border-b-2 text-white'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                            style={activeTab === 'profile' ? { borderColor: "#E8A63A", color: "#2c5f5d" } : {}}
                        >
                            Profile Information
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
                                activeTab === 'notifications'
                                    ? 'border-b-2 text-white'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                            style={activeTab === 'notifications' ? { borderColor: "#E8A63A", color: "#2c5f5d" } : {}}
                        >
                            <FiBell size={18} />
                            Notification Settings
                        </button>
                    </div>

                    {/* Error & Success Messages */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {typeof error === 'string' ? error : JSON.stringify(error)}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex items-start gap-8 mb-8">
                                {/* Avatar Section */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4" style={{ borderColor: "#E8A63A" }}>
                                        <img
                                            src={previewUrl || (formData.avatar ? `http://localhost:5000${formData.avatar}` : `https://ui-avatars.com/api/?name=${formData.fullName || 'User'}&background=#E8A63A&color=fff&size=128`)}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {isEditing && (
                                        <div className="flex gap-2">
                                            <label className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition" style={{ backgroundColor: "#E8A63A", color: "white" }}>
                                                <FiUpload size={18} />
                                                Upload
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                />
                                            </label>
                                            {selectedFile && (
                                                <button
                                                    onClick={handleUploadAvatar}
                                                    disabled={uploadingAvatar}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
                                                >
                                                    {uploadingAvatar ? 'Uploading...' : 'Save'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Role Badge */}
                                <div className="flex-1">
                                    <div className={`inline-block px-4 py-2 rounded-lg font-bold mb-4 ${roleColors.badge}`}>
                                        {getRoleLabel(formData.role)}
                                    </div>
                                    <p className="text-gray-500 text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-50"
                                            style={{ '--tw-ring-color': '#E8A63A' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-50"
                                            style={{ '--tw-ring-color': '#E8A63A' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-50"
                                        style={{ '--tw-ring-color': '#E8A63A' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                    <input
                                        type="text"
                                        value={getRoleLabel(formData.role)}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 mt-8">
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white hover:opacity-90 transition"
                                        style={{ backgroundColor: "#2c5f5d" }}
                                    >
                                        <FiEdit2 size={18} />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition"
                                        >
                                            <FiSave size={18} />
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                                        >
                                            <FiX size={18} />
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                            <div className="space-y-8">
                                {/* Notification Channels */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Notification Channels</h3>
                                    <div className="space-y-3">
                                        {['email', 'push', 'sms'].map((channel) => (
                                            <label key={channel} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationPreferences[channel]}
                                                    onChange={(e) => handleNotificationToggle(channel, e.target.checked)}
                                                    className="w-5 h-5 rounded cursor-pointer"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-900 capitalize">{channel} Notifications</p>
                                                    <p className="text-sm text-gray-600">
                                                        {channel === 'email' && 'Receive notifications via email'}
                                                        {channel === 'push' && 'Receive push notifications in your browser'}
                                                        {channel === 'sms' && 'Receive text messages for urgent alerts'}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Deadline Alerts */}
                                <div className="border-t pt-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Deadline Alerts</h3>
                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer mb-4">
                                        <input
                                            type="checkbox"
                                            checked={notificationPreferences.deadlineAlerts.enabled}
                                            onChange={(e) => handleNotificationToggle('deadlineAlerts.enabled', e.target.checked)}
                                            className="w-5 h-5 rounded cursor-pointer"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">Enable Deadline Alerts</p>
                                            <p className="text-sm text-gray-600">Get notified about upcoming deadlines</p>
                                        </div>
                                    </label>

                                    {notificationPreferences.deadlineAlerts.enabled && (
                                        <div className="ml-4 space-y-3 pb-4 border-l-2 pl-4" style={{ borderColor: "#E8A63A" }}>
                                            {[
                                                { key: 'oneWeekBefore', label: '1 Week Before', desc: 'Notify me 7 days before deadline', bg: 'bg-blue-50' },
                                                { key: 'threeDaysBefore', label: '3 Days Before', desc: 'Notify me 3 days before deadline', bg: 'bg-amber-50' },
                                                { key: 'oneDayBefore', label: '1 Day Before', desc: 'Notify me 1 day before deadline', bg: 'bg-orange-50' },
                                                { key: 'sameDayAlert', label: 'Same Day Alert', desc: 'Notify me on the day of deadline', bg: 'bg-red-50' },
                                                { key: 'escalationAlert', label: 'Escalation Alert', desc: 'Notify me when deadline is missed', bg: 'bg-red-100' }
                                            ].map((alert) => (
                                                <label key={alert.key} className={`flex items-center gap-3 p-3 ${alert.bg} rounded-lg cursor-pointer`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationPreferences.deadlineAlerts[alert.key]}
                                                        onChange={(e) => handleNotificationToggle(`deadlineAlerts.${alert.key}`, e.target.checked)}
                                                        className="w-4 h-4 rounded cursor-pointer"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{alert.label}</p>
                                                        <p className="text-xs text-gray-600">{alert.desc}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Weekly Digest */}
                                <div className="border-t pt-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Digest</h3>
                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer mb-4">
                                        <input
                                            type="checkbox"
                                            checked={notificationPreferences.weeklyDigest}
                                            onChange={(e) => handleNotificationToggle('weeklyDigest', e.target.checked)}
                                            className="w-5 h-5 rounded cursor-pointer"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">Enable Weekly Digest</p>
                                            <p className="text-sm text-gray-600">Get a summary of your week every {notificationPreferences.weeklyDigestDay}</p>
                                        </div>
                                    </label>

                                    {notificationPreferences.weeklyDigest && (
                                        <div className="ml-4">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Day</label>
                                            <select
                                                value={notificationPreferences.weeklyDigestDay}
                                                onChange={(e) => handleNotificationToggle('weeklyDigestDay', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                                style={{ '--tw-ring-color': '#E8A63A' }}
                                            >
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                    <option key={day} value={day}>{day}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Quiet Hours */}
                                <div className="border-t pt-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Quiet Hours</h3>
                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer mb-4">
                                        <input
                                            type="checkbox"
                                            checked={notificationPreferences.quietHours.enabled}
                                            onChange={(e) => handleNotificationToggle('quietHours.enabled', e.target.checked)}
                                            className="w-5 h-5 rounded cursor-pointer"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">Enable Quiet Hours</p>
                                            <p className="text-sm text-gray-600">Pause notifications during specific times</p>
                                        </div>
                                    </label>

                                    {notificationPreferences.quietHours.enabled && (
                                        <div className="ml-4 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                                                <input
                                                    type="time"
                                                    value={notificationPreferences.quietHours.startTime}
                                                    onChange={(e) => handleNotificationToggle('quietHours.startTime', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                                    style={{ '--tw-ring-color': '#E8A63A' }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                                                <input
                                                    type="time"
                                                    value={notificationPreferences.quietHours.endTime}
                                                    onChange={(e) => handleNotificationToggle('quietHours.endTime', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                                    style={{ '--tw-ring-color': '#E8A63A' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={saveNotificationPreferences}
                                    disabled={savingPreferences}
                                    className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
                                    style={{ backgroundColor: "#2c5f5d" }}
                                >
                                    <FiSave size={18} />
                                    {savingPreferences ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
