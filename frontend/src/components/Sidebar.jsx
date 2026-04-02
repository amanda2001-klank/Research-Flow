import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaGraduationCap, FaUserFriends, FaSearch, FaBook, FaFileAlt, FaSignOutAlt, FaCommentDots, FaBullhorn, FaQuestionCircle, FaRobot, FaUserShield, FaUserGraduate, FaUsers, FaClipboardList, FaClipboardCheck, FaHome, FaChartLine, FaShieldAlt, FaHistory } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

const Sidebar = ({ view, setView }) => {
    const { user, dispatch } = useContext(AuthContext);

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        window.location.href = "/login";
    };

    // Define navigation items based on user role
    const getNavItems = () => {
        if (user?.role === 'admin') {
            return [
                { name: "Dashboard", icon: <MdDashboard size={20} /> },
                { name: "Announcements", icon: <FaBullhorn size={20} /> },
                { name: "Manage Sponsors", icon: <FaUserShield size={20} /> },
                { name: "Manage Students", icon: <FaUserGraduate size={20} /> },
                { name: "All Sponsors", icon: <FaUsers size={20} /> },
            ];
        } else if (user?.role === 'sponsor') {
            return [
                { name: "Dashboard", icon: <MdDashboard size={20} /> },
                { name: "Supervisor Allocation", icon: <FaClipboardCheck size={20} /> },
                { name: "Chat", icon: <FaCommentDots size={20} /> },
                { name: "Announcements", icon: <FaBullhorn size={20} /> },
                { name: "Fortnight Review", icon: <FaClipboardCheck size={20} /> },
                { name: "Documents", icon: <FaFileAlt size={20} /> },
            ];
        } else {
            // Student
            return [
                { name: "Student Home", icon: <FaHome size={20} /> },
                { name: "Project Milestones", icon: <FaChartLine size={20} /> },
                { name: "Research Timeline", icon: <FaHistory size={20} /> },
                { name: "Plagiarism Checker", icon: <FaShieldAlt size={20} /> },
                { name: "Chat", icon: <FaCommentDots size={20} /> },
                { name: "AI Assistant", icon: <FaRobot size={20} /> },
                { name: "FAQ", icon: <FaQuestionCircle size={20} /> },
                { name: "Announcements", icon: <FaBullhorn size={20} /> },
                { name: "Fortnight Log", icon: <FaClipboardList size={20} /> },
                { name: "Documents", icon: <FaFileAlt size={20} /> },
            ];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="w-[260px] bg-[#2F4F4F] text-gray-300 flex flex-col h-full font-sans">
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3">
                <div className="p-2 bg-[#FFD700] rounded-lg">
                    <FaGraduationCap className="text-[#2F4F4F] text-xl" />
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg tracking-wide">ResearchFlow</h1>
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                        {user?.role || 'User'}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col gap-1 px-4 mt-4">
                {navItems.map((item) => (
                    <div
                        key={item.name}
                        onClick={() => setView(item.name)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 
                        ${view === item.name
                                ? "bg-[#3A5F5F] text-white border-r-4 border-[#FFD700]"
                                : "hover:bg-[#3A5F5F] hover:text-white"}`}
                    >
                        <span className={view === item.name ? "text-[#FFD700]" : ""}>{item.icon}</span>
                        <span className="font-medium text-sm">{item.name}</span>
                    </div>
                ))}
            </div>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-[#3A5F5F]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.username}&background=FFD700&color=2F4F4F`}
                            alt="User"
                            className="w-10 h-10 rounded-full border-2 border-[#3A5F5F]"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2F4F4F]"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-sm font-semibold">{user?.fullName || user?.username}</span>
                        <span className="text-xs text-gray-400">ID: 2026-RF-02</span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-[#FF6B6B] hover:text-[#ff8787] text-sm font-medium transition pl-1"
                >
                    <FaSignOutAlt />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
