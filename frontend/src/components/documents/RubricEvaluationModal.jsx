import { useState, useEffect } from "react";
import { FaTimes, FaStar, FaCalculator } from "react-icons/fa";

const API = "http://localhost:5000/api";

const DEFAULT_CRITERIA = [
    { name: "Problem Definition", weight: 15, score: 0, feedback: '' },
    { name: "Literature Review", weight: 15, score: 0, feedback: '' },
    { name: "Methodology", weight: 25, score: 0, feedback: '' },
    { name: "Innovation & Originality", weight: 15, score: 0, feedback: '' },
    { name: "Documentation Quality", weight: 15, score: 0, feedback: '' },
    { name: "Presentation", weight: 15, score: 0, feedback: '' },
];

const RubricEvaluationModal = ({ document: doc, user, onClose, onSuccess }) => {
    const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
    const [generalFeedback, setGeneralFeedback] = useState('');
    const [members, setMembers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [existingEval, setExistingEval] = useState(null);

    // Fetch existing evaluation if any
    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const res = await fetch(`${API}/evaluations/document/${doc._id}`);
                if (res.ok) {
                    const data = await res.json();
                    setExistingEval(data);
                    if (data.criteria?.length > 0) setCriteria(data.criteria);
                    if (data.generalFeedback) setGeneralFeedback(data.generalFeedback);
                    if (data.individualMarks?.length > 0) {
                        setMembers(data.individualMarks.map(im => ({
                            studentName: im.studentName,
                            studentId: im.studentId,
                            contribution: im.contribution
                        })));
                    }
                }
            } catch (err) { /* no existing eval */ }
        };
        fetchExisting();
    }, [doc._id]);

    // Fetch group members
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch(`${API}/fortnight/groups`);
                if (res.ok) {
                    const groups = await res.json();
                    const group = groups.find(g => g.groupId === doc.groupId);
                    if (group?.members && members.length === 0) {
                        setMembers(group.members.map(m => ({
                            studentName: m.studentName,
                            studentId: m.studentId,
                            contribution: 100
                        })));
                    }
                }
            } catch (err) { console.error(err); }
        };
        if (!existingEval) fetchMembers();
    }, [doc.groupId, existingEval]);

    const totalMark = criteria.reduce((sum, c) => sum + (c.score * c.weight / 100), 0);

    const updateCriterion = (index, field, value) => {
        const updated = [...criteria];
        updated[index] = { ...updated[index], [field]: value };
        setCriteria(updated);
    };

    const updateMemberContribution = (index, contribution) => {
        const updated = [...members];
        updated[index] = { ...updated[index], contribution: Number(contribution) };
        setMembers(updated);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/evaluations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId: doc._id,
                    groupId: doc.groupId,
                    evaluatorId: user?.username || 'supervisor',
                    evaluatorName: user?.fullName || user?.username || 'Supervisor',
                    criteria,
                    generalFeedback,
                    individualMarks: members
                })
            });
            if (!res.ok) throw new Error('Submission failed');
            onSuccess();
        } catch (err) {
            console.error(err);
            alert("Failed to submit evaluation. Please try again.");
        }
        setSubmitting(false);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        if (score >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto my-2 sm:my-0 max-h-[calc(100vh-1rem)] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#2F4F4F] to-[#3A5F5F] flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white">Rubric Evaluation</h2>
                        <p className="text-sm text-gray-300 mt-0.5">{doc.title} — Group: {doc.groupId}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-white transition">
                        <FaTimes size={18} />
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
                    {/* Live Total */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/30 rounded-2xl px-8 py-4 text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Mark</p>
                            <p className={`text-4xl font-bold ${getScoreColor(totalMark)}`}>{totalMark.toFixed(1)}</p>
                            <p className="text-xs text-gray-400">out of 100</p>
                        </div>
                    </div>

                    {/* Rubric Criteria */}
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaStar className="text-[#FFD700]" size={14} />
                        Grading Criteria
                    </h3>
                    <div className="space-y-4 mb-6">
                        {criteria.map((c, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className="font-medium text-gray-700">{c.name}</span>
                                        <span className="text-xs text-gray-400 ml-2">Weight: {c.weight}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={c.score}
                                            onChange={e => updateCriterion(i, 'score', Math.min(100, Math.max(0, Number(e.target.value))))}
                                            className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-center text-sm font-semibold focus:outline-none focus:border-[#2F4F4F]"
                                        />
                                        <span className="text-sm text-gray-400">/ 100</span>
                                    </div>
                                </div>
                                {/* Score bar */}
                                <div className="w-full bg-gray-200 h-1.5 rounded-full mb-3">
                                    <div
                                        className="h-1.5 rounded-full bg-gradient-to-r from-[#2F4F4F] to-[#FFD700] transition-all"
                                        style={{ width: `${c.score}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <input
                                        type="text"
                                        value={c.feedback}
                                        onChange={e => updateCriterion(i, 'feedback', e.target.value)}
                                        placeholder="Feedback for this criterion..."
                                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#2F4F4F]"
                                    />
                                    <span className={`text-sm font-semibold ml-3 ${getScoreColor(c.score)}`}>
                                        {(c.score * c.weight / 100).toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* General Feedback */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">General Feedback</h3>
                        <textarea
                            value={generalFeedback}
                            onChange={e => setGeneralFeedback(e.target.value)}
                            rows={3}
                            placeholder="Overall feedback for this submission..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2F4F4F] resize-none"
                        />
                    </div>

                    {/* Individual Contribution */}
                    {members.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Individual Contribution (%)</h3>
                            <div className="space-y-2">
                                {members.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                        <div>
                                            <span className="font-medium text-gray-700 text-sm">{m.studentName}</span>
                                            <span className="text-xs text-gray-400 ml-2">{m.studentId}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={m.contribution}
                                                onChange={e => updateMemberContribution(i, e.target.value)}
                                                className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-center text-sm focus:outline-none focus:border-[#2F4F4F]"
                                            />
                                            <span className="text-xs text-gray-400">%</span>
                                            <span className="text-sm font-semibold text-[#2F4F4F] w-16 text-right">
                                                {(totalMark * m.contribution / 100).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaCalculator size={13} />
                        <span>Auto-calculated: <strong className={getScoreColor(totalMark)}>{totalMark.toFixed(1)}/100</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-200 transition">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={`px-6 py-2 rounded-xl font-medium text-white transition-all ${submitting
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-[#2F4F4F] hover:bg-[#3A5F5F] shadow-md hover:shadow-lg'}`}
                        >
                            {submitting ? 'Submitting...' : (existingEval ? 'Update Evaluation' : 'Submit Evaluation')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RubricEvaluationModal;
