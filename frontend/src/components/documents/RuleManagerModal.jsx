import { useEffect, useState } from "react";
import { FaPlus, FaTimes, FaTrash } from "react-icons/fa";

const API = "http://localhost:5000/api";

const DOCUMENT_TYPES = ["Proposal", "Progress Report", "Final Report", "Presentation", "Other"];

const emptyMilestone = () => ({
    key: "",
    title: "",
    documentType: "Other",
    required: true,
    dueDate: "",
    allowedExtensions: ["pdf", "doc", "docx"],
    maxSizeMb: 50,
    minDescriptionLength: 0,
    requiresVersionNotes: false,
    enforceDeadline: false,
    notes: "",
});

const RuleManagerModal = ({ groupId, user, onClose, onSaved }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [milestones, setMilestones] = useState([]);

    useEffect(() => {
        const fetchRules = async () => {
            if (!groupId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");
                const res = await fetch(`${API}/documents/rules/${groupId}`);
                if (!res.ok) throw new Error("Failed to load rules");
                const data = await res.json();
                setMilestones((data.milestones || []).map((m) => ({
                    ...m,
                    dueDate: m.dueDate ? new Date(m.dueDate).toISOString().slice(0, 10) : "",
                })));
            } catch (err) {
                console.error(err);
                setError("Unable to load group rules.");
            }
            setLoading(false);
        };

        fetchRules();
    }, [groupId]);

    const updateMilestone = (index, field, value) => {
        setMilestones((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const addMilestone = () => {
        setMilestones((prev) => ([
            ...prev,
            {
                ...emptyMilestone(),
                key: `milestone_${prev.length + 1}`,
                title: `New Milestone ${prev.length + 1}`,
            }
        ]));
    };

    const removeMilestone = (index) => {
        setMilestones((prev) => prev.filter((_, i) => i !== index));
    };

    const saveRules = async () => {
        try {
            setSaving(true);
            setError("");

            const payload = milestones.map((item, index) => ({
                ...item,
                key: String(item.key || `milestone_${index + 1}`),
                title: String(item.title || `Milestone ${index + 1}`),
                dueDate: item.dueDate ? new Date(item.dueDate).toISOString() : null,
                allowedExtensions: Array.isArray(item.allowedExtensions)
                    ? item.allowedExtensions
                        .map((ext) => String(ext || "").trim().replace(".", "").toLowerCase())
                        .filter(Boolean)
                    : [],
            }));

            const res = await fetch(`${API}/documents/rules/${groupId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    milestones: payload,
                    updatedBy: user?.fullName || user?.username || "sponsor",
                }),
            });

            if (!res.ok) throw new Error("Failed to save rules");

            if (onSaved) onSaved();
            onClose();
        } catch (err) {
            console.error(err);
            setError("Unable to save rules.");
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#2F4F4F] to-[#3A5F5F] flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white">Submission Rules</h2>
                        <p className="text-sm text-gray-200">Configure milestone requirements for Group {groupId}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-white transition">
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3">
                    {loading ? (
                        <p className="text-sm text-gray-400">Loading rules...</p>
                    ) : (
                        <>
                            {milestones.map((item, index) => (
                                <div key={item.key || index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="font-semibold text-gray-700">Milestone {index + 1}</p>
                                        <button
                                            onClick={() => removeMilestone(index)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Remove milestone"
                                        >
                                            <FaTrash size={13} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                        <input
                                            value={item.title || ""}
                                            onChange={(e) => updateMilestone(index, "title", e.target.value)}
                                            placeholder="Milestone title"
                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                        <select
                                            value={item.documentType || "Other"}
                                            onChange={(e) => updateMilestone(index, "documentType", e.target.value)}
                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                                        >
                                            {DOCUMENT_TYPES.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="date"
                                            value={item.dueDate || ""}
                                            onChange={(e) => updateMilestone(index, "dueDate", e.target.value)}
                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.maxSizeMb || 50}
                                            onChange={(e) => updateMilestone(index, "maxSizeMb", Number(e.target.value))}
                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            placeholder="Max size MB"
                                        />
                                        <input
                                            type="number"
                                            min={0}
                                            value={item.minDescriptionLength || 0}
                                            onChange={(e) => updateMilestone(index, "minDescriptionLength", Number(e.target.value))}
                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            placeholder="Min description length"
                                        />
                                        <input
                                            value={(item.allowedExtensions || []).join(",")}
                                            onChange={(e) => updateMilestone(index, "allowedExtensions", e.target.value.split(","))}
                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            placeholder="Allowed extensions e.g. pdf,docx"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                        <label className="inline-flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(item.required)}
                                                onChange={(e) => updateMilestone(index, "required", e.target.checked)}
                                            />
                                            Required
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(item.requiresVersionNotes)}
                                                onChange={(e) => updateMilestone(index, "requiresVersionNotes", e.target.checked)}
                                            />
                                            Require version notes
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(item.enforceDeadline)}
                                                onChange={(e) => updateMilestone(index, "enforceDeadline", e.target.checked)}
                                            />
                                            Enforce deadline
                                        </label>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addMilestone}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2F4F4F] text-[#2F4F4F] hover:bg-[#2F4F4F]/5 transition"
                            >
                                <FaPlus size={12} />
                                Add Milestone
                            </button>

                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={saveRules}
                        disabled={saving || loading}
                        className={`px-5 py-2 rounded-lg text-white text-sm ${saving || loading ? "bg-gray-300" : "bg-[#2F4F4F] hover:bg-[#3A5F5F]"}`}
                    >
                        {saving ? "Saving..." : "Save Rules"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RuleManagerModal;
