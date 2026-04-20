import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "timeago.js";

const AnnouncementList = () => {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/announcements");
                setAnnouncements(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAnnouncements();
    }, []);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md flex-1 overflow-y-auto border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">📢 Recent Announcements</h3>
            <div className="flex flex-col gap-4">
                {announcements.length === 0 ? (
                    <p className="text-gray-500 text-center text-sm py-4">No announcements yet.</p>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann._id} className="p-3 bg-gray-50 rounded border-l-4 border-indigo-500">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-800">{ann.title}</h4>
                                <span className="text-xs text-gray-400">{format(ann.createdAt)}</span>
                            </div>
                            <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{ann.content}</p>
                            <span className="text-xs text-indigo-400 mt-2 block font-medium">
                                - {ann.sender?.username || "Admin"}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AnnouncementList;
