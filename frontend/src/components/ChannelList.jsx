import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaSearch, FaPlus } from "react-icons/fa";

const ChannelList = ({ setChatWith, chatWith }) => {
    const [users, setUsers] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/auth/users");
                // Filter users based on role
                let filteredUsers = res.data.filter(u => u._id !== user._id);

                if (user.role === 'student') {
                    // Students can only chat with sponsors
                    filteredUsers = filteredUsers.filter(u => u.role === 'sponsor');
                } else if (user.role === 'sponsor') {
                    // Sponsors can only chat with students
                    filteredUsers = filteredUsers.filter(u => u.role === 'student');
                }
                // Admins can chat with everyone (no additional filter)

                setUsers(filteredUsers);
            } catch (err) {
                console.log(err);
            }
        };
        fetchUsers();
    }, [user._id, user.role]);

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
                            # General
                        </span>
                        <FaPlus className="cursor-pointer hover:opacity-70" style={{ color: "#999" }} size={12} />
                    </div>
                    {users.map((u) => (
                        <div
                            key={u._id}
                            onClick={() => setChatWith(u)}
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition mb-1`}
                            style={{
                                backgroundColor: chatWith?._id === u._id ? "#fff" : "transparent",
                                border: chatWith?._id === u._id ? "1px solid #ddd" : "none"
                            }}
                        >
                            <span className={`w-2 h-2 rounded-full`} style={{
                                backgroundColor: u.isOnline ? "#27a745" : "#bbb"
                            }}></span>
                            <span className={`text-sm font-medium`} style={{
                                color: chatWith?._id === u._id ? "#333" : "#666"
                            }}>
                                # {u.username}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChannelList;
