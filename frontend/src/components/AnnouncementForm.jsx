import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const AnnouncementForm = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const { user } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/announcements", {
                title,
                content,
                sender: user._id
            });
            setSuccessMsg("Announcement broadcasted successfully!");
            setTitle("");
            setContent("");
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4 border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">Broadcast Announcement</h3>
            {successMsg && <div className="p-2 mb-2 bg-green-100 text-green-700 rounded text-sm">{successMsg}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="Title"
                    className="p-2 border rounded focus:outline-none focus:border-indigo-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Message content..."
                    className="p-2 border rounded focus:outline-none focus:border-indigo-500 h-24 resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition w-full sm:w-auto self-end"
                >
                    Send to All Students
                </button>
            </form>
        </div>
    );
};

export default AnnouncementForm;
