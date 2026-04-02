import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import NotificationCenter from "../components/NotificationCenter";
import { FaUserGraduate, FaCalendarAlt, FaFileAlt, FaChartLine } from "react-icons/fa";

const StudentHome = () => {
    const { user } = useContext(AuthContext);

    const stats = [
        { 
            label: "Projects Active", 
            value: "3", 
            icon: <FaFileAlt size={24} />,
            color: "bg-blue-50"
        },
        { 
            label: "Milestones Completed", 
            value: "8", 
            icon: <FaCalendarAlt size={24} />,
            color: "bg-green-50"
        },
        { 
            label: "Current Progress", 
            value: "72%", 
            icon: <FaChartLine size={24} />,
            color: "bg-purple-50"
        }
    ];

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Welcome, {user?.fullName || "Student"}!</h1>
                        <p className="text-gray-600 mt-2">Track your research projects and milestones</p>
                    </div>
                    <NotificationCenter />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`${stat.color} p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                                </div>
                                <div className="text-gray-400">{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition text-left">
                            <FaUserGraduate className="text-blue-600 mb-2" size={20} />
                            <h3 className="font-semibold text-gray-800">View Projects</h3>
                            <p className="text-sm text-gray-600">Access all your active projects</p>
                        </button>
                        <button className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-md transition text-left">
                            <FaCalendarAlt className="text-green-600 mb-2" size={20} />
                            <h3 className="font-semibold text-gray-800">Milestones</h3>
                            <p className="text-sm text-gray-600">Check upcoming deadlines</p>
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                    <div className="text-center py-12 text-gray-400">
                        <p>No recent activities yet. Start by creating a project or adding a milestone.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
