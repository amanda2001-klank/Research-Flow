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
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'notifications'
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
                            <h1 className="text-4xl font-bold text-white mb-2">{user?.fullName || user?.username}</h1>
                            <p className="text-gray-300">Manage your profile information and settings</p>
                        </div>
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2 text-white hover:text-gray-200 transition"
                        >
                            <FiArrowLeft size={20} />
                            <span>Back</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded">
                            {typeof error === 'string' ? error : "An error occurred"}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded">
                            {success}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Column - Avatar & Overview */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                                {/* Avatar */}
                                <div className="text-center mb-6">
                                    <div className="flex justify-center mb-4">
                                        <img
                                            src={
                                                previewUrl ? previewUrl :
                                                formData.avatar && formData.avatar.startsWith('/') 
                                                    ? `http://localhost:5000${formData.avatar}` 
                                                    : formData.avatar || `https://ui-avatars.com/api/?name=${formData.username}&size=128`
                                            }
                                            alt="User Avatar"
                                            className="w-32 h-32 rounded-full object-cover border-4"
                                            style={{ borderColor: "#E8A63A" }}
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${formData.username}&size=128`;
                                            }}
                                        />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{formData.fullName || formData.username}</h2>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${roleColors.badge}`}>
                                        {getRoleLabel(formData.role)}
                                    </span>
                                </div>

                                {/* Stats Cards */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span className="truncate">{formData.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Profile Details */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-md p-8">
                                {/* Tabs */}
                                <div className="flex gap-4 border-b border-gray-200 mb-8 pb-0">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`px-4 py-4 font-semibold border-b-2 transition ${
                                            activeTab === 'profile'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        Profile Information
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('notifications')}
                                        className={`px-4 py-4 font-semibold border-b-2 transition flex items-center gap-2 ${
                                            activeTab === 'notifications'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        <FiBell size={18} />
                                        Notification Settings
                                    </button>
                                </div>

                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Profile Information</h3>
                                        <p className="text-gray-500 mt-1">Manage your personal details</p>
                                    </div>
                                    <button
                                        onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition ${
                                            isEditing
                                                ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                                : "text-white"
                                        }`}
                                        style={!isEditing ? { backgroundColor: "#E8A63A" } : {}}
                                    >
                                        {isEditing ? (
                                            <>
                                                <FiX size={18} />
                                                <span>Cancel</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiEdit2 size={18} />
                                                <span>Edit Profile</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Avatar Upload Section */}
                                {isEditing && (
                                    <div className="mb-8 pb-8 border-b border-gray-200">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <FiUpload size={20} style={{ color: "#E8A63A" }} />
                                            Upload Profile Picture
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                            <div className="flex gap-4 items-start">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="flex-1 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4 file:rounded-lg
                                        file:border-0 file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100 file:cursor-pointer"
                                                />
                                                <button
                                                    onClick={handleUploadAvatar}
                                                    disabled={!selectedFile || uploadingAvatar}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition whitespace-nowrap font-semibold"
                                                >
                                                    {uploadingAvatar ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            <span>Uploading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiUpload size={18} />
                                                            <span>Upload</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-3">
                                                Max file size: 5MB. Formats: PNG, JPEG, JPG, GIF, WebP
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Form Fields */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Full Name */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                                Full Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition"
                                                    style={{ focusRing: "#E8A63A" }}
                                                    placeholder="Enter your full name"
                                                />
                                            ) : (
                                                <p className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                                                    {formData.fullName || "Not provided"}
                                                </p>
                                            )}
                                        </div>

                                        {/* Username */}
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                                Username
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition"
                                                    style={{ focusRing: "#E8A63A" }}
                                                    placeholder="Enter username"
                                                />
                                            ) : (
                                                <p className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                                                    @{formData.username}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition"
                                                style={{ focusRing: "#E8A63A" }}
                                                placeholder="Enter email"
                                            />
                                        ) : (
                                            <p className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                                                {formData.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                            Account Role
                                        </label>
                                        <div>
                                            <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${roleColors.badge}`}>
                                                {getRoleLabel(formData.role)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* User ID */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">User ID</label>
                                        <p className="text-sm text-gray-500 font-mono bg-gray-50 px-4 py-2 rounded-lg">
                                            {user._id}
                                        </p>
                                    </div>

                                    {/* Member Since */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Member Since</label>
                                        <p className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Save Button */}
                                {isEditing && (
                                    <div className="mt-8 pt-8 border-t border-gray-200 flex gap-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="flex-1 flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                                            style={{ backgroundColor: "#27a745" }}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiSave size={18} />
                                                    <span>Save Changes</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                                    </>
                                )}

                                {/* Notifications Tab */}
                                {activeTab === 'notifications' && (
                                    <>
                                        <div className="space-y-8">
                                            {/* Notification Channels */}
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">Notification Channels</h3>
                                                <div className="space-y-4">
                                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationPreferences.email}
                                                            onChange={(e) => handleNotificationToggle('email', e.target.checked)}
                                                            className="w-5 h-5 rounded cursor-pointer"
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">Email Notifications</p>
                                                            <p className="text-sm text-gray-600">Receive updates via email</p>
                                                        </div>
                                                    </label>

                                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationPreferences.push}
                                                            onChange={(e) => handleNotificationToggle('push', e.target.checked)}
                                                            className="w-5 h-5 rounded cursor-pointer"
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">Push Notifications</p>
                                                            <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                                                        </div>
                                                    </label>

                                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationPreferences.sms}
                                                            onChange={(e) => handleNotificationToggle('sms', e.target.checked)}
                                                            className="w-5 h-5 rounded cursor-pointer"
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">SMS Notifications</p>
                                                            <p className="text-sm text-gray-600">Receive text messages for urgent alerts</p>
                                                        </div>
                                                    </label>
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
                                                        <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={notificationPreferences.deadlineAlerts.oneWeekBefore}
                                                                onChange={(e) => handleNotificationToggle('deadlineAlerts.oneWeekBefore', e.target.checked)}
                                                                className="w-4 h-4 rounded cursor-pointer"
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-gray-900">1 Week Before</p>
                                                                <p className="text-xs text-gray-600">Notify me 7 days before deadline</p>
                                                            </div>
                                                        </label>

                                                        <label className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={notificationPreferences.deadlineAlerts.threeDaysBefore}
                                                                onChange={(e) => handleNotificationToggle('deadlineAlerts.threeDaysBefore', e.target.checked)}
                                                                className="w-4 h-4 rounded cursor-pointer"
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-gray-900">3 Days Before</p>
                                                                <p className="text-xs text-gray-600">Notify me 3 days before deadline</p>
                                                            </div>
                                                        </label>

                                                        <label className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={notificationPreferences.deadlineAlerts.oneDayBefore}
                                                                onChange={(e) => handleNotificationToggle('deadlineAlerts.oneDayBefore', e.target.checked)}
                                                                className="w-4 h-4 rounded cursor-pointer"
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-gray-900">1 Day Before</p>
                                                                <p className="text-xs text-gray-600">Notify me 1 day before deadline</p>
                                                            </div>
                                                        </label>

                                                        <label className="flex items-center gap-3 p-3 bg-red-50 rounded-lg cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={notificationPreferences.deadlineAlerts.sameDayAlert}
                                                                onChange={(e) => handleNotificationToggle('deadlineAlerts.sameDayAlert', e.target.checked)}
                                                                className="w-4 h-4 rounded cursor-pointer"
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Same Day Alert</p>
                                                                <p className="text-xs text-gray-600">Notify me on the day of deadline</p>
                                                            </div>
                                                        </label>

                                                        <label className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg cursor-pointer border-2 border-rose-300">
                                                            <input
                                                                type="checkbox"
                                                                checked={notificationPreferences.deadlineAlerts.escalationAlert}
                                                                onChange={(e) => handleNotificationToggle('deadlineAlerts.escalationAlert', e.target.checked)}
                                                                className="w-4 h-4 rounded cursor-pointer"
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-rose-900">Escalation Alert</p>
                                                                <p className="text-xs text-rose-700">Urgent notification if deadline is missed</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Weekly Digest */}
                                            <div className="border-t pt-8">
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Summary</h3>
                                                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer mb-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationPreferences.weeklyDigest}
                                                        onChange={(e) => handleNotificationToggle('weeklyDigest', e.target.checked)}
                                                        className="w-5 h-5 rounded cursor-pointer"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Weekly Digest</p>
                                                        <p className="text-sm text-gray-600">Get a summary of activity each week</p>
                                                    </div>
                                                </label>

                                                {notificationPreferences.weeklyDigest && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Day</label>
                                                        <select
                                                            value={notificationPreferences.weeklyDigestDay}
                                                            onChange={(e) => handleNotificationToggle('weeklyDigestDay', e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                                                            style={{ focusRing: "#2c5f5d" }}
                                                        >
                                                            <option value="Monday">Monday</option>
                                                            <option value="Tuesday">Tuesday</option>
                                                            <option value="Wednesday">Wednesday</option>
                                                            <option value="Thursday">Thursday</option>
                                                            <option value="Friday">Friday</option>
                                                            <option value="Saturday">Saturday</option>
                                                            <option value="Sunday">Sunday</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quiet Hours */}
                                            <div className="border-t pt-8">
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">Quiet Hours</h3>
                                                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationPreferences.quietHours.enabled}
                                                        onChange={(e) => handleNotificationToggle('quietHours.enabled', e.target.checked)}
                                                        className="w-5 h-5 rounded cursor-pointer"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Enable Quiet Hours</p>
                                                        <p className="text-sm text-gray-600">Don't notify me during specific times</p>
                                                    </div>
                                                </label>

                                                {notificationPreferences.quietHours.enabled && (
                                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                                            <input
                                                                type="time"
                                                                value={notificationPreferences.quietHours.startTime}
                                                                onChange={(e) => handleNotificationToggle('quietHours.startTime', e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                                            <input
                                                                type="time"
                                                                value={notificationPreferences.quietHours.endTime}
                                                                onChange={(e) => handleNotificationToggle('quietHours.endTime', e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Save Button */}
                                            <div className="border-t pt-8">
                                                <button
                                                    onClick={saveNotificationPreferences}
                                                    disabled={savingPreferences}
                                                    className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                                                    style={{ backgroundColor: "#2c5f5d" }}
                                                >
                                                    {savingPreferences ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            <span>Saving...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiSave size={18} />
                                                            <span>Save Notification Settings</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
