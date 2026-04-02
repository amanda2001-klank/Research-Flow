import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { FaCheckCircle, FaCircle, FaArrowRight } from 'react-icons/fa';

const ProjectMilestoneTimeline = ({ timeline, setView }) => {
    const { isDark } = useContext(ThemeContext);

    // Get unique deadline milestones sorted by date
    const milestones = timeline
        .filter(item => item.type === 'deadline')
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);

    if (milestones.length === 0) {
        return null;
    }

    // Calculate progress
    const completedCount = milestones.filter(m => m.status === 'completed').length;
    const inProgressIndex = milestones.findIndex(m => m.status !== 'completed');
    const totalCount = milestones.length;
    const progressPercentage = (completedCount / totalCount) * 100;

    return (
        <div className={`rounded-3xl p-8 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100 shadow-sm'}`}>
            {/* Header */}
            <div className="mb-8">
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Project Milestone Timeline
                </h2>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    Track your progress toward the final dissertation submission.
                </p>
            </div>

            {/* Progress Label */}
            <div className="flex justify-between items-center mb-6">
                <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-lg ${
                    isDark ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
                }`}>
                    PHASE {completedCount + 1}: {milestones[completedCount]?.title || 'COMPLETION'}
                </span>
                <span className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {completedCount} of {totalCount} Complete
                </span>
            </div>

            {/* Timeline Visualization */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-8">
                    {milestones.map((milestone, idx) => (
                        <div key={milestone._id} className="flex items-center gap-4 flex-1">
                            {/* Milestone Circle */}
                            <div className="flex flex-col items-center">
                                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${
                                    milestone.status === 'completed'
                                        ? isDark ? 'bg-cyan-600 text-white' : 'bg-cyan-500 text-white'
                                        : idx === inProgressIndex
                                        ? isDark ? 'bg-cyan-600 border-4 border-cyan-400 text-white' : 'bg-cyan-500 border-4 border-cyan-300 text-white'
                                        : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'
                                }`}>
                                    {milestone.status === 'completed' ? (
                                        <FaCheckCircle size={24} />
                                    ) : (
                                        <FaCircle size={20} />
                                    )}
                                </div>
                                {/* Milestone Label */}
                                <div className="text-center mt-3 w-20">
                                    <p className={`text-xs font-bold tracking-widest uppercase ${
                                        milestone.status === 'completed' || idx === inProgressIndex
                                            ? isDark ? 'text-cyan-400' : 'text-cyan-600'
                                            : isDark ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                        {milestone.title}
                                    </p>
                                </div>
                            </div>

                            {/* Connecting Line */}
                            {idx < milestones.length - 1 && (
                                <div className={`flex-1 h-1 rounded-full mb-6 transition-colors ${
                                    idx < completedCount
                                        ? isDark ? 'bg-cyan-600' : 'bg-cyan-500'
                                        : isDark ? 'bg-gray-700' : 'bg-gray-200'
                                }`}></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Details Section */}
                <div className="mt-8 pt-6 border-t" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {milestones.slice(0, 3).map((milestone, idx) => (
                            <div key={milestone._id} className={`p-4 rounded-xl ${
                                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    {milestone.title}
                                </p>
                                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {new Date(milestone.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                                <p className={`text-xs mt-1 ${
                                    milestone.status === 'completed'
                                        ? isDark ? 'text-cyan-400' : 'text-cyan-600'
                                        : isDark ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                    {milestone.status === 'completed' ? '✓ Completed' : 'Pending'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={() => setView('Research Timeline')}
                className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isDark
                        ? 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-600/30 hover:border-cyan-600/50'
                        : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200'
                }`}
            >
                Manage Timeline
                <FaArrowRight size={16} />
            </button>
        </div>
    );
};

export default ProjectMilestoneTimeline;
