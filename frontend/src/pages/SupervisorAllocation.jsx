import { useState, useEffect, useContext } from "react";
import { FaUserGraduate, FaCheck, FaTimes, FaUsers, FaExclamationTriangle, FaBell, FaSignOutAlt, FaHome, FaUserEdit, FaSave } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import axios from "axios";

// Mock data: Start empty in real world, but keeping a few for visual context in the demo
const INITIAL_REQUESTS = [
    { id: 201, studentId: "mock1", groupId: "GRP-42", membersList: "IT21000001, IT21000002, IT21000003, IT21000004", topic: "Optimizing Deep Learning via Custom Hardware", domain: "Artificial Intelligence", reason: "We are deeply interested in your work on Deep Learning.", date: "2 Hours ago" },
];

const SupervisorAllocation = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);

    const [requests, setRequests] = useState([]);
    const [acceptedGroups, setAcceptedGroups] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Initial load when user becomes available
    useEffect(() => {
        if (user?._id && !dataLoaded) {
            const savedReqs = localStorage.getItem(`supervisorRequests_${user._id}`);
            if (savedReqs) setRequests(JSON.parse(savedReqs));
            else setRequests(INITIAL_REQUESTS);

            const savedGroups = localStorage.getItem(`acceptedGroups_${user._id}`);
            if (savedGroups) setAcceptedGroups(JSON.parse(savedGroups));

            setDataLoaded(true);
        }
    }, [user, dataLoaded]);

    // Save changes to offline storage
    useEffect(() => {
        if (user?._id && dataLoaded) {
            localStorage.setItem(`supervisorRequests_${user._id}`, JSON.stringify(requests));
            localStorage.setItem(`acceptedGroups_${user._id}`, JSON.stringify(acceptedGroups));
        }
    }, [requests, acceptedGroups, user, dataLoaded]);

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileData, setProfileData] = useState({
        avatar: user?.avatar || "",
        expertise: user?.expertise || "",
        experienceYears: user?.experienceYears || "",
        skills: user?.skills || "",
        interests: user?.interests || ""
    });
    const [profileErrors, setProfileErrors] = useState({});

    useEffect(() => {
        if (user) {
            setProfileData({
                avatar: user.avatar || "",
                expertise: user.expertise || "",
                experienceYears: user.experienceYears || "",
                skills: user.skills || "",
                interests: user.interests || ""
            });
        }
    }, [user]);

    const validateProfile = () => {
        const errors = {};
        if (!String(profileData.expertise).trim()) errors.expertise = "Expertise is required";
        if (!profileData.experienceYears || isNaN(profileData.experienceYears) || Number(profileData.experienceYears) < 0) {
            errors.experienceYears = "Enter valid years of experience";
        }
        if (!String(profileData.skills).trim()) errors.skills = "Skills are required";
        if (!String(profileData.interests).trim()) errors.interests = "Interests are required";
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!validateProfile()) return;

        try {
            await axios.put(`http://localhost:5000/api/auth/${user._id}`, {
                avatar: profileData.avatar,
                expertise: profileData.expertise,
                experienceYears: Number(profileData.experienceYears),
                skills: profileData.skills,
                interests: profileData.interests
            });
            setToastMessage({ type: "success", text: "Matching profile updated successfully!" });
            setIsProfileModalOpen(false);
        } catch (err) {
            console.error("Failed to update profile", err);
            setToastMessage({ type: "error", text: "Failed to update profile." });
        }
    };

    const [toastMessage, setToastMessage] = useState(null);
    const MAX_GROUPS = 2; // Limit limit to 2 groups per supervisor

    const isFull = acceptedGroups.length >= MAX_GROUPS;

    // Auto-hide toast after 4s
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // Socket listener for incoming student requests
    useEffect(() => {
        if (socket) {
            const handleMessage = (data) => {
                if (data.type === "NEW_REQUEST") {
                    setRequests(prev => [...prev, data.requestData]);
                    setToastMessage({ type: "success", text: `New request received for topic: ${data.requestData.topic.substring(0, 20)}...` });
                } else if (data.type === "CANCEL_REQUEST") {
                    setRequests(prev => prev.filter(r => r.id !== data.requestId));
                }
            };

            socket.on("receive_message", handleMessage);
            return () => socket.off("receive_message", handleMessage);
        }
    }, [socket]);

    const handleAccept = (request) => {
        if (isFull) return; // Prevent if theoretically trying to bypass

        setAcceptedGroups([...acceptedGroups, request]);
        setRequests(requests.filter(r => r.id !== request.id));
        setToastMessage({ type: "success", text: `You have successfully accepted ${request.groupId}.` });

        // Notify student back (if online)
        if (socket && request.studentId) {
            socket.emit("send_message", {
                room: request.studentId,
                type: "REQUEST_ACCEPTED",
                sponsorName: user?.fullName || user?.username,
                sponsorId: user?._id
            });
        }

        if (request.studentId && user?._id) {
            const studentKey = `myRequests_${request.studentId}`;
            const studentRequests = JSON.parse(localStorage.getItem(studentKey) || "[]");
            const updated = studentRequests.map(r => r.sponsorId === user._id ? { ...r, status: "Accepted" } : r);
            localStorage.setItem(studentKey, JSON.stringify(updated));
        }
    };

    const handleReject = (request) => {
        // Remove from requests list
        setRequests(requests.filter(r => r.id !== request.id));

        // Notify student back (if online)
        if (socket && request.studentId) {
            socket.emit("send_message", {
                room: request.studentId,
                type: "REQUEST_REJECTED",
                sponsorName: user?.fullName || user?.username,
                sponsorId: user?._id
            });
        }

        if (request.studentId && user?._id) {
            const studentKey = `myRequests_${request.studentId}`;
            const studentRequests = JSON.parse(localStorage.getItem(studentKey) || "[]");
            const updated = studentRequests.map(r => r.sponsorId === user._id ? { ...r, status: "Rejected" } : r);
            localStorage.setItem(studentKey, JSON.stringify(updated));
        }

        setToastMessage({ type: "error", text: `Group ${request.groupId} has been rejected.` });
    };

    const handleRemoveGroup = (group) => {
        // Remove from local state
        setAcceptedGroups(prev => prev.filter(g => g.id !== group.id));

        // Notify student back (if online)
        if (socket && group.studentId) {
            socket.emit("send_message", {
                room: group.studentId,
                type: "GROUP_REMOVED",
                sponsorName: user?.fullName || user?.username,
                sponsorId: user?._id,
                groupId: group.groupId
            });
        }

        if (group.studentId && user?._id) {
            const studentKey = `myRequests_${group.studentId}`;
            const studentRequests = JSON.parse(localStorage.getItem(studentKey) || "[]");
            // Change status to Rejected so they know the supervision was terminated
            const updated = studentRequests.map(r => r.sponsorId === user._id ? { ...r, status: "Rejected" } : r);
            localStorage.setItem(studentKey, JSON.stringify(updated));
        }

        setToastMessage({ type: "success", text: `Group ${group.groupId} has been removed from your supervision.` });
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50 font-sans relative">
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`fixed top-8 right-8 p-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 transition-all animate-bounce-in max-w-sm ${toastMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                    <FaBell className="text-xl shrink-0" />
                    <p className="font-medium text-sm leading-tight">{toastMessage.text}</p>
                </div>
            )}

            {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: "#2c5f5d" }}>
                            <div>
                                <h3 className="text-2xl font-bold">Matching Profile</h3>
                                <p className="text-gray-200 text-sm">Update your expertise so groups can find you</p>
                            </div>
                            <button onClick={() => setIsProfileModalOpen(false)} className="text-white hover:text-gray-200 transition-colors p-2 text-xl">&times;</button>
                        </div>
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <form id="profileForm" onSubmit={handleProfileSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Profile Picture URL</label>
                                    <input 
                                        type="url" 
                                        placeholder="e.g. https://i.pravatar.cc/150" 
                                        value={profileData.avatar}
                                        onChange={(e) => setProfileData({...profileData, avatar: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Primary Expertise</label>
                                    <select 
                                        value={profileData.expertise}
                                        onChange={(e) => setProfileData({...profileData, expertise: e.target.value})}
                                        className={`w-full px-4 py-3 rounded-xl border ${profileErrors.expertise ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 bg-white`}
                                    >
                                        <option value="" disabled>Select Expertise Domain</option>
                                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                                        <option value="Cyber Security">Cyber Security</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="Software Engineering">Software Engineering</option>
                                        <option value="Cloud Computing">Cloud Computing</option>
                                        <option value="Information Systems">Information Systems</option>
                                    </select>
                                    {profileErrors.expertise && <p className="text-xs text-red-500 font-semibold mt-1">{profileErrors.expertise}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-bold text-gray-800 mb-2">Years of Experience</label>
                                        <select 
                                            value={profileData.experienceYears}
                                            onChange={(e) => setProfileData({...profileData, experienceYears: e.target.value})}
                                            className={`w-full px-4 py-3 rounded-xl border ${profileErrors.experienceYears ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 bg-white`}
                                        >
                                            <option value="" disabled>Select Years</option>
                                            {[...Array(19)].map((_, i) => (
                                                <option key={i+1} value={i+1}>{i+1} {i+1 === 1 ? 'Year' : 'Years'}</option>
                                            ))}
                                            <option value="20">20+ Years</option>
                                        </select>
                                        {profileErrors.experienceYears && <p className="text-xs text-red-500 font-semibold mt-1">{profileErrors.experienceYears}</p>}
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-bold text-gray-800 mb-2">Core Skills</label>
                                        <select 
                                            value={profileData.skills}
                                            onChange={(e) => setProfileData({...profileData, skills: e.target.value})}
                                            className={`w-full px-4 py-3 rounded-xl border ${profileErrors.skills ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 bg-white`}
                                        >
                                            <option value="" disabled>Select Core Skill</option>
                                            <option value="Machine Learning">Machine Learning</option>
                                            <option value="Natural Language Processing">Natural Language Processing</option>
                                            <option value="Network Security">Network Security</option>
                                            <option value="Big Data Analytics">Big Data Analytics</option>
                                            <option value="Agile Methodologies">Agile Methodologies</option>
                                            <option value="Web/Mobile Development">Web/Mobile Development</option>
                                            <option value="Blockchain Technology">Blockchain Technology</option>
                                        </select>
                                        {profileErrors.skills && <p className="text-xs text-red-500 font-semibold mt-1">{profileErrors.skills}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Research Interests</label>
                                    <select 
                                        value={profileData.interests}
                                        onChange={(e) => setProfileData({...profileData, interests: e.target.value})}
                                        className={`w-full px-4 py-3 rounded-xl border ${profileErrors.interests ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 bg-white`}
                                    >
                                        <option value="" disabled>Select Primary Interest</option>
                                        <option value="Quantitative Research">Quantitative Research</option>
                                        <option value="Qualitative Research">Qualitative Research</option>
                                        <option value="Mixed Methods">Mixed Methods</option>
                                        <option value="Applied / Systems Building">Applied / Systems Building</option>
                                        <option value="System Optimization">System Optimization</option>
                                        <option value="Security Analysis">Security Analysis</option>
                                    </select>
                                    {profileErrors.interests && <p className="text-xs text-red-500 font-semibold mt-1">{profileErrors.interests}</p>}
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsProfileModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button form="profileForm" type="submit" className="px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2" style={{ backgroundColor: "#2c5f5d" }}>
                                <FaSave /> Save Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-4">
                            Student Group Requests
                            <button 
                                onClick={() => setIsProfileModalOpen(true)}
                                className="text-sm bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
                                title="Edit Matching Profile"
                            >
                                <FaUserEdit size={20} />
                            </button>
                        </h1>
                        <p className="text-gray-500 mt-2">Manage incoming supervision requests from student groups.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><FaUsers className="text-xl" /></div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Requests</p>
                                <p className="text-2xl font-black text-gray-800">{requests.length}</p>
                            </div>
                        </div>
                        <div className={`bg-white p-4 rounded-2xl shadow-sm border ${isFull ? 'border-red-300 bg-red-50' : 'border-gray-100'} flex items-center gap-4 transition-colors`}>
                            <div className={`p-3 rounded-xl ${isFull ? 'bg-red-200 text-red-700' : 'bg-green-100 text-green-600'}`}>
                                <FaUserGraduate className="text-xl" />
                            </div>
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-wider ${isFull ? 'text-red-500' : 'text-gray-400'}`}>Groups Supervised</p>
                                <p className={`text-2xl font-black ${isFull ? 'text-red-700' : 'text-gray-800'}`}>
                                    {acceptedGroups.length} <span className="text-sm font-bold text-gray-400">/ {MAX_GROUPS}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {isFull && (
                    <div className="mb-8 p-4 bg-red-100 border border-red-200 rounded-2xl flex items-start gap-4 shadow-sm animate-pulse-slow">
                        <div className="p-2 bg-red-600 text-white rounded-lg">
                            <FaExclamationTriangle />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-800">Maximum Capacity Reached</h3>
                            <p className="text-sm text-red-600">You have reached the limit of {MAX_GROUPS} supervised groups. You can no longer accept new requests and must reject the remaining pending requests.</p>
                        </div>
                    </div>
                )}

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* Incoming Requests Column */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Pending Requests ({requests.length})</h2>
                        </div>

                        {requests.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-300 text-gray-400">
                                <FaUsers className="text-5xl mx-auto mb-4 text-gray-200" />
                                <h3 className="text-lg font-bold text-gray-600">No Pending Requests</h3>
                                <p className="text-sm">You have cleared all pending student requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {requests.map((request) => (
                                    <div key={request.id} className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all hover:shadow-md ${isFull ? 'border-red-100' : 'border-gray-100 hover:border-blue-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg mb-2">
                                                    {request.groupId}
                                                </span>
                                                <h3 className="text-lg font-bold text-gray-800">{request.domain}</h3>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-400">{request.date}</span>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4 transition-all hover:bg-blue-50/50 hover:border-blue-100">
                                            <div className="flex gap-2 mb-3">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div key={i} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm shrink-0">
                                                            S{i}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="ml-2 flex flex-col justify-center">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Group Members</span>
                                                    <p className="text-sm font-semibold text-gray-800 break-words">{request.membersList || request.Members}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Proposed Topic</span>
                                                <p className="text-sm text-gray-700 italic mt-1 bg-white p-3 rounded-lg border border-gray-200">
                                                    "{request.topic || request.reason}"
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                            <button
                                                onClick={() => handleAccept(request)}
                                                disabled={isFull}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${isFull
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-600 hover:text-white hover:shadow-lg'
                                                    }`}
                                            >
                                                <FaCheck /> {isFull ? 'Capacity Full' : 'Accept Request'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(request)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all hover:shadow-lg"
                                            >
                                                <FaTimes /> Reject & Notify
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Accepted Groups Column */}
                    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-fit">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FaCheck className="text-green-500" /> Your Supervised Groups
                        </h2>

                        <div className="space-y-4">
                            {acceptedGroups.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-6">You haven't accepted any groups yet.</p>
                            ) : (
                                acceptedGroups.map((group) => (
                                    <div key={group.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center transition-all hover:bg-white hover:shadow-sm">
                                        <div className="w-full mr-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md shrink-0">
                                                    {group.groupId}
                                                </span>
                                                <h4 className="font-bold text-gray-800 text-sm truncate">{group.domain}</h4>
                                            </div>
                                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                                Team: <span className="text-blue-600">{group.membersList || group.Members}</span>
                                            </p>
                                            <p className="text-sm text-gray-600 italic bg-white p-3 rounded-xl border border-gray-100 shadow-sm leading-relaxed">
                                                "{group.topic || group.reason}"
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-green-500 bg-green-50 p-2 rounded-full" title="Active Group">
                                                <FaCheck />
                                            </div>
                                            <button
                                                onClick={() => handleRemoveGroup(group)}
                                                className="text-red-400 bg-red-50 hover:bg-red-500 hover:text-white p-2 rounded-full transition-all"
                                                title="Remove Group"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.8) translateY(-20px); opacity: 0; }
                    50% { transform: scale(1.05) translateY(0); opacity: 1; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .animate-pulse-slow {
                    animation: pulse 3s infinite;
                }
            `}</style>
        </div>
    );
};

export default SupervisorAllocation;
