import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import {
    FaCalendarAlt,
    FaClipboardList,
    FaBolt,
    FaSun,
    FaCog,
    FaUserCircle,
    FaFileAlt,
    FaChevronRight
} from 'react-icons/fa';
import { format } from 'timeago.js';
import ProjectMilestoneTimeline from './ProjectMilestoneTimeline';

const StudentHome = ({ setView }) => {
    const { user } = useContext(AuthContext);
    const { isDark } = useContext(ThemeContext);
    const [activities, setActivities] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [notifRes, timelineRes, announcementRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/notifications/${user._id}`),
                    axios.get(`http://localhost:5000/api/research-timeline/${user._id}`),
                    axios.get(`http://localhost:5000/api/announcements`)
                ]);

                // Combine notifications and announcements for activity feed
                const combined = [
                    ...notifRes.data.map(n => ({ ...n, feedType: 'notification' })),
                    ...announcementRes.data.map(a => ({
                        ...a,
                        feedType: 'announcement',
                        type: 'system',
                        message: a.title,
                        createdAt: a.createdAt
                    }))
                ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setActivities(combined.slice(0, 5));
                setTimeline(timelineRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setLoading(false);
            }
        };
        if (user?._id) fetchData();
    }, [user._id]);

    const stats = [
        {
            title: "Next Deadline",
            value: timeline.length > 0 ? new Date(timeline[0].deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "No Date",
            subValue: timeline.length > 0 ? timeline[0].title : "No upcoming deadlines",
            icon: <FaCalendarAlt className="text-amber-500" />,
            bgColor: "bg-blue-50/50",
            iconColor: "text-amber-500"
        },
        {
            title: "Pending Tasks",
            value: `${timeline.filter(t => t.status !== 'completed').length} Total`,
            subValue: `${timeline.filter(t => t.type === 'working_plan').length} Logs, ${timeline.filter(t => t.type === 'deadline').length} Deadlines`,
            icon: <FaClipboardList className="text-amber-500" />,
            bgColor: "bg-emerald-50/50",
            iconColor: "text-amber-500"
        },
        {
            title: "System Status",
            value: "ACTIVE",
            subValue: "All systems operational",
            icon: <FaBolt className="text-amber-500" />,
            bgColor: "bg-blue-50/50",
            iconColor: "text-amber-500",
            statusColor: "text-emerald-500"
        }
    ];

    const milestones = [
        { name: "Proposal", status: "DONE", color: "text-emerald-500" },
        { name: "Literature Review", status: "IN PROGRESS", color: "text-amber-500", active: true },
        { name: "Methodology", status: "PENDING", color: "text-gray-400" }
    ];

    return (
        <div className={`flex-1 p-8 overflow-y-auto font-sans transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-50/50'}`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className={`text-4xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
                        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back, {user?.fullName || user?.username}</p>
                    </div>
                    <div className="flex gap-3">
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-sm border transition-colors ${isDark ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-gray-100 text-gray-600'}`}>
                            <FaCalendarAlt className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                            <span className="font-medium">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Supervisor Status Banner */}
                <div className={`relative overflow-hidden rounded-[2rem] p-10 mb-8 text-white shadow-xl transition-colors ${isDark ? 'bg-[#3d504e] border border-gray-800' : 'bg-[#3d504e]'}`}>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-lg text-xs font-bold tracking-widest uppercase mb-4 text-amber-500">
                                SUPERVISOR REQUEST STATUS
                            </span>
                            <h2 className="text-3xl font-medium leading-tight">
                                You have requested supervision from <span className="font-bold underline decoration-2 underline-offset-4">Dr. Robert AI</span>.
                            </h2>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                <span className="text-amber-500 font-bold uppercase tracking-wider text-sm">PENDING</span>
                            </div>
                            <button
                                onClick={() => setView('Chat')}
                                className="px-8 py-4 bg-[#d4a035] hover:bg-[#c49025] text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                    {/* Decorative pattern placeholder */}
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle cx="100" cy="0" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            <circle cx="100" cy="0" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            <circle cx="100" cy="0" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        </svg>
                    </div>
                </div>

                {/* Project Milestone Timeline */}
                <ProjectMilestoneTimeline timeline={timeline} setView={setView} />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`p-8 rounded-[2rem] shadow-sm flex flex-col justify-between h-52 group transition-all ${isDark ? 'bg-gray-900 border border-gray-800 hover:shadow-lg' : 'bg-white border border-gray-50 hover:shadow-md'}`}>
                            <div className="flex justify-between items-start">
                                <span className={`font-medium text-lg ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{stat.title}</span>
                                <div className="text-2xl group-hover:scale-110 transition-transform">{stat.icon}</div>
                            </div>
                            <div>
                                <h3 className={`text-4xl font-extrabold mb-1 ${stat.statusColor || (isDark ? 'text-white' : 'text-gray-900')}`}>{stat.value}</h3>
                                <p className={`font-medium line-clamp-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.subValue}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className={`lg:col-span-2 rounded-[2rem] p-10 shadow-sm border transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-50'}`}>
                        <div className="flex justify-between items-center mb-10">
                            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h2>
                            <button
                                onClick={() => setView('Announcements')}
                                className="text-amber-600 font-bold hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-8">
                            {activities.length > 0 ? activities.map((activity, idx) => (
                                <div key={idx} className="flex gap-6 items-start">
                                    <div className={`p-4 rounded-2xl ${activity.type === 'system' ? (isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-500') :
                                            activity.type === 'admin' ? (isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-50 text-amber-500') :
                                                (isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-50 text-purple-500')
                                        }`}>
                                        {activity.type === 'system' ? <FaCog size={24} /> :
                                            activity.type === 'admin' ? <FaUserCircle size={24} /> :
                                                <FaFileAlt size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1)}: <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{activity.message}</span>
                                            </h4>
                                        </div>
                                        <p className={`font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{format(activity.createdAt)}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className={`text-center py-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No recent activity</p>
                            )}
                        </div>
                    </div>

                    {/* Completion Progress */}
                    <div className={`rounded-[2rem] p-10 shadow-sm border transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-50'}`}>
                        <h2 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>Completion Progress</h2>

                        <div className="mb-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${isDark ? 'text-amber-300 bg-amber-900/50' : 'text-amber-700 bg-amber-50'}`}>TASK COMPLETION</span>
                                <span className="text-xl font-extrabold text-amber-500">65%</span>
                            </div>
                            <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {milestones.map((m, idx) => (
                                <div key={idx} className={`p-5 rounded-2xl flex justify-between items-center relative transition-all ${m.active ? (isDark ? 'bg-gray-800 border-2 border-amber-500 shadow-lg' : 'bg-white border-2 border-amber-500 shadow-lg') : (isDark ? 'bg-gray-800 border border-transparent' : 'bg-gray-50 border border-transparent')}`}>
                                    {m.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-amber-500 rounded-r-full"></div>}
                                    <span className={`text-lg font-bold ${m.active ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-500' : 'text-gray-500')}`}>{m.name}</span>
                                    <span className={`text-sm font-black uppercase tracking-widest ${m.color}`}>{m.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
