import { useEffect, useState } from "react";
import { FaCheckCircle, FaClock, FaExclamationTriangle, FaRegCircle } from "react-icons/fa";

const API = "http://localhost:5000/api";

const STATUS_STYLES = {
    completed: "bg-green-100 text-green-700",
    submitted: "bg-blue-100 text-blue-700",
    under_review: "bg-yellow-100 text-yellow-700",
    revision_requested: "bg-red-100 text-red-700",
    pending: "bg-gray-100 text-gray-600",
    overdue: "bg-red-100 text-red-700",
    optional: "bg-slate-100 text-slate-600",
};

const statusLabel = (status) => {
    switch (status) {
        case "completed": return "Completed";
        case "submitted": return "Submitted";
        case "under_review": return "Under Review";
        case "revision_requested": return "Revision Requested";
        case "overdue": return "Overdue";
        case "optional": return "Optional";
        default: return "Pending";
    }
};

const formatDate = (value) => {
    if (!value) return "No due date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "No due date";
    return date.toLocaleDateString();
};

const iconForStatus = (status) => {
    if (status === "completed") return <FaCheckCircle className="text-green-500" size={13} />;
    if (status === "overdue") return <FaExclamationTriangle className="text-red-500" size={13} />;
    if (status === "under_review") return <FaClock className="text-yellow-500" size={13} />;
    return <FaRegCircle className="text-gray-400" size={13} />;
};

const MilestoneChecklistPanel = ({ groupId, refreshSignal = 0 }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [checklist, setChecklist] = useState(null);

    useEffect(() => {
        const fetchChecklist = async () => {
            if (!groupId) {
                setChecklist(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");
                const res = await fetch(`${API}/documents/checklist/${groupId}`);
                if (!res.ok) throw new Error("Failed to load checklist");
                const data = await res.json();
                setChecklist(data);
            } catch (err) {
                console.error(err);
                setError("Unable to load milestone checklist.");
            }
            setLoading(false);
        };

        fetchChecklist();
    }, [groupId, refreshSignal]);

    if (!groupId) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Milestone Checklist</h3>
                    <p className="text-sm text-gray-500">Submission rules and milestone completion for your group</p>
                </div>
                {checklist?.progress && (
                    <span className="text-xs bg-[#2F4F4F]/10 text-[#2F4F4F] px-3 py-1 rounded-full font-semibold">
                        {checklist.progress.completionRate}% complete
                    </span>
                )}
            </div>

            {loading ? (
                <p className="text-sm text-gray-400">Loading milestone checklist...</p>
            ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
            ) : !checklist?.milestones?.length ? (
                <p className="text-sm text-gray-500">No milestones configured yet.</p>
            ) : (
                <>
                    <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#2F4F4F] to-[#FFD700] transition-all"
                            style={{ width: `${checklist.progress?.completionRate || 0}%` }}
                        />
                    </div>

                    <div className="space-y-2">
                        {checklist.milestones.map((milestone) => (
                            <div key={milestone.key} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-3">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{iconForStatus(milestone.status)}</div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold text-gray-700">{milestone.title}</p>
                                            <span className="text-[11px] text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                                {milestone.documentType}
                                            </span>
                                            {!milestone.required && (
                                                <span className="text-[11px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Optional</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Due: {formatDate(milestone.dueDate)}
                                            {milestone.overdueDays > 0 && ` (${milestone.overdueDays} day(s) late)`}
                                        </p>
                                        {milestone.latestDocument && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Latest: {milestone.latestDocument.title} (v{milestone.latestDocument.currentVersion})
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[milestone.status] || STATUS_STYLES.pending}`}>
                                    {statusLabel(milestone.status)}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MilestoneChecklistPanel;
