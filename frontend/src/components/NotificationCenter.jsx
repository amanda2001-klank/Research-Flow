import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { IoNotifications } from "react-icons/io5";

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?._id) {
                setNotifications([]);
                return;
            }

            try {
                const res = await axios.get("http://localhost:5000/api/notifications/" + user._id);
                setNotifications(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.log(err);
                setNotifications([]);
            }
        };
        fetchNotifications();
    }, [user?._id, isOpen]);

    const handleRead = async (id) => {
        try {
            await axios.put("http://localhost:5000/api/notifications/" + id + "/read");
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.log(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
       className="relative p-2 text-black hover:text-gray-700 transition transform hover:scale-110"
            >
                <IoNotifications size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="p-3 border-b font-semibold text-gray-700">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-indigo-50' : ''}`}
                                    onClick={() => handleRead(n._id)}
                                >
                                    <p className="text-sm text-gray-800">{n.content}</p>
                                    <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
