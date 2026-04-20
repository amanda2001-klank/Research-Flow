import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaFilter, FaSearch, FaCheck, FaTimes, FaReply, FaCircle } from "react-icons/fa";

const ManageTickets = () => {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Selected Ticket for Editing
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [responseInput, setResponseInput] = useState("");
    const [statusInput, setStatusInput] = useState("");

    useEffect(() => {
        fetchTickets();
    }, [user?.role]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/api/tickets", {
                params: { userRole: user?.role }
            });
            setTickets(res.data);
        } catch (err) {
            console.error("Error fetching all tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTicket = (ticket) => {
        setSelectedTicket(ticket);
        setResponseInput(ticket.adminResponse || "");
        setStatusInput(ticket.status);
    };

    const handleUpdateTicket = async () => {
        if (!selectedTicket) return;
        try {
            // We use the respond route since it natively handles both adminResponse and status transitions seamlessly
            await axios.put(`http://localhost:5000/api/tickets/${selectedTicket._id}/respond`, {
                adminResponse: responseInput,
                respondedBy: user._id,
                status: statusInput,
                userRole: user.role
            });
            
            // Refresh local state without refetching fully if possible, but fetch is safer
            await fetchTickets();
            setSelectedTicket(null);
        } catch (err) {
            console.error("Error updating ticket:", err);
            alert("Failed to update ticket.");
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchStatus = filterStatus === 'all' || ticket.status === filterStatus;
        const matchPriority = filterPriority === 'all' || ticket.priority === filterPriority;
        const matchSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ticket.createdBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ticket.createdBy?.username?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchPriority && matchSearch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open': return <span className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase border">Open</span>;
            case 'in-progress': return <span className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1 rounded-full text-xs font-bold uppercase border">In Progress</span>;
            case 'resolved': return <span className="bg-green-100 text-green-800 border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase border">Resolved</span>;
            case 'closed': return <span className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase border">Closed</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase border">Unknown</span>;
        }
    };

    const getPriorityDot = (priority) => {
        switch (priority) {
            case 'low': return <FaCircle className="text-gray-400" size={10} />;
            case 'medium': return <FaCircle className="text-blue-500" size={10} />;
            case 'high': return <FaCircle className="text-orange-500" size={10} />;
            case 'urgent': return <FaCircle className="text-red-600" size={10} />;
            default: return <FaCircle className="text-gray-400" size={10} />;
        }
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50 font-sans h-full">
            <div className="max-w-7xl mx-auto flex flex-col h-full">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Manage Tickets</h1>
                        <p className="text-gray-600 mt-2">Monitor, reply to, and resolve all system support tickets securely.</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-500">
                        Total Tickets: {tickets.length}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4 items-center">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search subject or user..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2c5f5d] outline-none"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                        <FaFilter className="text-gray-400"/>
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2c5f5d] text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <select 
                            value={filterPriority} 
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2c5f5d] text-sm"
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-6 flex-1 min-h-0">
                    {/* Ticket List Area */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-y-auto p-0 flex-1">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading tickets...</div>
                            ) : filteredTickets.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No tickets found matching your criteria.</div>
                            ) : (
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                                        <tr>
                                            <th className="p-4 font-semibold text-gray-700">Priority</th>
                                            <th className="p-4 font-semibold text-gray-700">Subject</th>
                                            <th className="p-4 font-semibold text-gray-700">User</th>
                                            <th className="p-4 font-semibold text-gray-700">Status</th>
                                            <th className="p-4 font-semibold text-gray-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredTickets.map(ticket => (
                                            <tr 
                                                key={ticket._id} 
                                                onClick={() => handleSelectTicket(ticket)}
                                                className={`cursor-pointer transition hover:bg-gray-50 ${selectedTicket?._id === ticket._id ? 'bg-[#2c5f5d]/5 border-l-4 border-l-[#2c5f5d]' : 'border-l-4 border-l-transparent'}`}
                                            >
                                                <td className="p-4 text-center">{getPriorityDot(ticket.priority)}</td>
                                                <td className="p-4 font-medium text-gray-800">{ticket.subject}</td>
                                                <td className="p-4 text-gray-600">{ticket.createdBy?.fullName || ticket.createdBy?.username} <br/><span className="text-xs text-gray-400 capitalize">{ticket.createdBy?.role}</span></td>
                                                <td className="p-4">{getStatusBadge(ticket.status)}</td>
                                                <td className="p-4 text-gray-500 text-xs">{new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Ticket Detailed View / Editor (Right Panel) */}
                    {selectedTicket && (
                        <div className="w-[450px] bg-white border border-gray-200 rounded-xl shadow-lg p-6 overflow-y-auto flex flex-col shrink-0">
                            <div className="flex justify-between items-start mb-6 border-b pb-4 border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedTicket.subject}</h2>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(selectedTicket.status)} 
                                        <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">ID: {selectedTicket._id.slice(-6)}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 transition"><FaTimes size={20}/></button>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Requester Info</h3>
                                <p className="text-sm font-semibold text-gray-800">{selectedTicket.createdBy?.fullName || selectedTicket.createdBy?.username}</p>
                                <p className="text-sm text-gray-500">{selectedTicket.createdBy?.email}</p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Issue Description</h3>
                                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                                    {selectedTicket.description}
                                </div>
                                <div className="text-xs text-gray-400 mt-2 text-right">
                                    Raised on {new Date(selectedTicket.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                </div>
                            </div>

                            <div className="flex-1"></div>

                            {/* Action Panel */}
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-6">
                                <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                                    <FaReply /> Admin Resolution actions
                                </h3>

                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Update Status</label>
                                    <select 
                                        value={statusInput} 
                                        onChange={(e) => setStatusInput(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-blue-500 text-sm"
                                    >
                                        <option value="open">Open (Unresolved)</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed (Locked)</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Official Response note</label>
                                    <textarea 
                                        value={responseInput} 
                                        onChange={(e) => setResponseInput(e.target.value)}
                                        rows="4"
                                        placeholder="Type your response to the user here..."
                                        className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-blue-500 text-sm resize-none"
                                    ></textarea>
                                </div>

                                <button 
                                    onClick={handleUpdateTicket}
                                    className="w-full py-2 bg-[#2c5f5d] text-white font-medium rounded-lg hover:bg-opacity-90 transition flex justify-center items-center gap-2 shadow-sm"
                                >
                                    <FaCheck size={14}/> Save Changes
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageTickets;
