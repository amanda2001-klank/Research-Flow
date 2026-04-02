import { useState, useEffect, useContext } from "react";
import { FaSearch, FaUserTie, FaCheckCircle, FaLightbulb, FaFlask, FaBell } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import axios from "axios";

const StudentResearchForm = () => {
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    
    // Search form states
    const [domain, setDomain] = useState("");
    const [interests, setInterests] = useState("");
    const [methodology, setMethodology] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [matches, setMatches] = useState([]);
    
    // Request Modal States
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [formData, setFormData] = useState({ it1: "", it2: "", it3: "", it4: "", topic: "" });
    const [formErrors, setFormErrors] = useState({});
    
    // States for requests and toasts
    const [myRequests, setMyRequests] = useState(() => {
        const saved = localStorage.getItem(`myRequests_${user?._id}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [toastMessage, setToastMessage] = useState(null);

    // Persist to local storage whenever it changes
    useEffect(() => {
        if (user?._id) {
            localStorage.setItem(`myRequests_${user._id}`, JSON.stringify(myRequests));
        }
    }, [myRequests, user?._id]);

    // Auto-hide toast
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // Socket listener for request responses
    useEffect(() => {
        if (socket) {
            const handleMessage = (data) => {
                if (data.type === "REQUEST_ACCEPTED" || data.type === "REQUEST_REJECTED") {
                    // Update the real-time status of the request silently in the box
                    setMyRequests(prev => prev.map(req => 
                        req.sponsorId === data.sponsorId 
                        ? { ...req, status: data.type === "REQUEST_ACCEPTED" ? "Accepted" : "Rejected" } 
                        : req
                    ));
                }
            };

            socket.on("receive_message", handleMessage);
            return () => socket.off("receive_message", handleMessage);
        }
    }, [socket]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        try {
            // Fetch real sponsors from the database
            const res = await axios.get("http://localhost:5000/api/auth/users");
            const sponsors = res.data.filter(u => u.role === "sponsor");
            
            // Map to our UI data structure with some mock stats so the UI looks beautiful
            const mappedSponsors = sponsors.map((s, index) => ({
                id: s._id,
                name: s.fullName || s.username,
                expertise: [domain || "General Research", "Methodology"], // Using search term as mock expertise
                load: Math.floor(Math.random() * 3), // Mock load
                maxLoad: 2, 
                matchScore: Math.floor(Math.random() * 20) + 75 // Random high match score
            })).sort((a, b) => b.matchScore - a.matchScore);
            
            setMatches(mappedSponsors);
        } catch (err) {
            console.error(err);
            setToastMessage({ type: "error", text: "Failed to search for supervisors." });
        }
        setIsSearching(false);
    };

    const handleOpenModal = (supervisor) => {
        if (supervisor.load >= supervisor.maxLoad) {
            setToastMessage({ type: "error", text: `Cannot send request: ${supervisor.name} has reached maximum capacity.` });
            return;
        }
        setSelectedSupervisor(supervisor);
        setFormData({ it1: "", it2: "", it3: "", it4: "", topic: "" });
        setFormErrors({});
    };

    const validateForm = () => {
        const errors = {};
        const itRegex = /^IT\d{8}$/i; // E.g. IT23333333 (case insensitive)

        if (!itRegex.test(formData.it1)) errors.it1 = "Format must be ITXXXXXXXX (e.g., IT23333333)";
        if (!itRegex.test(formData.it2)) errors.it2 = "Format must be ITXXXXXXXX (e.g., IT23333333)";
        if (!itRegex.test(formData.it3)) errors.it3 = "Format must be ITXXXXXXXX (e.g., IT23333333)";
        if (!itRegex.test(formData.it4)) errors.it4 = "Format must be ITXXXXXXXX (e.g., IT23333333)";
        
        if (!formData.topic || formData.topic.trim().length < 5) {
            errors.topic = "Please provide a descriptive research topic (min 5 chars).";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitRequest = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        // Send real-time socket event!
        if (socket && selectedSupervisor) {
            socket.emit("send_message", {
                room: selectedSupervisor.id, // The sponsor's user._id room
                type: "NEW_REQUEST",
                requestData: {
                    id: Date.now(),
                    studentId: user._id,
                    groupId: `GRP-${formData.it1.substring(2,6).toUpperCase()}`,
                    membersList: [formData.it1.toUpperCase(), formData.it2.toUpperCase(), formData.it3.toUpperCase(), formData.it4.toUpperCase()].join(", "),
                    topic: formData.topic,
                    domain: domain || "General Research",
                    reason: interests ? `Interested in ${interests}` : "Research collaboration",
                    date: "Just Now"
                }
            });
            
            // Add to My Requests
            setMyRequests(prev => [{
                id: Date.now(),
                sponsorId: selectedSupervisor.id,
                sponsorName: selectedSupervisor.name,
                topic: formData.topic,
                status: "Pending",
                date: new Date().toLocaleTimeString()
            }, ...prev]);

            setToastMessage({ type: "success", text: `Your group request has been successfully sent to ${selectedSupervisor.name}. Status is now Pending.` });
            setSelectedSupervisor(null); // Close modal
        } else {
            setToastMessage({ type: "error", text: "Not connected to real-time server." });
        }
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto relative">
            {toastMessage && (
                <div className={`fixed top-8 right-8 p-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 transition-all animate-bounce-in max-w-sm ${toastMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                    <FaBell className="text-xl shrink-0" />
                    <p className="font-medium text-sm leading-tight">{toastMessage.text}</p>
                </div>
            )}
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

            {/* Request Modal */}
            {selectedSupervisor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-bold">Group Registration</h3>
                                <p className="text-blue-100 text-sm">Requesting Supervision from {selectedSupervisor.name}</p>
                            </div>
                            <button onClick={() => setSelectedSupervisor(null)} className="text-white hover:text-gray-200 transition-colors p-2 text-xl">&times;</button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <form id="groupForm" onSubmit={handleSubmitRequest} className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Group Members (IT Numbers)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map(num => (
                                            <div key={`it${num}`}>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Student {num} IT No.</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g. IT23333333" 
                                                    value={formData[`it${num}`]} 
                                                    onChange={e => setFormData({...formData, [`it${num}`]: e.target.value})}
                                                    className={`w-full px-4 py-3 rounded-xl border ${formErrors[`it${num}`] ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500'} focus:ring-2 transition-all outline-none bg-gray-50 uppercase`}
                                                />
                                                {formErrors[`it${num}`] && <p className="text-xs text-red-500 font-semibold mt-1">{formErrors[`it${num}`]}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Detailed Research Topic</label>
                                    <textarea 
                                        rows="3" 
                                        placeholder="Briefly describe your proposed research topic..." 
                                        value={formData.topic} 
                                        onChange={e => setFormData({...formData, topic: e.target.value})}
                                        className={`w-full px-4 py-3 rounded-xl border ${formErrors.topic ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500'} focus:ring-2 transition-all outline-none bg-gray-50 resize-none`}
                                    ></textarea>
                                    {formErrors.topic && <p className="text-xs text-red-500 font-semibold mt-1">{formErrors.topic}</p>}
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setSelectedSupervisor(null)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button form="groupForm" type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Submit Request</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                                Research Profile
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Enter your research interests to find the perfect supervisor match based on expertise and availability.
                            </p>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FaLightbulb className="text-yellow-500" /> Research Domain
                                </label>
                                <select
                                    required
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/50 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select a Domain</option>
                                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                                    <option value="Cyber Security">Cyber Security</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Software Engineering">Software Engineering</option>
                                    <option value="Cloud Computing">Cloud Computing</option>
                                    <option value="Information Systems">Information Systems</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FaSearch className="text-blue-400" /> Specific Interests (Tags)
                                </label>
                                <select
                                    required
                                    value={interests}
                                    onChange={(e) => setInterests(e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/50 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select an Interest Area</option>
                                    <option value="Machine Learning & Deep Learning">Machine Learning & Deep Learning</option>
                                    <option value="Natural Language Processing">Natural Language Processing</option>
                                    <option value="Network Security">Network Security</option>
                                    <option value="Big Data Analytics">Big Data Analytics</option>
                                    <option value="Agile Methodologies">Agile Methodologies</option>
                                    <option value="Internet of Things (IoT)">Internet of Things (IoT)</option>
                                    <option value="Blockchain Technology">Blockchain Technology</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FaFlask className="text-purple-400" /> Preferred Methodology
                                </label>
                                <select
                                    required
                                    value={methodology}
                                    onChange={(e) => setMethodology(e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/50 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select your approach</option>
                                    <option value="Quantitative">Quantitative Research</option>
                                    <option value="Qualitative">Qualitative Research</option>
                                    <option value="Mixed">Mixed Methods</option>
                                    <option value="Applied">Applied / Systems Building</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isSearching}
                                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-transform transform ${
                                    isSearching 
                                    ? "bg-gray-400 cursor-not-allowed" 
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:-translate-y-1 hover:shadow-xl"
                                }`}
                            >
                                {isSearching ? "Searching Network..." : "Find My Supervisor"}
                            </button>
                        </form>
                    </div>
                    
                    {/* My Requests Tracker */}
                    <div className="mt-8 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                            <FaBell className="text-blue-500" /> My Requests
                        </h2>
                        {myRequests.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">
                                <p className="text-sm">You haven't sent any requests yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {myRequests.map((req) => (
                                    <div key={req.id} className="p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${req.status === 'Accepted' ? 'bg-green-500' : req.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                                        <div className="pl-2">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-800 text-sm">To: {req.sponsorName}</h3>
                                                <span className={`text-[10px] uppercase tracking-bold font-bold px-2 py-1 rounded-md ${req.status === 'Accepted' ? 'bg-green-100 text-green-700' : req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 italic mb-2 line-clamp-2">Topic: {req.topic}</p>
                                            <p className="text-[10px] text-gray-400">Sent at {req.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7 flex flex-col h-[calc(100vh-8rem)]">
                    <div className="flex-1 bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden flex flex-col">
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Best Matches</h2>
                                <p className="text-gray-500 text-sm">Supervisors aligned with your interests.</p>
                            </div>
                            {matches.length > 0 && (
                                <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
                                    {matches.length} matches found
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {!matches.length && !isSearching ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <FaSearch className="text-4xl text-gray-300" />
                                    </div>
                                    <p className="text-lg font-medium text-gray-500">No matches yet</p>
                                    <p className="text-sm">Submit your profile to see tailored recommendations.</p>
                                </div>
                            ) : null}

                            {matches.map((supervisor, index) => (
                                <div 
                                    key={supervisor.id} 
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                                    style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` }}
                                >
                                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-green-400 to-green-600 text-white font-bold px-4 py-2 rounded-bl-2xl">
                                        {supervisor.matchScore}% Match
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center text-2xl font-bold text-blue-600 border-2 border-white shadow-sm shrink-0 uppercase">
                                            {supervisor.name.substring(0,2)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                {supervisor.name}
                                                <FaCheckCircle className="text-blue-500 text-sm" />
                                            </h3>
                                            
                                            <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                                {supervisor.expertise.map((skill, idx) => (
                                                    <span key={idx} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${supervisor.load >= supervisor.maxLoad ? 'bg-red-500' : supervisor.load / supervisor.maxLoad > 0.6 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                                        style={{ width: `${(supervisor.load / supervisor.maxLoad) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-gray-500 font-medium text-xs">
                                                    Load: {supervisor.load}/{supervisor.maxLoad} Students
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                                        {(() => {
                                            const isRequested = myRequests.some(r => r.sponsorId === supervisor.id && r.status !== "Rejected");
                                            const isFull = supervisor.load >= supervisor.maxLoad;
                                            
                                            return (
                                                <button 
                                                    onClick={() => handleOpenModal(supervisor)}
                                                    disabled={isRequested || isFull}
                                                    className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
                                                        isRequested 
                                                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200 cursor-default" 
                                                        : isFull 
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                                        : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:shadow-lg"
                                                    }`}
                                                >
                                                    {isRequested ? "Request Sent" : isFull ? "Capacity Reached" : "Request Supervision"}
                                                </button>
                                            )
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes blobs {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blobs 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes bounce-in {
                    0% { transform: scale(0.8) translateY(-20px); opacity: 0; }
                    50% { transform: scale(1.05) translateY(0); opacity: 1; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.3);
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default StudentResearchForm;
