import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaCircle, FaClock, FaCommentDots, FaExclamationCircle, FaTrash } from "react-icons/fa";

const MyTickets = () => {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                // Ensure we pass the userRole just in case the middleware looks for it in query
                const res = await axios.get(`http://localhost:5000/api/tickets/user/${user._id}?userRole=${user.role}`);
                setTickets(res.data);
            } catch (err) {
                console.error("Error fetching tickets:", err);
                setError("Failed to load your tickets. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) fetchTickets();
    }, [user?._id, user?.role]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this closed ticket?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/tickets/${id}?userRole=${user.role}`);
            setTickets(tickets.filter(t => t._id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete ticket.");
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'low': return <FaCircle className="text-gray-400" size={10} title="Low Priority" />;
            case 'medium': return <FaCircle className="text-blue-500" size={10} title="Medium Priority" />;
            case 'high': return <FaCircle className="text-orange-500" size={10} title="High Priority" />;
            case 'urgent': return <FaExclamationCircle className="text-red-500" size={12} title="Urgent Priority" />;
            default: return <FaCircle className="text-gray-400" size={10} />;
        }
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Support Tickets</h1>
                    <p className="text-gray-600 mt-2">Track the status of your queries and view responses from the administration team.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2c5f5d] mx-auto"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading your tickets...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-800 p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
                        {error}
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
                        <div className="text-5xl text-gray-300 mb-4 flex justify-center"><FaCommentDots /></div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets yet</h3>
                        <p className="text-gray-500">You haven't submitted any support tickets.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map(ticket => (
                            <div key={ticket._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            {getPriorityIcon(ticket.priority)}
                                            <h2 className="text-xl font-bold text-gray-800">{ticket.subject}</h2>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 font-medium gap-4">
                                            <span className="flex items-center gap-1"><FaClock size={12}/> {new Date(ticket.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                                            <span className="uppercase tracking-wider">ID: {ticket._id.slice(-6)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                                            <button 
                                                onClick={() => handleDelete(ticket._id)}
                                                className="text-red-400 hover:text-red-600 transition p-2 bg-red-50 hover:bg-red-100 rounded-full"
                                                title="Delete Resolved Ticket"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        )}
                                        <span className={`px-4 py-1 text-xs font-bold uppercase rounded-full border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('-', ' ')}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{ticket.description}</p>
                                </div>

                                {ticket.adminResponse && (
                                    <div className="bg-[#2c5f5d]/5 p-4 rounded-lg border border-[#2c5f5d]/20 relative">
                                        <div className="absolute top-4 right-4 text-[#2c5f5d]/20">
                                            <FaCommentDots size={24} />
                                        </div>
                                        <h4 className="text-xs font-bold text-[#2c5f5d] uppercase tracking-wider mb-2">Admin Response</h4>
                                        <p className="text-gray-800 whitespace-pre-wrap text-sm relative z-10">{ticket.adminResponse}</p>
                                        
                                        {ticket.resolvedAt && (
                                            <div className="mt-3 text-xs text-[#2c5f5d]/70 font-medium pt-3 border-t border-[#2c5f5d]/10">
                                                Resolved on {new Date(ticket.resolvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTickets;
