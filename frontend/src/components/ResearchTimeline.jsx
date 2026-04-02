import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { IoCalendar, IoTime, IoCheckmarkCircle, IoRadioButtonOff, IoTrash } from "react-icons/io5";

const ResearchTimeline = () => {
    const { user } = useContext(AuthContext);
    const { isDark } = useContext(ThemeContext);
    const [timeline, setTimeline] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [type, setType] = useState("deadline");
    const [loading, setLoading] = useState(true);

    const fetchTimeline = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/research-timeline/${user._id}`);
            setTimeline(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?._id) fetchTimeline();
    }, [user?._id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/research-timeline", {
                user: user._id,
                title,
                description,
                deadline,
                type
            });
            setTitle("");
            setDescription("");
            setDeadline("");
            fetchTimeline();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === "pending" ? "completed" : "pending";
            await axios.put(`http://localhost:5000/api/research-timeline/${id}`, { status: newStatus });
            setTimeline(timeline.map(item => item._id === id ? { ...item, status: newStatus } : item));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteEntry = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/research-timeline/${id}`);
            setTimeline(timeline.filter(item => item._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={`flex-1 p-8 overflow-y-auto ${isDark ? 'bg-gray-950' : 'bg-gray-50'} transition-colors duration-300`}>
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className={`text-3xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        <IoCalendar className={isDark ? 'text-indigo-400' : 'text-indigo-600'} /> Research Timeline Plan
                    </h1>
                    <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your research deadlines and working hours.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add Entry Form */}
                    <div className="md:col-span-1">
                        <div className={`p-6 rounded-2xl shadow-sm border sticky top-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>Add Event</h3>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    className={`p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                <textarea
                                    placeholder="Description (Optional)"
                                    className={`p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <div className="flex flex-col gap-1">
                                    <label className={`text-xs ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Date</label>
                                    <input
                                        type="date"
                                        className={`p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setType("deadline")}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${type === 'deadline' ? 'bg-red-100 text-red-600 border border-red-200' : isDark ? 'bg-gray-700 text-gray-400 border border-transparent' : 'bg-gray-100 text-gray-600 border border-transparent'}`}
                                    >
                                        Deadline
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType("working_plan")}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${type === 'working_plan' ? 'bg-green-100 text-green-600 border border-green-200' : isDark ? 'bg-gray-700 text-gray-400 border border-transparent' : 'bg-gray-100 text-gray-600 border border-transparent'}`}
                                    >
                                        Working Plan
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="mt-2 bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md"
                                >
                                    Save Entry
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Timeline List */}
                    <div className="md:col-span-2 space-y-4">
                        {loading ? (
                            <div className={`text-center py-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Loading timeline...</div>
                        ) : timeline.length === 0 ? (
                            <div className={`p-12 rounded-2xl border border-dashed text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                                <IoCalendar className="text-4xl text-gray-200 mx-auto mb-3" />
                                <p className={isDark ? 'text-gray-400' : 'text-gray-400'}>Your timeline is empty. Add a deadline or working plan to get started.</p>
                            </div>
                        ) : (
                            timeline.map((item) => (
                                <div
                                    key={item._id}
                                    className={`p-5 rounded-2xl shadow-sm border group ${item.status === 'completed' ? isDark ? 'border-gray-700 opacity-60 bg-gray-800' : 'border-gray-100 opacity-60 bg-white' : isDark ? 'border-indigo-900/50 bg-gray-800' : 'border-indigo-50 bg-white'}`}>
                                
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => toggleStatus(item._id, item.status)}
                                            className={`mt-1 text-2xl transition ${item.status === 'completed' ? 'text-green-500' : 'text-gray-300 hover:text-indigo-400'}`}
                                        >
                                            {item.status === 'completed' ? <IoCheckmarkCircle /> : <IoRadioButtonOff />}
                                        </button>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                            <h3 className={`font-bold text-lg ${item.status === 'completed' ? isDark ? 'line-through text-gray-600' : 'line-through text-gray-400' : isDark ? 'text-white' : 'text-gray-800'}`}>
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.type === 'deadline' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                                        {item.type.replace('_', ' ')}
                                                    </span>
                                                    <button
                                                        onClick={() => deleteEntry(item._id)}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition"
                                                    >
                                                        <IoTrash size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            {item.description && (
                                                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.description}</p>
                                            )}
                                            <div className={`flex items-center gap-4 mt-3 text-xs font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>
                                                <span className="flex items-center gap-1">
                                                    <IoCalendar /> {new Date(item.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                {item.sourceAnnouncement && (
                                                    <span className="text-amber-500 flex items-center gap-1">
                                                        <IoTime /> From Announcement
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResearchTimeline;
