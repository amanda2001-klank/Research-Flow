import { useState, useEffect, useContext } from "react";
import { FaUserGraduate, FaCheck, FaTimes, FaUsers, FaExclamationTriangle, FaBell } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

// Mock data: Start empty in real world, but keeping a few for visual context in the demo
const INITIAL_REQUESTS = [
    { id: 201, studentId: "mock1", groupId: "GRP-42", membersList: "IT21000001, IT21000002, IT21000003, IT21000004", topic: "Optimizing Deep Learning via Custom Hardware", domain: "Artificial Intelligence", reason: "We are deeply interested in your work on Deep Learning.", date: "2 Hours ago" },
];

const SupervisorAllocation = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    
    // Use localStorage to simulate a database for the demo so requests aren't lost on reload
    const [requests, setRequests] = useState(() => {
        const saved = localStorage.getItem(`supervisorRequests_${user?._id}`);
        return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
    });
    
    const [acceptedGroups, setAcceptedGroups] = useState(() => {
        const saved = localStorage.getItem(`acceptedGroups_${user?._id}`);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        if (user?._id) {
            localStorage.setItem(`supervisorRequests_${user._id}`, JSON.stringify(requests));
            localStorage.setItem(`acceptedGroups_${user._id}`, JSON.stringify(acceptedGroups));
        }
    }, [requests, acceptedGroups, user?._id]);

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
                    setToastMessage({ type: "success", text: `New request received for topic: ${data.requestData.topic.substring(0,20)}...` });
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

        // Notify student back
        if (socket && request.studentId) {
            socket.emit("send_message", {
                room: request.studentId,
                type: "REQUEST_ACCEPTED",
                sponsorName: user?.fullName || user?.username,
                sponsorId: user?._id
            });
        }
    };

    const handleReject = (request) => {
        // Remove from requests list
        setRequests(requests.filter(r => r.id !== request.id));
        
        // Notify student back
        if (socket && request.studentId) {
            socket.emit("send_message", {
                room: request.studentId,
                type: "REQUEST_REJECTED",
                sponsorName: user?.fullName || user?.username,
                sponsorId: user?._id
            });
        }

        setToastMessage({ type: "error", text: `Group ${request.groupId} has been rejected. The students have been notified in real-time.` });
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

            <div className="max-w-6xl mx-auto">
                {/* Header Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Student Group Requests</h1>
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
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                                    isFull 
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
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md">
                                                    {group.groupId}
                                                </span>
                                                <h4 className="font-bold text-gray-800">{group.domain}</h4>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-xs">{group.Members}</p>
                                        </div>
                                        <div className="text-green-500 bg-green-50 p-2 rounded-full">
                                            <FaCheck />
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
