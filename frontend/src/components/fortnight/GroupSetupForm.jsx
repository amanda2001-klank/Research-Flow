import { useState, useEffect } from "react";
import axios from "axios";
import {
    FaGraduationCap, FaUsers, FaCalendarAlt, FaCheck,
    FaArrowRight, FaArrowLeft, FaUserCircle, FaCrown, FaInfoCircle
} from "react-icons/fa";
import { MdGroups } from "react-icons/md";

const API = "http://localhost:5000/api";

const AVATAR = (name, bg = "2F4F4F", fg = "FFD700") =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "M")}&background=${bg}&color=${fg}&bold=true&size=80`;

// ── Input style ──────────────────────────────────────────────────────────────
const inputCls =
    "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 " +
    "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700] " +
    "focus:border-transparent transition shadow-sm";

const GroupSetupForm = ({ user, onSetupComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [supervisors, setSupervisors] = useState([]);

    const [groupInfo, setGroupInfo] = useState({
        groupId: "",
        supervisorId: "",
        startDate: new Date().toISOString().split("T")[0],
    });

    const [members, setMembers] = useState([
        { studentId: "", studentName: user?.fullName || user?.username || "", email: user?.email || "", isLeader: true },
        { studentId: "", studentName: "", email: "", isLeader: false },
        { studentId: "", studentName: "", email: "", isLeader: false },
        { studentId: "", studentName: "", email: "", isLeader: false },
    ]);

    useEffect(() => {
        axios.get(`${API}/auth/users`)
            .then(res => setSupervisors(res.data.filter(u => u.role === "sponsor")))
            .catch(() => setSupervisors([]));
    }, []);

    const updateMember = (idx, field, value) =>
        setMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            await axios.post(`${API}/fortnight/setup-group`, {
                groupId: groupInfo.groupId.trim(),
                supervisorId: groupInfo.supervisorId,
                leaderId: user._id,
                startDate: groupInfo.startDate,
                members: members.map((m, i) => ({
                    studentId: m.studentId.trim(),
                    studentName: m.studentName.trim(),
                    email: m.email.trim(),
                    isLeader: m.isLeader,
                    userId: i === 0 ? user._id : null,
                })),
            });
            onSetupComplete(groupInfo.groupId.trim());
        } catch (err) {
            setError(err.response?.data?.message || "Setup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const step1Valid = groupInfo.groupId.trim() && groupInfo.supervisorId.trim() && groupInfo.startDate;
    const step2Valid = members.every(m => m.studentId.trim() && m.studentName.trim());

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">

            {/* ── Hero Banner ─────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-[#1e3a3a] via-[#2F4F4F] to-[#3A5F5F] px-10 py-10">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-[#FFD700] p-2 rounded-xl">
                                <FaGraduationCap className="text-[#2F4F4F] text-lg" />
                            </div>
                            <span className="text-[#FFD700] text-xs font-bold uppercase tracking-widest">
                                Fortnight Log
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-white leading-tight">
                            Set Up Your<br />Research Group
                        </h1>
                        <p className="text-white/60 text-sm mt-2 max-w-sm">
                            Register your 4-member team to begin 24 fortnight cycles
                            of progress tracking across the research year.
                        </p>
                    </div>

                    {/* Mini cycle visualization */}
                    <div className="hidden sm:flex flex-col items-center gap-2">
                        <div className="grid grid-cols-6 gap-1">
                            {Array.from({ length: 24 }, (_, i) => (
                                <div key={i}
                                    className={`w-5 h-5 rounded-md text-[8px] font-bold flex items-center justify-center
                                        ${i === 0 ? "bg-[#FFD700] text-[#2F4F4F]" : "bg-white/10 text-white/40"}`}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                        <p className="text-white/40 text-xs">24 cycles · 360 days</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8">

                {/* ── Step Wizard ─────────────────────────────────────────── */}
                <div className="flex items-center mb-8">
                    {[
                        { n: 1, label: "Group Details", sub: "ID, supervisor, dates" },
                        { n: 2, label: "Team Members", sub: "4 research members" },
                    ].map((s, i) => (
                        <div key={s.n} className="flex items-center flex-1 last:flex-none">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                    font-bold text-sm transition-all shadow-sm
                                    ${step > s.n ? "bg-green-500 text-white shadow-green-200"
                                        : step === s.n ? "bg-[#2F4F4F] text-white shadow-[#2F4F4F]/30"
                                            : "bg-gray-200 text-gray-400"}`}>
                                    {step > s.n ? <FaCheck size={12} /> : s.n}
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold leading-tight
                                        ${step >= s.n ? "text-gray-800" : "text-gray-400"}`}>
                                        {s.label}
                                    </p>
                                    <p className="text-xs text-gray-400">{s.sub}</p>
                                </div>
                            </div>
                            {i < 1 && (
                                <div className={`flex-1 h-0.5 mx-4 rounded-full transition-colors
                                    ${step > 1 ? "bg-green-400" : "bg-gray-200"}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Form Card ───────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Card header stripe */}
                    <div className="h-1 bg-gradient-to-r from-[#2F4F4F] to-[#FFD700]" />

                    <div className="p-8">

                        {/* ══════ STEP 1 ══════ */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Group Details</h2>
                                    <p className="text-sm text-gray-400 mt-0.5">
                                        Fill in the group identifier, supervisor, and research start date.
                                    </p>
                                </div>

                                {/* Group ID */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Group ID <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. CS-2024-GROUP-01"
                                        value={groupInfo.groupId}
                                        onChange={e => setGroupInfo({ ...groupInfo, groupId: e.target.value })}
                                        className={inputCls}
                                    />
                                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                        <FaInfoCircle size={10} />
                                        A unique identifier shared with your group members and supervisor.
                                    </p>
                                </div>

                                {/* Supervisor */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Assigned Supervisor <span className="text-red-400">*</span>
                                    </label>
                                    {supervisors.length > 0 ? (
                                        <select
                                            value={groupInfo.supervisorId}
                                            onChange={e => setGroupInfo({ ...groupInfo, supervisorId: e.target.value })}
                                            className={inputCls}
                                        >
                                            <option value="">— Select your supervisor —</option>
                                            {supervisors.map(s => (
                                                <option key={s._id} value={s._id}>
                                                    {s.fullName || s.username}  ·  {s.email}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                placeholder="Paste supervisor's User ID"
                                                value={groupInfo.supervisorId}
                                                onChange={e => setGroupInfo({ ...groupInfo, supervisorId: e.target.value })}
                                                className={inputCls}
                                            />
                                            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                                                <FaInfoCircle size={10} />
                                                No sponsors found. Enter the supervisor's MongoDB User ID manually.
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Research Start Date <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={groupInfo.startDate}
                                        onChange={e => setGroupInfo({ ...groupInfo, startDate: e.target.value })}
                                        className={inputCls}
                                    />

                                    {/* Visual timeline preview */}
                                    {groupInfo.startDate && (
                                        <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                                            <FaCalendarAlt className="text-[#2F4F4F] flex-shrink-0" />
                                            <div className="flex-1 text-xs text-gray-600">
                                                <span className="font-semibold">Cycle 1</span>{" "}
                                                {new Date(groupInfo.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                {" "}→{" "}
                                                {new Date(new Date(groupInfo.startDate).getTime() + 14 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                <span className="mx-2 text-gray-300">·</span>
                                                <span className="font-semibold">Cycle 24 ends</span>{" "}
                                                {new Date(new Date(groupInfo.startDate).getTime() + 359 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!step1Valid}
                                    className="w-full flex items-center justify-center gap-2 bg-[#2F4F4F] text-white
                                        rounded-xl py-3.5 font-semibold hover:bg-[#3A5F5F] active:scale-[.99]
                                        transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                >
                                    Continue to Members <FaArrowRight size={13} />
                                </button>
                            </div>
                        )}

                        {/* ══════ STEP 2 ══════ */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Team Members</h2>
                                        <p className="text-sm text-gray-400 mt-0.5">
                                            Register all 4 group members. Member 1 is the group leader.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-1.5 text-sm text-gray-400
                                            hover:text-[#2F4F4F] transition mt-1"
                                    >
                                        <FaArrowLeft size={11} /> Back
                                    </button>
                                </div>

                                {members.map((member, idx) => (
                                    <div key={idx}
                                        className={`rounded-2xl border overflow-hidden transition-shadow hover:shadow-sm
                                            ${member.isLeader
                                                ? "border-[#FFD700] shadow-sm shadow-yellow-100"
                                                : "border-gray-100"
                                            }`}>

                                        {/* Member card header */}
                                        <div className={`flex items-center gap-3 px-5 py-3
                                            ${member.isLeader ? "bg-gradient-to-r from-[#fffbeb] to-[#fef9c3]" : "bg-gray-50"}`}>
                                            <img
                                                src={AVATAR(
                                                    member.studentName || `M${idx + 1}`,
                                                    member.isLeader ? "FFD700" : "2F4F4F",
                                                    member.isLeader ? "2F4F4F" : "FFD700"
                                                )}
                                                alt=""
                                                className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {member.studentName || `Member ${idx + 1}`}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {member.studentId || "Student ID not set"}
                                                </p>
                                            </div>
                                            {member.isLeader ? (
                                                <span className="flex items-center gap-1 text-xs font-bold
                                                    bg-[#FFD700] text-[#2F4F4F] px-2.5 py-1 rounded-full">
                                                    <FaCrown size={9} /> Leader
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 bg-white border border-gray-200
                                                    px-2.5 py-1 rounded-full">
                                                    Member {idx + 1}
                                                </span>
                                            )}
                                        </div>

                                        {/* Member fields */}
                                        <div className="p-5 grid grid-cols-2 gap-3 bg-white">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Student ID <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. S2024001"
                                                    value={member.studentId}
                                                    onChange={e => updateMember(idx, "studentId", e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5
                                                        text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Full Name <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Full name"
                                                    value={member.studentName}
                                                    onChange={e => updateMember(idx, "studentName", e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5
                                                        text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                                    Email <span className="font-normal normal-case text-gray-400">(optional)</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    placeholder="email@university.edu"
                                                    value={member.email}
                                                    onChange={e => updateMember(idx, "email", e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5
                                                        text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm
                                        bg-red-50 border border-red-100 p-4 rounded-xl">
                                        <span className="text-red-400">⚠</span> {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={!step2Valid || loading}
                                    className="w-full flex items-center justify-center gap-2 bg-[#2F4F4F] text-white
                                        rounded-xl py-3.5 font-semibold hover:bg-[#3A5F5F] active:scale-[.99]
                                        transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating group & 24 cycles…
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck size={13} />
                                            Complete Setup &amp; Generate 24 Cycles
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Info Footer ─────────────────────────────────────────── */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                        { icon: "📅", title: "24 Cycles", sub: "Auto-generated, 15 days each" },
                        { icon: "🔔", title: "Notifications", sub: "Real-time cycle alerts" },
                        { icon: "🔒", title: "Locked on Approval", sub: "Verified cycles are immutable" },
                    ].map(item => (
                        <div key={item.title}
                            className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
                            <div className="text-xl mb-1">{item.icon}</div>
                            <p className="text-xs font-semibold text-gray-700">{item.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroupSetupForm;
