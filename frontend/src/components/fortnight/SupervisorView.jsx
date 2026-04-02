import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
    FaClipboardCheck, FaArrowLeft, FaCheckCircle, FaExclamationTriangle,
    FaClock, FaThumbsUp, FaCommentAlt, FaLink,
    FaFileAlt, FaExternalLinkAlt, FaSignature, FaCalendarAlt,
    FaChevronRight, FaTimes, FaRedo, FaCrown, FaUsers, FaSearch
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const API = "http://localhost:5000/api/fortnight";
const AVATAR = (name, bg = "2F4F4F", fg = "FFD700") =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "M")}&background=${bg}&color=${fg}&bold=true&size=80`;

// ── Status maps ───────────────────────────────────────────────────────────────
const CYCLE_STATUS = {
    PENDING:            { cls: "bg-gray-100 text-gray-500",      label: "Pending",            accentCls: "bg-gray-300" },
    IN_PROGRESS:        { cls: "bg-blue-100 text-blue-700",      label: "In Progress",        accentCls: "bg-blue-400" },
    SUBMITTED:          { cls: "bg-amber-100 text-amber-700",    label: "Submitted",          accentCls: "bg-amber-400" },
    NEEDS_RESUBMISSION: { cls: "bg-red-100 text-red-600",        label: "Needs Resubmission", accentCls: "bg-red-400" },
    COMPLETED:          { cls: "bg-emerald-100 text-emerald-700",label: "Completed",          accentCls: "bg-emerald-400" },
};
const REPORT_STATUS = {
    draft:              { cls: "bg-gray-100 text-gray-500",       label: "Draft" },
    submitted:          { cls: "bg-blue-100 text-blue-700",       label: "Submitted" },
    approved:           { cls: "bg-emerald-100 text-emerald-700", label: "Approved" },
    needs_resubmission: { cls: "bg-red-100 text-red-600",         label: "Needs Resubmission" },
};

const StatusBadge = ({ status, map }) => {
    const s = map[status] || { cls: "bg-gray-100 text-gray-500", label: status };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
};

const TABS = [
    { key: "pending",      label: "Pending Review",  icon: <FaClock size={12} />,            emptyMsg: "No pending submissions." },
    { key: "resubmission", label: "Resubmission",    icon: <FaRedo size={12} />,             emptyMsg: "No cycles awaiting resubmission." },
    { key: "completed",    label: "Completed",        icon: <FaCheckCircle size={12} />,      emptyMsg: "No completed cycles yet." },
];

// ── Approval dots (mini progress indicator) ───────────────────────────────────
const ApprovalDots = ({ reports }) => {
    const approved = reports?.filter(r => r.status === "approved").length || 0;
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all
                    ${i < approved ? "bg-emerald-500" : "bg-gray-200"}`} />
            ))}
            <span className="text-xs text-gray-400 ml-1">{approved}/4</span>
        </div>
    );
};

// ── Signature Pad ─────────────────────────────────────────────────────────────
const SIG_KEY = "researchflow_supervisor_sig";

