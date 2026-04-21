import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaSearch, FaPlus } from "react-icons/fa";

const ChannelList = ({ setChatWith, chatWith }) => {
    const [channels, setChannels] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchChannels = () => {
            if (!user) return;

            let loadedChannels = [];
            
            if (user.role === 'student') {
                const savedReqs = localStorage.getItem(`myRequests_${user._id}`);
                const parsedReqs = savedReqs ? JSON.parse(savedReqs) : [];
                const acceptedReqs = parsedReqs.filter(r => r.status === 'Accepted');
                
                loadedChannels = acceptedReqs.map(req => ({
                    isGroupChat: true,
                    group: req,
                    sponsorId: req.sponsorId,
                    studentId: user._id,
                    _id: req.sponsorId,
                    username: req.groupId ? `Group: ${req.groupId} (${req.sponsorName})` : `Supervisor ${req.sponsorName}`
                }));
            } else if (user.role === 'sponsor') {
                const savedGroups = localStorage.getItem(`acceptedGroups_${user._id}`);
                const parsedGroups = savedGroups ? JSON.parse(savedGroups) : [];
                
                loadedChannels = parsedGroups.map(group => ({
                    isGroupChat: true,
                    group: group,
                    sponsorId: user._id,
                    studentId: group.studentId,
                    _id: group.studentId,
                    username: group.groupId ? `Group: ${group.groupId}` : `Student Group`
                }));
            } else {
                // Admin or other roles keep empty or can be handled as needed
            }
            
            setChannels(loadedChannels);
        };

        fetchChannels();
        
        // Listen to storage events (from other tabs)
        const handleStorageChange = () => fetchChannels();
        window.addEventListener('storage', handleStorageChange);
        
        // Poll for changes in the same window since localStorage event doesn't fire in the same window
        const interval = setInterval(fetchChannels, 2000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [user]);

    return (
        <div className="w-80 border-r flex flex-col font-sans" style={{ backgroundColor: "#f8f8f8", borderColor: "#ddd" }}>
            <div className="p-6 pb-2">
                <h3 className="font-bold text-xs tracking-wider uppercase mb-4" style={{ color: "#999" }}>Channels</h3>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm mb-4" style={{ borderColor: "#ddd" }}>
                    <FaSearch style={{ color: "#999" }} />
                    <input
                        placeholder="Search..."
                        className="bg-transparent focus:outline-none text-sm w-full"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm" style={{ color: "#666" }}>
                            # Groups
                        </span>
                        <FaPlus className="cursor-pointer hover:opacity-70" style={{ color: "#999" }} size={12} />
                    </div>
                    {channels.length === 0 ? (
                        <div className="text-sm text-gray-400 p-2 text-center italic">No active groups</div>
                    ) : (
                        channels.map((u, i) => (
                            <div
                                key={`${u._id}_${i}`}
                                onClick={() => setChatWith(u)}
                                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition mb-1`}
                                style={{
                                    backgroundColor: chatWith?._id === u._id ? "#fff" : "transparent",
                                    border: chatWith?._id === u._id ? "1px solid #ddd" : "none"
                                }}
                            >
                                <span className={`w-2 h-2 rounded-full bg-green-500`}></span>
                                <span className={`text-sm font-medium`} style={{
                                    color: chatWith?._id === u._id ? "#333" : "#666"
                                }}>
                                    # {u.username}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChannelList;
