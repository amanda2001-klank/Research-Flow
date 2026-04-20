import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
    FaClipboardList, FaCheckCircle, FaExclamationTriangle, FaClock,
    FaArrowLeft, FaSave, FaPaperPlane, FaLink, FaTimes, FaPlus,
    FaFileAlt, FaExternalLinkAlt, FaLock, FaCalendarAlt, FaRedo,
    FaChevronRight, FaUsers, FaCrown, FaHourglassHalf, FaUpload, FaSpinner
} from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";

const API = "http://localhost:5000/api/fortnight";
const AVATAR = (name, bg = "2F4F4F", fg = "FFD700") =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "M")}&background=${bg}&color=${fg}&bold=true&size=80`;

// ── Status config ─────────────────────────────────────────────────────────────
const CYCLE_STATUS = {
    PENDING:            { cls: "bg-gray-100 text-gray-500",     dot: "bg-gray-300",     label: "Pending",            gridCls: "bg-gray-100 border-gray-200 text-gray-400" },
    IN_PROGRESS:        { cls: "bg-blue-100 text-blue-700",     dot: "bg-blue-400",     label: "In Progress",        gridCls: "bg-blue-50 border-blue-300 text-blue-700" },
    SUBMITTED:          { cls: "bg-amber-100 text-amber-700",   dot: "bg-amber-400",    label: "Submitted",          gridCls: "bg-amber-50 border-amber-300 text-amber-700" },
    NEEDS_RESUBMISSION: { cls: "bg-red-100 text-red-600",       dot: "bg-red-400",      label: "Needs Resubmission", gridCls: "bg-red-50 border-red-300 text-red-600" },
    COMPLETED:          { cls: "bg-emerald-100 text-emerald-700",dot:"bg-emerald-400",  label: "Completed",          gridCls: "bg-emerald-50 border-emerald-300 text-emerald-700" },
};
const REPORT_STATUS = {
    draft:               { cls: "bg-gray-100 text-gray-500",      label: "Draft" },
    submitted:           { cls: "bg-blue-100 text-blue-700",      label: "Submitted" },
    approved:            { cls: "bg-emerald-100 text-emerald-700",label: "Approved" },
    needs_resubmission:  { cls: "bg-red-100 text-red-600",        label: "Needs Resubmission" },
};

const StatusBadge = ({ status, map }) => {
    const s = (map[status]) || { cls: "bg-gray-100 text-gray-500", label: status };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
};

const inputCls =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition";

// ── Evidence Links ────────────────────────────────────────────────────────────
const EvidenceLinks = ({ links, onChange, disabled }) => {
    const [input, setInput] = useState("");
    const add = () => {
        const v = input.trim();
        if (v && !links.includes(v)) { onChange([...links, v]); setInput(""); }
    };
    return (
        <div>
            {!disabled && (
                <div className="flex gap-2 mb-2">
                    <input type="url" placeholder="https://github.com/…" value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                            focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent" />
                    <button type="button" onClick={add}
                        className="px-4 py-2 bg-[#2F4F4F] text-white rounded-xl text-sm hover:bg-[#3A5F5F] transition">
                        <FaPlus size={11} />
                    </button>
                </div>
            )}
            {links.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {links.map((link, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100
                            text-blue-700 px-3 py-1.5 rounded-lg text-xs">
                            <FaLink size={9} />
                            <a href={link} target="_blank" rel="noreferrer"
                                className="hover:underline max-w-[180px] truncate">{link}</a>
                            {!disabled && (
                                <button onClick={() => onChange(links.filter((_, j) => j !== i))}
                                    className="ml-1 hover:text-red-500 transition"><FaTimes size={9} /></button>
                            )}
                        </div>
                    ))}
                </div>
            ) : disabled ? <p className="text-xs text-gray-400 italic">No evidence links.</p> : null}
        </div>
    );
};

// ── File Upload Field ─────────────────────────────────────────────────────────
const FileUploadField = ({ value, originalName, canEdit, onUploaded, onRemove }) => {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleFile = async (file) => {
        if (!file) return;
        setError("");
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await axios.post(`${API}/upload-file`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            onUploaded(res.data.url, res.data.originalName);
        } catch (e) {
            setError(e.response?.data?.error || "Upload failed. Max 10MB. PDF, Word, Excel, images allowed.");
        } finally {
            setUploading(false);
        }
    };

    const displayName = originalName || (value ? value.split("/").pop() : "");

    return (
        <div>
            {value ? (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                    <FaFileAlt size={14} className="text-blue-500 flex-shrink-0" />
                    <a href={value} target="_blank" rel="noreferrer"
                        className="text-sm text-blue-700 hover:underline truncate flex-1">
                        {displayName}
                    </a>
                    <a href={value} target="_blank" rel="noreferrer"
                        className="text-blue-400 hover:text-blue-600 flex-shrink-0">
                        <FaExternalLinkAlt size={10} />
                    </a>
                    {canEdit && (
                        <button type="button" onClick={onRemove}
                            className="text-gray-400 hover:text-red-500 transition flex-shrink-0">
                            <FaTimes size={12} />
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt"
                        disabled={!canEdit || uploading}
                        onChange={e => handleFile(e.target.files[0])}
                    />
                    <button
                        type="button"
                        disabled={!canEdit || uploading}
                        onClick={() => inputRef.current?.click()}
                        className={`flex items-center gap-2 w-full border-2 border-dashed rounded-xl px-4 py-3 text-sm transition
                            ${!canEdit ? "opacity-60 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50"
                                : "border-gray-300 text-gray-500 bg-gray-50 hover:border-[#FFD700] hover:text-[#2F4F4F] cursor-pointer"}`}
                    >
                        {uploading
                            ? <><FaSpinner size={14} className="animate-spin" /> Uploading…</>
                            : <><FaUpload size={14} /> Click to upload a file (PDF, Word, Excel, image…)</>
                        }
                    </button>
                </div>
            )}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
const LeaderView = ({ user, groupId }) => {
    const [view, setView] = useState("dashboard");
    const [dashData, setDashData] = useState(null);
    const [cycles, setCycles] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [reportForms, setReportForms] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ msg: "", type: "success" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [showValidation, setShowValidation] = useState(false);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
    };

    const loadDashboard = useCallback(async () => {
        try {
            const [d, c, m] = await Promise.all([
                axios.get(`${API}/leader-dashboard/${groupId}`),
                axios.get(`${API}/cycles/${groupId}`),
                axios.get(`${API}/members/${groupId}`),
            ]);
            setDashData(d.data); setCycles(c.data); setMembers(m.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [groupId]);

    useEffect(() => { loadDashboard(); }, [loadDashboard]);

    const openCycle = async (cycleId) => {
        setError("");
        try {
            const res = await axios.get(`${API}/cycle/${cycleId}`);
            setSelectedCycle(res.data);
            const forms = {};
            members.forEach(member => {
                const ex = res.data.cycle.memberReports?.find(
                    r => (r.groupMemberId?._id || r.groupMemberId) === member._id
                );
                forms[member._id] = {
                    _id: ex?._id || null,
                    studentId: member.studentId,
                    studentName: member.studentName,
                    researchDescription: ex?.researchDescription || "",
                    timeSpent: ex?.timeSpent ?? 0,
                    evidenceLinks: ex?.evidenceLinks || [],
                    fileAttachment: ex?.fileAttachment || "",
                    fileAttachmentName: ex?.fileAttachmentName || "",
                    status: ex?.status || "draft",
                };
            });
            setReportForms(forms);
            setView("cycle");
        } catch { setError("Failed to load cycle."); }
    };

    const updateForm = (id, field, val) =>
        setReportForms(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));

    const buildPayload = () => members.map(m => ({
        groupMemberId: m._id,
        studentId: m.studentId,
        studentName: m.studentName,
        researchDescription: reportForms[m._id]?.researchDescription || "",
        timeSpent: reportForms[m._id]?.timeSpent || 0,
        evidenceLinks: reportForms[m._id]?.evidenceLinks || [],
        fileAttachment: reportForms[m._id]?.fileAttachment || "",
        fileAttachmentName: reportForms[m._id]?.fileAttachmentName || "",
    }));

    const saveDraft = async () => {
        setSaving(true); setError("");
        try {
            await axios.post(`${API}/save-draft`, { cycleId: selectedCycle.cycle._id, reports: buildPayload() });
            const res = await axios.get(`${API}/cycle/${selectedCycle.cycle._id}`);
            setSelectedCycle(res.data);
            showToast("Draft saved!");
        } catch (e) { setError(e.response?.data?.message || "Failed to save draft."); }
        finally { setSaving(false); }
    };

    const submitFortnight = async () => {
        setSubmitting(true); setError("");
        try {
            await axios.post(`${API}/save-draft`, { cycleId: selectedCycle.cycle._id, reports: buildPayload() });
            await axios.post(`${API}/submit`, { cycleId: selectedCycle.cycle._id, leaderId: user._id });
            showToast("Cycle submitted to supervisor!");
            await loadDashboard();
            const res = await axios.get(`${API}/cycle/${selectedCycle.cycle._id}`);
            setSelectedCycle(res.data);
        } catch (e) { setError(e.response?.data?.message || "Failed to submit."); }
        finally { setSubmitting(false); }
    };

    const resubmitReport = async (memberId) => {
        setError("");
        try {
            const form = reportForms[memberId];
            const report = selectedCycle.cycle.memberReports?.find(
                r => (r.groupMemberId?._id || r.groupMemberId) === memberId
            );
            if (!report) return;
            await axios.post(`${API}/resubmit`, {
                cycleId: selectedCycle.cycle._id, memberReportId: report._id,
                researchDescription: form.researchDescription, timeSpent: form.timeSpent,
                evidenceLinks: form.evidenceLinks, fileAttachment: form.fileAttachment,
                fileAttachmentName: form.fileAttachmentName,
            });
            showToast("Report resubmitted successfully!");
            const res = await axios.get(`${API}/cycle/${selectedCycle.cycle._id}`);
            setSelectedCycle(res.data);
            updateForm(memberId, "status", "submitted");
        } catch (e) { setError(e.response?.data?.message || "Resubmit failed."); }
    };

    const handleSubmitClick = () => {
        if (!allFilled) {
            setShowValidation(true);
            return;
        }
        setShowValidation(false);
        submitFortnight();
    };

    const cycleStatus = selectedCycle?.cycle?.status;
    const isResubmission = cycleStatus === "NEEDS_RESUBMISSION";
    const isEditable = cycleStatus === "IN_PROGRESS" || isResubmission;
    const allFilled = members.length === 4 &&
        members.every(m => reportForms[m._id]?.researchDescription?.trim().length > 0);
    const filledCount = members.filter(m => reportForms[m._id]?.researchDescription?.trim().length > 0).length;

    // ── Toast ─────────────────────────────────────────────────────────────────
    const ToastEl = toast.msg && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3
            rounded-2xl shadow-xl text-sm font-semibold transition-all
            ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
            <FaCheckCircle size={14} /> {toast.msg}
        </div>
    );

    // ════════════════════════════════════════════════════════════════════════════
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#2F4F4F] flex items-center justify-center">
                        <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Loading your fortnight data…</p>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════════════
    // CYCLE DETAIL VIEW
    // ════════════════════════════════════════════════════════════════════════════
    if (view === "cycle" && selectedCycle) {
        const { cycle, feedbacks, verification } = selectedCycle;
        return (
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                {ToastEl}

                {/* ── Sticky Header ── */}
                <div className="bg-white border-b border-gray-100 shadow-sm px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <button onClick={() => { setView("dashboard"); loadDashboard(); }}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#2F4F4F] transition text-sm font-medium">
                        <FaArrowLeft size={12} /> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">Group</span>
                        <span className="bg-[#2F4F4F] text-white text-xs font-bold px-3 py-1 rounded-full">
                            {cycle.groupId}
                        </span>
                        <StatusBadge status={cycle.status} map={CYCLE_STATUS} />
                    </div>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-8 py-7">

                        {/* ── Cycle Hero ── */}
                        <div className="bg-gradient-to-r from-[#2F4F4F] to-[#3A5F5F] rounded-2xl p-6 mb-6 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-1">
                                        Fortnight Cycle
                                    </p>
                                    <h2 className="text-3xl font-bold">
                                        Cycle {cycle.cycleNumber}
                                        <span className="text-white/40 text-lg font-normal ml-2">/ 24</span>
                                    </h2>
                                    <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5">
                                        <FaCalendarAlt size={11} />
                                        {new Date(cycle.startDate).toDateString()} — {new Date(cycle.endDate).toDateString()}
                                    </p>
                                </div>
                                {/* Reports progress */}
                                <div className="bg-white/10 rounded-2xl p-4 text-center min-w-[90px]">
                                    <p className="text-2xl font-bold">{cycle.memberReports?.length || 0}<span className="text-white/50 text-base">/4</span></p>
                                    <p className="text-white/60 text-xs mt-0.5">Reports</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Status Banners ── */}
                        {cycleStatus === "SUBMITTED" && (
                            <div className="flex items-center gap-3 bg-amber-50 border-l-4 border-amber-400
                                rounded-xl p-4 mb-5 text-amber-800 text-sm">
                                <FaHourglassHalf className="text-amber-400 flex-shrink-0" />
                                <p>Submitted. Awaiting supervisor review — no edits allowed.</p>
                            </div>
                        )}
                        {cycleStatus === "COMPLETED" && (
                            <div className="flex items-center gap-3 bg-emerald-50 border-l-4 border-emerald-400
                                rounded-xl p-4 mb-5 text-emerald-800 text-sm">
                                <FaLock className="text-emerald-400 flex-shrink-0" />
                                <p><strong>Cycle completed and locked.</strong> All reports approved by supervisor.</p>
                            </div>
                        )}
                        {isResubmission && (
                            <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-400
                                rounded-xl p-4 mb-5 text-red-800 text-sm">
                                <FaExclamationTriangle className="text-red-400 flex-shrink-0" />
                                <p>Supervisor requested corrections. Edit the flagged reports, then resubmit.</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-5 text-sm">
                                {error}
                            </div>
                        )}

                        {/* ── Validation Alert ── */}
                        {showValidation && !allFilled && (
                            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                                <FaExclamationTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={15} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-red-800 mb-1.5">
                                        Complete all reports before submitting
                                    </p>
                                    <ul className="space-y-1">
                                        {members
                                            .filter(m => !reportForms[m._id]?.researchDescription?.trim())
                                            .map(m => (
                                                <li key={m._id} className="flex items-center gap-2 text-xs text-red-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                                    <span className="font-semibold">{m.studentName}</span>
                                                    {" "}— Research Work Description is required
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                                <button onClick={() => setShowValidation(false)}
                                    className="text-red-300 hover:text-red-500 transition flex-shrink-0">
                                    <FaTimes size={13} />
                                </button>
                            </div>
                        )}

                        {/* ── 4 Member Report Cards ── */}
                        {members.map((member) => {
                            const form = reportForms[member._id] || {};
                            const memberNeedsResub = form.status === "needs_resubmission";
                            const memberApproved = form.status === "approved";
                            const canEdit = isEditable && (
                                cycleStatus === "IN_PROGRESS" ||
                                (isResubmission && memberNeedsResub)
                            );
                            const reportId = cycle.memberReports?.find(
                                r => (r.groupMemberId?._id || r.groupMemberId) === member._id
                            )?._id;
                            const memberFeedbacks = feedbacks?.filter(
                                f => f.memberReportId?._id === reportId || f.memberReportId === reportId
                            ) || [];

                            return (
                                <div key={member._id}
                                    className={`bg-white rounded-2xl border shadow-sm mb-5 overflow-hidden transition
                                        ${memberApproved ? "border-emerald-200" : memberNeedsResub ? "border-red-200" : "border-gray-100"}`}>

                                    {/* Card header */}
                                    <div className={`flex items-center justify-between px-6 py-4 border-b
                                        ${memberApproved ? "bg-emerald-50 border-emerald-100"
                                            : memberNeedsResub ? "bg-red-50 border-red-100"
                                                : "bg-gray-50 border-gray-100"}`}>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={AVATAR(member.studentName, member.isLeader ? "FFD700" : "2F4F4F", member.isLeader ? "2F4F4F" : "FFD700")}
                                                alt="" className="w-9 h-9 rounded-full border-2 border-white shadow-sm" />
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                                    {member.studentName}
                                                    {member.isLeader && (
                                                        <span className="flex items-center gap-1 text-xs bg-[#FFD700]
                                                            text-[#2F4F4F] px-2 py-0.5 rounded-full font-bold">
                                                            <FaCrown size={8} /> Leader
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-400">{member.studentId}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {memberApproved && <FaCheckCircle className="text-emerald-500" size={16} />}
                                            <StatusBadge status={form.status || "draft"} map={REPORT_STATUS} />
                                        </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="p-6 space-y-5">
                                        {/* Research Description */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                Research Work Description <span className="text-red-400">*</span>
                                            </label>
                                            <textarea rows={4} disabled={!canEdit}
                                                placeholder="Describe the research work completed during this fortnight…"
                                                value={form.researchDescription}
                                                onChange={e => updateForm(member._id, "researchDescription", e.target.value)}
                                                className={`${inputCls} resize-none
                                                    ${!canEdit ? "opacity-60 cursor-not-allowed bg-gray-100" : ""}
                                                    ${showValidation && !form.researchDescription?.trim() ? "border-red-400 ring-2 ring-red-100" : ""}`} />
                                            {canEdit && (
                                                <p className={`text-xs mt-1 ${
                                                    form.researchDescription?.trim()
                                                        ? "text-emerald-500"
                                                        : showValidation
                                                            ? "text-red-500 font-semibold"
                                                            : "text-gray-400"
                                                }`}>
                                                    {form.researchDescription?.trim()
                                                        ? `${form.researchDescription.trim().split(/\s+/).length} words`
                                                        : showValidation
                                                            ? "Required — please fill in the research work description"
                                                            : "Required — fill in research work for this fortnight"}
                                                </p>
                                            )}
                                        </div>

                                        {/* Time + File URL row */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                    Time Spent (hours)
                                                </label>
                                                <input type="number" min={0} disabled={!canEdit}
                                                    placeholder="0"
                                                    value={form.timeSpent}
                                                    onChange={e => updateForm(member._id, "timeSpent", Number(e.target.value))}
                                                    className={`${inputCls} ${!canEdit ? "opacity-60 cursor-not-allowed bg-gray-100" : ""}`} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                    Document / File <span className="font-normal normal-case">(optional)</span>
                                                </label>
                                                <FileUploadField
                                                    memberId={member._id}
                                                    value={form.fileAttachment}
                                                    originalName={form.fileAttachmentName}
                                                    canEdit={canEdit}
                                                    onUploaded={(url, originalName) => {
                                                        updateForm(member._id, "fileAttachment", url);
                                                        updateForm(member._id, "fileAttachmentName", originalName);
                                                    }}
                                                    onRemove={() => {
                                                        updateForm(member._id, "fileAttachment", "");
                                                        updateForm(member._id, "fileAttachmentName", "");
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Evidence Links */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                Evidence Links
                                                <span className="font-normal normal-case text-gray-400 ml-1">(GitHub, Drive, etc.)</span>
                                            </label>
                                            <EvidenceLinks
                                                links={form.evidenceLinks || []}
                                                onChange={l => updateForm(member._id, "evidenceLinks", l)}
                                                disabled={!canEdit}
                                            />
                                        </div>

                                        {/* Supervisor Feedback */}
                                        {memberFeedbacks.length > 0 && (
                                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">
                                                    Supervisor Feedback
                                                </p>
                                                {memberFeedbacks.map(fb => (
                                                    <div key={fb._id} className="flex gap-3 mb-2 last:mb-0">
                                                        <div className="w-1 bg-amber-300 rounded-full flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-800">{fb.comment}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {fb.supervisorId?.fullName || "Supervisor"} · {new Date(fb.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Resubmit button */}
                                        {isResubmission && memberNeedsResub && (
                                            <button onClick={() => resubmitReport(member._id)}
                                                className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5
                                                    rounded-xl text-sm font-semibold hover:bg-red-600 active:scale-[.98] transition">
                                                <FaRedo size={11} /> Resubmit This Report
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Verification badge */}
                        {verification && (
                            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200
                                rounded-2xl p-5 mb-5">
                                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FaCheckCircle className="text-white text-xl" />
                                </div>
                                <div>
                                    <p className="font-bold text-emerald-800">Cycle Verified & Completed</p>
                                    <p className="text-xs text-emerald-600 mt-0.5">
                                        Verified on {new Date(verification.verifiedAt).toLocaleString()}
                                        {verification.notes && ` · "${verification.notes}"`}
                                    </p>
                                    {verification.signatureData && (
                                        verification.signatureData.startsWith("data:image")
                                            ? <img src={verification.signatureData} alt="Supervisor Signature"
                                                className="mt-2 h-10 bg-white border border-emerald-100 rounded-lg px-2 py-1" />
                                            : <p className="text-xs text-emerald-600 mt-0.5">{verification.signatureData}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Bottom padding for sticky bar */}
                        <div className="h-4" />
                    </div>
                </div>

                {/* ── Sticky Bottom Action Bar ── */}
                {isEditable && !isResubmission && (
                    <div className="bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-8 py-4 flex-shrink-0">
                        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                            {/* Fill progress */}
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    {Array.from({ length: 4 }, (_, i) => (
                                        <div key={i}
                                            className={`w-7 h-2 rounded-full transition-all ${i < filledCount ? "bg-[#2F4F4F]" : "bg-gray-200"}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500">
                                    <span className={`font-bold ${filledCount === 4 ? "text-emerald-600" : "text-gray-800"}`}>
                                        {filledCount}/4
                                    </span> reports filled
                                </p>
                            </div>
                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button onClick={saveDraft} disabled={saving}
                                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5
                                        rounded-xl font-semibold hover:bg-gray-200 active:scale-[.98]
                                        transition disabled:opacity-40 text-sm">
                                    {saving
                                        ? <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                        : <FaSave size={13} />}
                                    Save Draft
                                </button>
                                <button onClick={handleSubmitClick} disabled={submitting}
                                    className="flex items-center gap-2 bg-[#2F4F4F] text-white px-6 py-2.5
                                        rounded-xl font-semibold hover:bg-[#3A5F5F] active:scale-[.98]
                                        transition disabled:opacity-40 text-sm shadow-sm">
                                    {submitting
                                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : <FaPaperPlane size={13} />}
                                    Submit Fortnight Report
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════════════
    // DASHBOARD VIEW
    // ════════════════════════════════════════════════════════════════════════════
    const completed = dashData?.completedCycles?.length || 0;
    const total = dashData?.totalCycles || 24;
    const pendingCorrections = dashData?.pendingCorrections?.length || 0;
    const progressPct = Math.round((completed / total) * 100);
    const currentCycle = dashData?.currentCycle;

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            {ToastEl}

            {/* ── Hero Banner ── */}
            <div className="bg-gradient-to-br from-[#1e3a3a] via-[#2F4F4F] to-[#3d6060] px-10 py-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-1">
                                Fortnight Log
                            </p>
                            <h1 className="text-2xl font-bold text-white">{groupId}</h1>
                            <p className="text-white/50 text-sm mt-0.5">
                                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-5xl font-bold text-white">{progressPct}<span className="text-2xl text-white/50">%</span></p>
                            <p className="text-white/50 text-xs mt-0.5">Research Year Complete</p>
                        </div>
                    </div>
                    {/* Year progress bar */}
                    <div>
                        <div className="flex justify-between text-xs text-white/40 mb-1.5">
                            <span>Start</span>
                            <span className="text-white/60">{completed} / {total} cycles completed</span>
                            <span>End</span>
                        </div>
                        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#FFD700] to-[#fbbf24] rounded-full transition-all duration-700"
                                style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-7 space-y-6">

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Current Cycle */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 rounded-l-2xl" />
                        <div className="flex items-center justify-between mb-3 pl-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Cycle</p>
                            <div className="p-1.5 bg-blue-50 rounded-lg"><FaClock className="text-blue-400" size={13} /></div>
                        </div>
                        {currentCycle ? (
                            <div className="pl-2">
                                <p className="text-3xl font-bold text-gray-800">{currentCycle.cycleNumber}</p>
                                <div className="mt-2"><StatusBadge status={currentCycle.status} map={CYCLE_STATUS} /></div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm pl-2">All cycles complete!</p>
                        )}
                    </div>

                    {/* Pending Corrections */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${pendingCorrections > 0 ? "bg-red-400" : "bg-gray-200"}`} />
                        <div className="flex items-center justify-between mb-3 pl-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Corrections</p>
                            <div className={`p-1.5 rounded-lg ${pendingCorrections > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                                <FaExclamationTriangle className={pendingCorrections > 0 ? "text-red-400" : "text-gray-300"} size={13} />
                            </div>
                        </div>
                        <div className="pl-2">
                            <p className={`text-3xl font-bold ${pendingCorrections > 0 ? "text-red-600" : "text-gray-300"}`}>
                                {pendingCorrections}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {pendingCorrections > 0 ? "cycles need resubmission" : "no corrections needed"}
                            </p>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 rounded-l-2xl" />
                        <div className="flex items-center justify-between mb-3 pl-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Completed</p>
                            <div className="p-1.5 bg-emerald-50 rounded-lg"><FaCheckCircle className="text-emerald-400" size={13} /></div>
                        </div>
                        <div className="pl-2">
                            <p className="text-3xl font-bold text-gray-800">{completed}</p>
                            <p className="text-xs text-gray-400 mt-1">of {total} total cycles</p>
                        </div>
                    </div>
                </div>

                {/* ── Team Members ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <FaUsers className="text-[#FFD700]" /> Research Team
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                        {members.map((m) => (
                            <div key={m._id}
                                className={`flex flex-col items-center p-4 rounded-2xl border text-center transition hover:shadow-sm
                                    ${m.isLeader ? "border-[#FFD700] bg-gradient-to-b from-yellow-50 to-white" : "border-gray-100 bg-gray-50"}`}>
                                <div className="relative mb-2">
                                    <img src={AVATAR(m.studentName, m.isLeader ? "FFD700" : "2F4F4F", m.isLeader ? "2F4F4F" : "FFD700")}
                                        alt="" className="w-12 h-12 rounded-full border-2 border-white shadow" />
                                    {m.isLeader && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFD700] rounded-full flex items-center justify-center">
                                            <FaCrown size={8} className="text-[#2F4F4F]" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-gray-800 truncate w-full">{m.studentName}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{m.studentId}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── 24-Cycle Visual Grid ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <FaCalendarAlt className="text-[#FFD700]" /> 24 Fortnight Cycles
                        </h3>
                        {/* Legend */}
                        <div className="flex items-center gap-3 flex-wrap justify-end">
                            {Object.entries(CYCLE_STATUS).map(([key, v]) => (
                                <div key={key} className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${v.dot}`} />
                                    <span className="text-xs text-gray-400">{v.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                        {cycles.map(cycle => {
                            const s = CYCLE_STATUS[cycle.status] || CYCLE_STATUS.PENDING;
                            const isClickable = cycle.status !== "PENDING";
                            const icon = cycle.status === "COMPLETED" ? "✓"
                                : cycle.status === "IN_PROGRESS" ? "●"
                                    : cycle.status === "SUBMITTED" ? "…"
                                        : cycle.status === "NEEDS_RESUBMISSION" ? "!" : "";
                            return (
                                <div key={cycle._id}
                                    onClick={() => isClickable && openCycle(cycle._id)}
                                    title={`Cycle ${cycle.cycleNumber} · ${s.label}\n${new Date(cycle.startDate).toLocaleDateString()} – ${new Date(cycle.endDate).toLocaleDateString()}`}
                                    className={`relative flex flex-col items-center justify-center h-14 rounded-xl border-2
                                        transition-all duration-200 select-none
                                        ${s.gridCls}
                                        ${isClickable
                                            ? "cursor-pointer hover:scale-105 hover:shadow-md hover:z-10"
                                            : "cursor-default opacity-40"
                                        }`}>
                                    <span className="text-sm font-bold leading-tight">{cycle.cycleNumber}</span>
                                    {icon && <span className="text-xs leading-tight opacity-70">{icon}</span>}
                                    {isClickable && (
                                        <div className="absolute bottom-1 right-1.5 opacity-40">
                                            <FaChevronRight size={7} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-xs text-gray-400 mt-4 text-center">
                        Click any active cycle to open and manage member reports
                    </p>
                </div>

                {/* ── Active / Needs-Action Cycles Quick List ── */}
                {cycles.filter(c => ["IN_PROGRESS", "NEEDS_RESUBMISSION"].includes(c.status)).length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <MdOutlineAssignment className="text-[#FFD700]" size={16} />
                            Action Required
                        </h3>
                        <div className="space-y-2">
                            {cycles.filter(c => ["IN_PROGRESS", "NEEDS_RESUBMISSION"].includes(c.status)).map(cycle => (
                                <div key={cycle._id}
                                    onClick={() => openCycle(cycle._id)}
                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100
                                        bg-gray-50 hover:border-[#FFD700] hover:bg-white hover:shadow-sm cursor-pointer transition">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                                            ${cycle.status === "NEEDS_RESUBMISSION" ? "bg-red-500 text-white" : "bg-[#2F4F4F] text-white"}`}>
                                            {cycle.cycleNumber}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Cycle {cycle.cycleNumber}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(cycle.startDate).toLocaleDateString()} — {new Date(cycle.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={cycle.status} map={CYCLE_STATUS} />
                                        <FaChevronRight size={12} className="text-gray-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderView;