const SignaturePad = ({ onSignatureChange }) => {
    const canvasRef = useRef(null);
    const drawing = useRef(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [hasSaved, setHasSaved] = useState(!!localStorage.getItem(SIG_KEY));

    function paintToCanvas(dataUrl) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = dataUrl;
    }

    useEffect(() => {
        const saved = localStorage.getItem(SIG_KEY);
        if (saved) {
            paintToCanvas(saved);
            onSignatureChange(saved);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsEmpty(false);
        }
    }, []);

    const getXY = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const src = e.touches ? e.touches[0] : e;
        return {
            x: (src.clientX - rect.left) * (canvas.width / rect.width),
            y: (src.clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const startDraw = (e) => {
        e.preventDefault();
        const ctx = canvasRef.current.getContext("2d");
        const { x, y } = getXY(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        drawing.current = true;
    };

    const draw = (e) => {
        if (!drawing.current) return;
        e.preventDefault();
        const ctx = canvasRef.current.getContext("2d");
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#1e293b";
        const { x, y } = getXY(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const endDraw = () => {
        if (!drawing.current) return;
        drawing.current = false;
        setIsEmpty(false);
        onSignatureChange(canvasRef.current.toDataURL("image/png"));
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        onSignatureChange("");
    };

    const handleSave = () => {
        const dataUrl = canvasRef.current.toDataURL("image/png");
        localStorage.setItem(SIG_KEY, dataUrl);
        setHasSaved(true);
    };

    const handleLoad = () => {
        const saved = localStorage.getItem(SIG_KEY);
        if (saved) {
            paintToCanvas(saved);
            setIsEmpty(false);
            onSignatureChange(saved);
        }
    };

    return (
        <div className="space-y-2">
            <canvas
                ref={canvasRef}
                width={560}
                height={130}
                style={{ touchAction: "none" }}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl bg-white cursor-crosshair"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
            />
            <p className="text-xs text-gray-400 text-center italic">
                Draw your signature above using mouse or touchscreen
            </p>
            <div className="flex items-center gap-2 flex-wrap">
                <button type="button" onClick={handleClear}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                        bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
                    <FaTimes size={9} /> Clear
                </button>
                <button type="button" onClick={handleSave} disabled={isEmpty}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                        bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100
                        transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <FaCheckCircle size={9} /> Save Signature
                </button>
                {hasSaved && (
                    <button type="button" onClick={handleLoad}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                            bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                        <FaFileAlt size={9} /> Load Saved
                    </button>
                )}
                {hasSaved && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <FaCheckCircle size={9} /> Signature saved
                    </span>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
const SupervisorView = ({ user }) => {
    const [view, setView] = useState("dashboard");
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [dashData, setDashData] = useState(null);
    const [cycleDetail, setCycleDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ msg: "", type: "success" });
    const [error, setError] = useState("");
    const [feedbackForms, setFeedbackForms] = useState({});
    const [showVerify, setShowVerify] = useState(false);
    const [verifyForm, setVerifyForm] = useState({ signatureData: "", notes: "" });
    const [verifying, setVerifying] = useState(false);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
    };

    const loadDashboard = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/supervisor-dashboard/${user._id}`);
            setDashData(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [user._id]);

    useEffect(() => { loadDashboard(); }, [loadDashboard]);

    const openCycle = async (cycleId) => {
        setError("");
        try {
            const res = await axios.get(`${API}/cycle/${cycleId}`);
            setCycleDetail(res.data);
            const forms = {};
            res.data.cycle.memberReports?.forEach(r => {
                forms[r._id] = { comment: "", action: "", open: false };
            });
            setFeedbackForms(forms);
            setView("review");
        } catch { setError("Failed to load cycle."); }
    };

    const toggleFeedback = (id) =>
        setFeedbackForms(prev => ({ ...prev, [id]: { ...prev[id], open: !prev[id]?.open } }));

    const updateFeedbackForm = (id, field, val) =>
        setFeedbackForms(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));

    const submitFeedback = async (report, action) => {
        const form = feedbackForms[report._id];
        if (!form?.comment?.trim() && action !== "approved") {
            setError("Please write a comment before requesting resubmission.");
            return;
        }
        setError("");
        try {
            await axios.post(`${API}/feedback`, {
                cycleId: cycleDetail.cycle._id,
                memberReportId: report._id,
                supervisorId: user._id,
                comment: form?.comment || "Approved.",
                action,
            });
            showToast(action === "approved"
                ? `✓ ${report.studentName}'s report approved`
                : `Resubmission requested for ${report.studentName}`
            );
            const res = await axios.get(`${API}/cycle/${cycleDetail.cycle._id}`);
            setCycleDetail(res.data);
            updateFeedbackForm(report._id, "open", false);
            updateFeedbackForm(report._id, "comment", "");
            loadDashboard();
        } catch (e) { setError(e.response?.data?.message || "Failed to save feedback."); }
    };

    const quickApprove = (report) => submitFeedback(report, "approved");

    const verifyCycle = async () => {
        setVerifying(true); setError("");
        try {
            await axios.post(`${API}/verify`, {
                cycleId: cycleDetail.cycle._id,
                supervisorId: user._id,
                signatureData: verifyForm.signatureData,
                notes: verifyForm.notes,
            });
            showToast("Cycle verified and completed!");
            setShowVerify(false);
            const res = await axios.get(`${API}/cycle/${cycleDetail.cycle._id}`);
            setCycleDetail(res.data);
            loadDashboard();
        } catch (e) { setError(e.response?.data?.message || "Verification failed."); }
        finally { setVerifying(false); }
    };

    const allApproved =
        cycleDetail?.cycle?.memberReports?.length === 4 &&
        cycleDetail.cycle.memberReports.every(r => r.status === "approved");

    // ── Toast element ─────────────────────────────────────────────────────────
    const ToastEl = toast.msg && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3
            rounded-2xl shadow-xl text-sm font-semibold
            ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
            <FaCheckCircle size={14} /> {toast.msg}
        </div>
    );

    // ════════════════════════════════════════════════════════════════════════════
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#2F4F4F] flex items-center justify-center animate-pulse">
                        <FaClipboardCheck className="text-[#FFD700] text-xl" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Loading supervisor dashboard…</p>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════════════
    // CYCLE REVIEW
    // ════════════════════════════════════════════════════════════════════════════
    if (view === "review" && cycleDetail) {
        const { cycle, feedbacks, verification } = cycleDetail;
        const approvedCount = cycle.memberReports?.filter(r => r.status === "approved").length || 0;

        return (
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                {ToastEl}

                {/* ── Verify Modal ── */}
                {showVerify && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                            {/* Modal header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-7 text-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <MdVerified size={28} />
                                    <h3 className="text-xl font-bold">Verify &amp; Complete</h3>
                                </div>
                                <p className="text-emerald-100 text-sm">
                                    Apply your digital approval to officially seal and lock this fortnight cycle.
                                </p>
                            </div>
                            <div className="p-7 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                                        Digital Signature
                                        <span className="font-normal normal-case text-gray-400 ml-1">(optional)</span>
                                    </label>
                                    <SignaturePad
                                        onSignatureChange={sig =>
                                            setVerifyForm(prev => ({ ...prev, signatureData: sig }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                                        Final Notes
                                        <span className="font-normal normal-case text-gray-400 ml-1">(optional)</span>
                                    </label>
                                    <textarea rows={3}
                                        placeholder="Any final remarks for this cycle…"
                                        value={verifyForm.notes}
                                        onChange={e => setVerifyForm({ ...verifyForm, notes: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm
                                            focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <div className="flex gap-3 pt-1">
                                    <button onClick={() => setShowVerify(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                                        Cancel
                                    </button>
                                    <button onClick={verifyCycle} disabled={verifying}
                                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3
                                            rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition
                                            flex items-center justify-center gap-2 disabled:opacity-50">
                                        {verifying
                                            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            : <MdVerified size={16} />}
                                        Verify &amp; Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-8 py-7">

                        {/* ── Cycle Hero ── */}
                        <div className="bg-gradient-to-r from-[#1e3a3a] to-[#2F4F4F] rounded-2xl p-6 mb-6 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-1">
                                        Supervisor Review
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
                                {/* Approval progress pill */}
                                <div className="bg-white/10 rounded-2xl p-4 text-center min-w-[120px]">
                                    <div className="flex justify-center gap-1 mb-2">
                                        {Array.from({ length: 4 }, (_, i) => (
                                            <div key={i} className={`w-3 h-3 rounded-full transition-all
                                                ${i < approvedCount ? "bg-[#FFD700]" : "bg-white/20"}`} />
                                        ))}
                                    </div>
                                    <p className="text-xl font-bold">{approvedCount}<span className="text-white/50 text-sm">/4</span></p>
                                    <p className="text-white/50 text-xs">approved</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Verify banner ── */}
                        {allApproved && cycle.status !== "COMPLETED" && (
                            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200
                                rounded-2xl p-5 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                                        <FaCheckCircle className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-emerald-800 text-sm">All 4 reports approved!</p>
                                        <p className="text-xs text-emerald-600">Apply your digital verification to complete this cycle.</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowVerify(true)}
                                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5
                                        rounded-xl text-sm font-bold hover:bg-emerald-700 active:scale-[.98] transition whitespace-nowrap shadow-sm">
                                    <MdVerified size={16} /> Verify &amp; Complete
                                </button>
                            </div>
                        )}

                        {/* Completed seal */}
                        {verification && (
                            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200
                                rounded-2xl p-5 mb-6">
                                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <MdVerified className="text-white text-2xl" />
                                </div>
                                <div>
                                    <p className="font-bold text-emerald-800">Cycle Verified &amp; Completed</p>
                                    <p className="text-xs text-emerald-600 mt-0.5">
                                        {new Date(verification.verifiedAt).toLocaleString()}
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

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-5 text-sm">
                                {error}
                            </div>
                        )}

                        {/* ── 4 Member Report Cards ── */}
                        {cycle.memberReports?.map((report) => {
                            const fb = feedbackForms[report._id] || {};
                            const memberFeedbacks = feedbacks?.filter(
                                f => f.memberReportId?._id === report._id || f.memberReportId === report._id
                            ) || [];
                            const isApproved = report.status === "approved";
                            const needsResub = report.status === "needs_resubmission";
                            const canAction = report.status === "submitted" && cycle.status !== "COMPLETED";

                            return (
                                <div key={report._id}
                                    className={`bg-white rounded-2xl border shadow-sm mb-5 overflow-hidden transition
                                        ${isApproved ? "border-emerald-200" : needsResub ? "border-red-200" : "border-gray-100"}`}>

                                    {/* Card header */}
                                    <div className={`flex items-center justify-between px-6 py-4 border-b
                                        ${isApproved ? "bg-emerald-50 border-emerald-100"
                                            : needsResub ? "bg-red-50 border-red-100"
                                                : "bg-gray-50 border-gray-100"}`}>
                                        <div className="flex items-center gap-3">
                                            <img src={AVATAR(report.studentName)} alt=""
                                                className="w-9 h-9 rounded-full border-2 border-white shadow-sm" />
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">{report.studentName}</p>
                                                <p className="text-xs text-gray-400">{report.studentId}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={report.status} map={REPORT_STATUS} />
                                            {isApproved && <FaCheckCircle className="text-emerald-500" size={16} />}
                                            {/* Action buttons */}
                                            {canAction && (
                                                <div className="flex gap-1.5 ml-1">
                                                    <button onClick={() => quickApprove(report)}
                                                        title="Approve this report"
                                                        className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5
                                                            rounded-lg text-xs font-semibold hover:bg-emerald-600 active:scale-95 transition">
                                                        <FaThumbsUp size={10} /> Approve
                                                    </button>
                                                    <button onClick={() => toggleFeedback(report._id)}
                                                        title="Add feedback / request resubmission"
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                                            transition active:scale-95
                                                            ${fb.open ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                                        <FaCommentAlt size={10} /> {fb.open ? "Close" : "Feedback"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Report body */}
                                    <div className="p-6 space-y-4">
                                        {/* Research Description */}
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                Research Work
                                            </p>
                                            <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 rounded-xl p-4
                                                border border-gray-100 whitespace-pre-wrap">
                                                {report.researchDescription || (
                                                    <span className="text-gray-400 italic">No description provided.</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Stats row — Time Spent + Document */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Time Spent</p>
                                                <p className="text-lg font-bold text-gray-800">
                                                    {report.timeSpent || 0}
                                                    <span className="text-sm font-normal text-gray-400 ml-1">hrs</span>
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Document</p>
                                                {report.fileAttachment ? (
                                                    <a href={report.fileAttachment} target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-1.5 text-blue-600 text-xs hover:underline min-w-0">
                                                        <FaFileAlt size={10} className="flex-shrink-0" />
                                                        <span className="truncate">
                                                            {report.fileAttachmentName || "Open File"}
                                                        </span>
                                                        <FaExternalLinkAlt size={8} className="flex-shrink-0" />
                                                    </a>
                                                ) : <p className="text-xs text-gray-400">None</p>}
                                            </div>
                                        </div>

                                        {/* Evidence Links — full width */}
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                Evidence Links
                                            </p>
                                            {report.evidenceLinks?.length > 0 ? (
                                                <div className="flex flex-col gap-1.5">
                                                    {report.evidenceLinks.map((link, i) => (
                                                        <a key={i} href={link} target="_blank" rel="noreferrer"
                                                            className="flex items-center gap-2 text-blue-600 text-xs hover:underline min-w-0">
                                                            <FaLink size={9} className="flex-shrink-0 text-blue-400" />
                                                            <span className="truncate flex-1">{link}</span>
                                                            <FaExternalLinkAlt size={8} className="flex-shrink-0 text-blue-400" />
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : <p className="text-xs text-gray-400 italic">No evidence links provided.</p>}
                                        </div>

                                        {/* Previous feedback */}
                                        {memberFeedbacks.length > 0 && (
                                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">
                                                    Previous Feedback
                                                </p>
                                                {memberFeedbacks.map(fb => (
                                                    <div key={fb._id} className="flex gap-3 mb-2 last:mb-0">
                                                        <div className="w-1 bg-amber-300 rounded-full flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-800">{fb.comment}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {fb.supervisorId?.fullName || "You"} ·{" "}
                                                                {new Date(fb.createdAt).toLocaleDateString()} ·{" "}
                                                                <span className="capitalize font-semibold">{fb.action?.replace(/_/g, " ")}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Inline feedback panel */}
                                        {fb.open && canAction && (
                                            <div className="bg-white border-2 border-[#FFD700]/30 rounded-xl p-5 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-gray-800">
                                                        Feedback for {report.studentName}
                                                    </p>
                                                    <button onClick={() => toggleFeedback(report._id)}
                                                        className="text-gray-400 hover:text-gray-600 transition">
                                                        <FaTimes size={14} />
                                                    </button>
                                                </div>
                                                <textarea rows={3}
                                                    placeholder="Write your feedback or reason for requesting resubmission…"
                                                    value={fb.comment || ""}
                                                    onChange={e => updateFeedbackForm(report._id, "comment", e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm
                                                        focus:outline-none focus:ring-2 focus:ring-[#FFD700] resize-none" />
                                                <div className="flex gap-2 flex-wrap">
                                                    <button onClick={() => submitFeedback(report, "approved")}
                                                        className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2
                                                            rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition">
                                                        <FaThumbsUp size={11} /> Approve
                                                    </button>
                                                    <button onClick={() => submitFeedback(report, "resubmission_requested")}
                                                        className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2
                                                            rounded-xl text-sm font-semibold hover:bg-red-600 active:scale-95 transition">
                                                        <FaRedo size={11} /> Request Resubmission
                                                    </button>
                                                    <button onClick={() => submitFeedback(report, "feedback")}
                                                        className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2
                                                            rounded-xl text-sm font-semibold hover:bg-gray-200 active:scale-95 transition">
                                                        <FaCommentAlt size={11} /> Comment Only
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════════════
    // DASHBOARD VIEW
    // ════════════════════════════════════════════════════════════════════════════
    const allCycles = [
        ...(dashData?.pendingReviews || []),
        ...(dashData?.needsResubmission || []),
        ...(dashData?.approvedCycles || []),
    ].sort((a, b) => (a.cycleNumber || 0) - (b.cycleNumber || 0));

    const tabData = {
        all:          allCycles,
        pending:      dashData?.pendingReviews || [],
        resubmission: dashData?.needsResubmission || [],
        completed:    dashData?.approvedCycles || [],
    };

    const visibleCycles = tabData[activeTab].filter(cycle => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            cycle.groupId?.toLowerCase().includes(q) ||
            String(cycle.cycleNumber).includes(q.trim())
        );
    });

    const FILTER_CARDS = [
        {
            key: "all",
            label: "All Cycles",
            count: allCycles.length,
            icon: <FaClipboardCheck size={14} />,
            activeBorder: "border-[#2F4F4F]",
            activeBg: "bg-[#2F4F4F]/5",
            activeText: "text-[#2F4F4F]",
            activeDot: "bg-[#2F4F4F]",
            iconBg: "bg-[#2F4F4F]/10",
            iconColor: "text-[#2F4F4F]",
            countColor: allCycles.length > 0 ? "text-[#2F4F4F]" : "text-gray-300",
            sub: `${dashData?.totalAssigned || 0} total assigned`,
        },
        {
            key: "pending",
            label: "Pending Review",
            count: tabData.pending.length,
            icon: <FaClock size={14} />,
            activeBorder: "border-amber-400",
            activeBg: "bg-amber-50",
            activeText: "text-amber-700",
            activeDot: "bg-amber-400",
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
            countColor: tabData.pending.length > 0 ? "text-amber-600" : "text-gray-300",
            sub: "awaiting review",
        },
        {
            key: "resubmission",
            label: "Resubmission",
            count: tabData.resubmission.length,
            icon: <FaRedo size={14} />,
            activeBorder: "border-red-400",
            activeBg: "bg-red-50",
            activeText: "text-red-700",
            activeDot: "bg-red-400",
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
            countColor: tabData.resubmission.length > 0 ? "text-red-600" : "text-gray-300",
            sub: "awaiting correction",
        },
        {
            key: "completed",
            label: "Completed",
            count: tabData.completed.length,
            icon: <FaCheckCircle size={14} />,
            activeBorder: "border-emerald-400",
            activeBg: "bg-emerald-50",
            activeText: "text-emerald-700",
            activeDot: "bg-emerald-400",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            countColor: tabData.completed.length > 0 ? "text-emerald-600" : "text-gray-300",
            sub: "fully verified",
        },
    ];

    const emptyMsg = searchQuery.trim()
        ? `No cycles match "${searchQuery}"`
        : { all: "No cycles assigned yet.", pending: "No pending submissions.",
            resubmission: "No cycles awaiting resubmission.", completed: "No completed cycles yet." }[activeTab];

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            {ToastEl}

            {/* ── Hero Banner ── */}
            <div className="bg-gradient-to-br from-[#1e3a3a] via-[#2F4F4F] to-[#3d6060] px-10 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-[#FFD700] p-2 rounded-xl">
                                <FaClipboardCheck className="text-[#2F4F4F] text-lg" />
                            </div>
                            <span className="text-[#FFD700] text-xs font-bold uppercase tracking-widest">
                                Supervisor Panel
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Fortnight Review</h1>
                        <p className="text-white/50 text-sm mt-0.5">
                            Review, approve, and verify research group submissions.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <img src={AVATAR(user?.fullName || user?.username, "FFD700", "2F4F4F")}
                            alt="" className="w-14 h-14 rounded-2xl border-2 border-[#FFD700]/30 shadow-lg" />
                        <div>
                            <p className="text-white font-bold">{user?.fullName || user?.username}</p>
                            <p className="text-white/50 text-xs">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-8 py-7 space-y-5">

                {/* ── Filter Cards ── */}
                <div className="grid grid-cols-4 gap-4">
                    {FILTER_CARDS.map(card => {
                        const isActive = activeTab === card.key;
                        return (
                            <button key={card.key}
                                onClick={() => { setActiveTab(card.key); setSearchQuery(""); }}
                                className={`text-left bg-white rounded-2xl border-2 p-4 shadow-sm
                                    transition-all duration-150 hover:shadow-md active:scale-[.98]
                                    ${isActive
                                        ? `${card.activeBorder} ${card.activeBg}`
                                        : "border-gray-100 hover:border-gray-200"}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <p className={`text-xs font-bold uppercase tracking-wide
                                        ${isActive ? card.activeText : "text-gray-500"}`}>
                                        {card.label}
                                    </p>
                                    <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                                        <span className={card.iconColor}>{card.icon}</span>
                                    </div>
                                </div>
                                <p className={`text-3xl font-bold leading-none mb-1 ${card.countColor}`}>
                                    {card.count}
                                </p>
                                <p className="text-xs text-gray-400">{card.sub}</p>
                                {isActive && (
                                    <div className={`mt-3 h-1 rounded-full ${card.activeDot}`} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Cycle List Panel ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Panel header — active filter label + search */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <span className={FILTER_CARDS.find(c => c.key === activeTab)?.iconColor}>
                                {FILTER_CARDS.find(c => c.key === activeTab)?.icon}
                            </span>
                            <p className="text-sm font-bold text-gray-800">
                                {FILTER_CARDS.find(c => c.key === activeTab)?.label}
                            </p>
                            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                {visibleCycles.length}
                            </span>
                        </div>
                        {/* Search */}
                        <div className="relative w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={11} />
                            <input
                                type="text"
                                placeholder="Search group ID or cycle…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-xl
                                    focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <FaTimes size={10} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cycle list */}
                    <div className="p-5">
                        {visibleCycles.length === 0 ? (
                            <div className="text-center py-14">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <FaClipboardCheck className="text-gray-300 text-2xl" />
                                </div>
                                <p className="text-sm text-gray-400 font-medium">{emptyMsg}</p>
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")}
                                        className="mt-2 text-xs text-[#2F4F4F] hover:underline font-semibold">
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {visibleCycles.map(cycle => (
                                    <div key={cycle._id}
                                        onClick={() => openCycle(cycle._id)}
                                        className="flex items-center justify-between p-4 rounded-xl border border-gray-100
                                            bg-gray-50 hover:border-[#FFD700] hover:bg-white hover:shadow-sm cursor-pointer transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0
                                                ${cycle.status === "COMPLETED" ? "bg-emerald-500"
                                                    : cycle.status === "NEEDS_RESUBMISSION" ? "bg-red-500"
                                                        : "bg-amber-500"}`}>
                                                {cycle.cycleNumber}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">
                                                    Cycle {cycle.cycleNumber}
                                                    <span className="text-gray-400 font-normal ml-2 text-xs">Group: {cycle.groupId}</span>
                                                </p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <FaCalendarAlt size={9} />
                                                    {new Date(cycle.startDate).toLocaleDateString()} — {new Date(cycle.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <ApprovalDots reports={cycle.memberReports} />
                                            <StatusBadge status={cycle.status} map={CYCLE_STATUS} />
                                            <FaChevronRight size={11} className="text-gray-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupervisorView;
