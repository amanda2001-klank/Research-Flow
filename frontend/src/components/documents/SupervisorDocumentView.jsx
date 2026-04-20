import { useState, useEffect } from "react";
import { FaFileAlt, FaDownload, FaCheckCircle, FaHistory, FaSearch, FaExchangeAlt, FaCog } from "react-icons/fa";
import jsPDF from "jspdf";
import RubricEvaluationModal from "./RubricEvaluationModal";
import VersionCompareModal from "./VersionCompareModal";
import RuleManagerModal from "./RuleManagerModal";

const API = "http://localhost:5000/api";

const SupervisorDocumentView = ({ user }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showEvaluate, setShowEvaluate] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [evaluationSummary, setEvaluationSummary] = useState(null);
    const [showEvaluationSummary, setShowEvaluationSummary] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [revisionDoc, setRevisionDoc] = useState(null);
    const [revisionNote, setRevisionNote] = useState('');
    const [revisionActionsText, setRevisionActionsText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [compareDoc, setCompareDoc] = useState(null);
    const [showRuleManager, setShowRuleManager] = useState(false);
    const [ruleGroupId, setRuleGroupId] = useState('');

    const fetchDocuments = async () => {
        try {
            // Only fetch documents assigned to this sponsor
            const res = await fetch(`${API}/documents/sponsor/${user?._id}`);
            const data = await res.json();
            setDocuments(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchDocuments(); }, []);

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.groupId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || doc.documentType === filterType;
        const matchesStatus = filterStatus === 'All' || doc.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Group documents by groupId
    const groupedDocs = filteredDocs.reduce((acc, doc) => {
        if (!acc[doc.groupId]) acc[doc.groupId] = [];
        acc[doc.groupId].push(doc);
        return acc;
    }, {});

    const getStatusColor = (status) => {
        switch (status) {
            case 'Evaluated': return 'bg-green-100 text-green-700';
            case 'Under Review': return 'bg-yellow-100 text-yellow-700';
            case 'Revision Requested': return 'bg-red-100 text-red-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const updateDocStatus = async (docId, status, extra = {}) => {
        try {
            await fetch(`${API}/documents/${docId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, ...extra })
            });
            fetchDocuments();
        } catch (err) { console.error(err); }
    };

    const openRevisionModal = (doc) => {
        setRevisionDoc(doc);
        setRevisionNote(doc?.revisionRequestNote || '');
        setRevisionActionsText((doc?.feedbackActions || []).map((item) => item.title).join('\n'));
        setShowRevisionModal(true);
    };

    const submitRevisionRequest = async () => {
        if (!revisionDoc?._id) return;
        const revisionActions = revisionActionsText
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);

        await updateDocStatus(revisionDoc._id, 'Revision Requested', {
            revisionNote,
            revisionActions,
            requestedBy: user?.fullName || user?.username || 'Sponsor'
        });
        setShowRevisionModal(false);
        setRevisionDoc(null);
        setRevisionNote('');
        setRevisionActionsText('');
    };

    const openRuleManager = (groupId) => {
        setRuleGroupId(groupId);
        setShowRuleManager(true);
    };

    const openEvaluationSummary = async (docId) => {
        try {
            const res = await fetch(`${API}/evaluations/summary/${docId}`);
            if (!res.ok) {
                alert('No evaluation summary found for this document yet.');
                return;
            }
            const data = await res.json();
            setEvaluationSummary(data);
            setShowEvaluationSummary(true);
        } catch (err) {
            console.error(err);
            alert('Failed to load evaluation summary.');
        }
    };

    const downloadEvaluationPdf = () => {
        if (!evaluationSummary) return;

        const data = evaluationSummary;
        const pdf = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 40;
        const contentWidth = pageWidth - margin * 2;
        const footerY = pageHeight - 24;
        let y = 0;
        let pageNo = 1;

        const colors = {
            primary: [47, 79, 79],
            accent: [255, 215, 0],
            text: [31, 41, 55],
            muted: [107, 114, 128],
            border: [226, 232, 240],
            cardBg: [248, 250, 252],
            white: [255, 255, 255],
            green: [16, 185, 129],
            amber: [245, 158, 11],
            red: [239, 68, 68],
        };

        const asText = (value, fallback = "N/A") => {
            if (value === undefined || value === null || value === "") return fallback;
            return String(value);
        };

        const asNumberText = (value, digits = 1) => {
            const num = Number(value);
            if (!Number.isFinite(num)) return asText(value);
            return num.toFixed(digits).replace(/\.0+$/, "");
        };

        const asDateText = (value) => {
            const date = value ? new Date(value) : null;
            if (!date || Number.isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString();
        };

        const scoreColor = (score) => {
            if (score >= 75) return colors.green;
            if (score >= 50) return colors.amber;
            return colors.red;
        };

        const drawCard = (x, top, width, height) => {
            pdf.setFillColor(...colors.cardBg);
            pdf.roundedRect(x, top, width, height, 10, 10, "F");
            pdf.setDrawColor(...colors.border);
            pdf.roundedRect(x, top, width, height, 10, 10, "S");
        };

        const drawFooter = () => {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(...colors.muted);
            pdf.text(`Generated on ${new Date().toLocaleString()}`, margin, footerY);
            pdf.text(`Page ${pageNo}`, pageWidth - margin, footerY, { align: "right" });
        };

        const drawCoverHeader = () => {
            pdf.setFillColor(...colors.primary);
            pdf.rect(0, 0, pageWidth, 118, "F");

            pdf.setFillColor(...colors.accent);
            pdf.rect(0, 110, pageWidth, 8, "F");

            pdf.setTextColor(...colors.white);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(22);
            pdf.text("Evaluation Progress Report", margin, 50);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
            pdf.text(asText(data.documentTitle), margin, 74);

            pdf.setFontSize(10);
            pdf.text(`Document Type: ${asText(data.documentType)}`, margin, 94);
            pdf.text(`Group: ${asText(data.groupId)}`, pageWidth - margin, 94, { align: "right" });

            y = 146;
        };

        const drawPageHeader = () => {
            pdf.setFillColor(...colors.cardBg);
            pdf.rect(0, 0, pageWidth, 56, "F");

            pdf.setDrawColor(...colors.border);
            pdf.line(0, 56, pageWidth, 56);

            pdf.setTextColor(...colors.primary);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text("Evaluation Progress Report", margin, 34);

            pdf.setTextColor(...colors.muted);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text(asText(data.documentTitle), pageWidth - margin, 34, { align: "right" });

            y = 76;
        };

        const addPage = () => {
            drawFooter();
            pdf.addPage();
            pageNo += 1;
            drawPageHeader();
        };

        const ensureSpace = (needed = 20) => {
            if (y + needed > pageHeight - 44) {
                addPage();
            }
        };

        const writeSectionTitle = (title) => {
            ensureSpace(32);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.setTextColor(...colors.primary);
            pdf.text(title, margin, y);

            pdf.setDrawColor(...colors.accent);
            pdf.setLineWidth(1.2);
            pdf.line(margin, y + 8, margin + 132, y + 8);
            y += 24;
        };

        drawCoverHeader();

        writeSectionTitle("Report Summary");
        const summary = [
            { label: "Document", value: asText(data.documentTitle) },
            { label: "Type", value: asText(data.documentType) },
            { label: "Group", value: asText(data.groupId) },
            { label: "Evaluator", value: asText(data.evaluator) },
            { label: "Date", value: asDateText(data.evaluatedAt) },
            { label: "Criteria Count", value: asText(Array.isArray(data.criteria) ? data.criteria.length : 0) },
        ];

        const colGap = 12;
        const colWidth = (contentWidth - colGap) / 2;
        const summaryBoxHeight = 56;

        for (let i = 0; i < summary.length; i += 2) {
            ensureSpace(summaryBoxHeight + 10);
            [summary[i], summary[i + 1]].forEach((item, colIndex) => {
                if (!item) return;
                const x = margin + colIndex * (colWidth + colGap);
                drawCard(x, y, colWidth, summaryBoxHeight);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(9);
                pdf.setTextColor(...colors.muted);
                pdf.text(item.label, x + 12, y + 20);

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(11);
                pdf.setTextColor(...colors.text);
                const valueLines = pdf.splitTextToSize(item.value, colWidth - 24);
                pdf.text(valueLines[0] || "N/A", x + 12, y + 40);
            });
            y += summaryBoxHeight + 10;
        }

        writeSectionTitle("Rubric Scores");
        const criteria = Array.isArray(data.criteria) ? data.criteria : [];

        if (criteria.length === 0) {
            ensureSpace(44);
            drawCard(margin, y, contentWidth, 44);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.setTextColor(...colors.muted);
            pdf.text("No rubric criteria available.", margin + 14, y + 28);
            y += 54;
        } else {
            criteria.forEach((criterion) => {
                const score = Number(criterion.score) || 0;
                const weight = Number(criterion.weight) || 0;
                const weighted = ((score * weight) / 100).toFixed(1).replace(/\.0+$/, "");
                const feedbackLines = criterion.feedback
                    ? pdf.splitTextToSize(String(criterion.feedback), contentWidth - 28)
                    : [];
                const cardHeight = 74 + (feedbackLines.length ? 20 + feedbackLines.length * 12 : 0);

                ensureSpace(cardHeight + 10);
                drawCard(margin, y, contentWidth, cardHeight);

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(12);
                pdf.setTextColor(...colors.text);
                pdf.text(asText(criterion.name, "Criterion"), margin + 14, y + 24);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(10);
                pdf.setTextColor(...colors.muted);
                pdf.text(`Weight ${asNumberText(weight)}%`, margin + 14, y + 42);

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(12);
                pdf.setTextColor(...colors.primary);
                pdf.text(`${asNumberText(score)}/100`, margin + contentWidth - 14, y + 24, { align: "right" });

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(10);
                pdf.setTextColor(...colors.muted);
                pdf.text(`Weighted ${weighted}`, margin + contentWidth - 14, y + 42, { align: "right" });

                const barX = margin + 14;
                const barY = y + 52;
                const barWidth = contentWidth - 28;
                const barHeight = 8;
                const fillPercent = Math.max(0, Math.min(100, score));

                pdf.setFillColor(229, 231, 235);
                pdf.roundedRect(barX, barY, barWidth, barHeight, 4, 4, "F");
                if (fillPercent > 0) {
                    pdf.setFillColor(...scoreColor(fillPercent));
                    pdf.roundedRect(barX, barY, (barWidth * fillPercent) / 100, barHeight, 4, 4, "F");
                }

                if (feedbackLines.length) {
                    const feedbackY = y + 76;
                    pdf.setFont("helvetica", "bold");
                    pdf.setFontSize(10);
                    pdf.setTextColor(...colors.muted);
                    pdf.text("Feedback", margin + 14, feedbackY);

                    pdf.setFont("helvetica", "normal");
                    pdf.setTextColor(...colors.text);
                    feedbackLines.forEach((line, lineIndex) => {
                        pdf.text(line, margin + 14, feedbackY + 16 + lineIndex * 12);
                    });
                }

                y += cardHeight + 10;
            });
        }

        writeSectionTitle("Total Mark");
        ensureSpace(86);
        drawCard(margin, y, contentWidth, 76);

        pdf.setFillColor(...colors.accent);
        pdf.roundedRect(margin, y, 10, 76, 6, 6, "F");

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.muted);
        pdf.text("Final evaluation score", margin + 24, y + 28);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.setTextColor(...colors.primary);
        pdf.text("Overall Performance", margin + 24, y + 50);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(30);
        pdf.setTextColor(...colors.text);
        pdf.text(`${asNumberText(data.totalMark)}/100`, margin + contentWidth - 16, y + 50, { align: "right" });
        y += 90;

        if (data.generalFeedback) {
            writeSectionTitle("General Feedback");
            const feedbackLines = pdf.splitTextToSize(String(data.generalFeedback), contentWidth - 28);
            const boxHeight = 34 + feedbackLines.length * 12;

            ensureSpace(boxHeight + 10);
            drawCard(margin, y, contentWidth, boxHeight);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.setTextColor(...colors.text);
            feedbackLines.forEach((line, lineIndex) => {
                pdf.text(line, margin + 14, y + 22 + lineIndex * 12);
            });
            y += boxHeight + 10;
        }

        const individualMarks = Array.isArray(data.individualMarks) ? data.individualMarks : [];
        if (individualMarks.length > 0) {
            writeSectionTitle("Individual Marks");

            individualMarks.forEach((item) => {
                ensureSpace(62);
                drawCard(margin, y, contentWidth, 54);

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(11);
                pdf.setTextColor(...colors.text);
                pdf.text(`${asText(item.studentName)} (${asText(item.studentId)})`, margin + 14, y + 24);

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(10);
                pdf.setTextColor(...colors.muted);
                pdf.text(`Contribution: ${asText(item.contribution)}%`, margin + 14, y + 42);

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(11);
                pdf.setTextColor(...colors.primary);
                pdf.text(`Mark: ${asNumberText(item.individualMark)}`, margin + contentWidth - 14, y + 33, { align: "right" });

                y += 62;
            });
        }

        drawFooter();

        const safeTitle = (data.documentTitle || "Report")
            .replace(/[^a-z0-9_\-\s]/gi, "")
            .replace(/\s+/g, "_");
        pdf.save(`Evaluation_${safeTitle}.pdf`);
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Document Review & Evaluation</h1>
                    <p className="text-gray-500 mt-1">Review student submissions and provide rubric-based evaluation</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Submissions", value: documents.length, color: "bg-blue-50 text-blue-700", border: "border-blue-200" },
                        { label: "Pending Review", value: documents.filter(d => d.status === 'Pending').length, color: "bg-yellow-50 text-yellow-700", border: "border-yellow-200" },
                        { label: "Evaluated", value: documents.filter(d => d.status === 'Evaluated').length, color: "bg-green-50 text-green-700", border: "border-green-200" },
                        { label: "Groups", value: Object.keys(groupedDocs).length, color: "bg-purple-50 text-purple-700", border: "border-purple-200" },
                    ].map((s, i) => (
                        <div key={i} className={`${s.color} ${s.border} border p-4 rounded-xl`}>
                            <p className="text-sm font-medium opacity-70">{s.label}</p>
                            <p className="text-3xl font-bold mt-1">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Search & Filter */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex-1 min-w-[200px] relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search by title or group..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2F4F4F] bg-white"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2F4F4F] bg-white"
                    >
                        <option value="All">All Types</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Progress Report">Progress Report</option>
                        <option value="Final Report">Final Report</option>
                        <option value="Presentation">Presentation</option>
                        <option value="Other">Other</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2F4F4F] bg-white"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Evaluated">Evaluated</option>
                        <option value="Revision Requested">Revision Requested</option>
                    </select>
                </div>

                {/* Document Groups */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading submissions...</div>
                ) : Object.keys(groupedDocs).length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <FaFileAlt className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Submissions Found</h3>
                        <p className="text-gray-400">No documents have been submitted yet.</p>
                    </div>
                ) : (
                    Object.entries(groupedDocs).map(([gId, docs]) => (
                        <div key={gId} className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-[#2F4F4F] rounded-lg flex items-center justify-center">
                                    <span className="text-[#FFD700] text-sm font-bold">{gId.charAt(0)}</span>
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Group: {gId}</h2>
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{docs.length} document(s)</span>
                                <button
                                    onClick={() => openRuleManager(gId)}
                                    className="ml-auto text-xs flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2F4F4F]/10 text-[#2F4F4F] hover:bg-[#2F4F4F]/20 transition"
                                >
                                    <FaCog size={11} /> Rules
                                </button>
                            </div>

                            <div className="space-y-3">
                                {docs.map(doc => (
                                    <div key={doc._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{doc.documentType}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(doc.status)}`}>
                                                        {doc.status}
                                                    </span>
                                                    <span className="text-xs text-gray-400">v{doc.currentVersion} • {new Date(doc.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => { setSelectedDoc(doc); setShowVersions(true); }}
                                                    className="text-sm text-gray-500 hover:text-[#2F4F4F] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition flex items-center gap-1"
                                                >
                                                    <FaHistory size={13} /> History
                                                </button>
                                                {doc.versions?.length > 1 && (
                                                    <button
                                                        onClick={() => setCompareDoc(doc)}
                                                        className="text-sm text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition flex items-center gap-1"
                                                    >
                                                        <FaExchangeAlt size={13} /> Compare
                                                    </button>
                                                )}
                                                {doc.versions?.length > 0 && (
                                                    <a
                                                        href={`http://localhost:5000${doc.versions[doc.versions.length - 1].fileUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-500 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                                                    >
                                                        <FaDownload size={13} /> Download
                                                    </a>
                                                )}
                                                {doc.status === 'Pending' && (
                                                    <button
                                                        onClick={() => updateDocStatus(doc._id, 'Under Review')}
                                                        className="text-sm text-yellow-600 hover:text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition"
                                                    >
                                                        Start Review
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setSelectedDoc(doc); setShowEvaluate(true); }}
                                                    className="flex items-center gap-1 text-sm bg-[#2F4F4F] text-white px-4 py-1.5 rounded-lg hover:bg-[#3A5F5F] transition"
                                                >
                                                    <FaCheckCircle size={13} /> Evaluate
                                                </button>
                                                {doc.status === 'Evaluated' && (
                                                    <button
                                                        onClick={() => openEvaluationSummary(doc._id)}
                                                        className="text-sm text-green-600 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition"
                                                    >
                                                        View Summary
                                                    </button>
                                                )}
                                                {doc.status !== 'Revision Requested' && doc.status !== 'Evaluated' && (
                                                    <button
                                                        onClick={() => openRevisionModal(doc)}
                                                        className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                                                    >
                                                        Request Revision
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {doc.feedbackActions?.length > 0 && (
                                            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-xs text-amber-800">
                                                Feedback action progress: {doc.feedbackActions.filter((item) => item.status === 'resolved').length}/{doc.feedbackActions.length} resolved
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Version History Modal */}
            {showVersions && selectedDoc && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowVersions(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Version History</h2>
                            <p className="text-sm text-gray-500 mt-1">{selectedDoc.title}</p>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
                            {[...selectedDoc.versions].reverse().map((v, i) => (
                                <div key={i} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-800">v{v.versionNumber}</span>
                                            {v.versionNumber === selectedDoc.currentVersion && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Latest</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{v.fileName}</p>
                                        <p className="text-xs text-gray-400">{new Date(v.uploadedAt).toLocaleString()} • by {v.uploadedBy}</p>
                                    </div>
                                    <a
                                        href={`http://localhost:5000${v.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700 p-2"
                                    >
                                        <FaDownload size={16} />
                                    </a>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setShowVersions(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rubric Evaluation Modal */}
            {showEvaluate && selectedDoc && (
                <RubricEvaluationModal
                    document={selectedDoc}
                    user={user}
                    onClose={() => { setShowEvaluate(false); setSelectedDoc(null); }}
                    onSuccess={() => { setShowEvaluate(false); setSelectedDoc(null); fetchDocuments(); }}
                />
            )}

            {/* Revision Request Modal */}
            {showRevisionModal && revisionDoc && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRevisionModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Request Revision</h2>
                            <p className="text-sm text-gray-500 mt-1">{revisionDoc.title}</p>
                        </div>

                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Note to student (optional)</label>
                            <textarea
                                rows={5}
                                value={revisionNote}
                                onChange={(e) => setRevisionNote(e.target.value)}
                                placeholder="Explain what should be improved before resubmission..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2F4F4F] resize-none"
                            />

                            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Action items (one per line)</label>
                            <textarea
                                rows={4}
                                value={revisionActionsText}
                                onChange={(e) => setRevisionActionsText(e.target.value)}
                                placeholder="Example:\nUpdate literature review references\nClarify methodology sample size"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2F4F4F] resize-none"
                            />
                        </div>

                        <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowRevisionModal(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRevisionRequest}
                                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Send Revision Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {compareDoc && (
                <VersionCompareModal
                    doc={compareDoc}
                    onClose={() => setCompareDoc(null)}
                />
            )}

            {showRuleManager && ruleGroupId && (
                <RuleManagerModal
                    groupId={ruleGroupId}
                    user={user}
                    onClose={() => { setShowRuleManager(false); setRuleGroupId(''); }}
                    onSaved={() => fetchDocuments()}
                />
            )}

            {/* Evaluation Summary Modal (Sponsor) */}
            {showEvaluationSummary && evaluationSummary && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={() => setShowEvaluationSummary(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-2 sm:my-0 max-h-[calc(100vh-1rem)] sm:max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#2F4F4F] to-[#3A5F5F]">
                            <h2 className="text-xl font-bold text-white">Evaluation Summary</h2>
                            <p className="text-sm text-gray-300 mt-1">{evaluationSummary.documentTitle} — {evaluationSummary.documentType}</p>
                        </div>

                        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-[#2F4F4F] shadow-lg">
                                    <span className="text-3xl font-bold">{evaluationSummary.totalMark}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Total Mark out of 100</p>
                            </div>

                            <h3 className="font-semibold text-gray-800 mb-3">Rubric Breakdown</h3>
                            <div className="space-y-3 mb-6">
                                {evaluationSummary.criteria?.map((criterion, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-700">{criterion.name}</span>
                                            <span className="text-sm font-semibold text-[#2F4F4F]">{criterion.score}/100 ({criterion.weight}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-2 rounded-full">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-[#2F4F4F] to-[#FFD700]"
                                                style={{ width: `${criterion.score}%` }}
                                            />
                                        </div>
                                        {criterion.feedback && <p className="text-xs text-gray-500 mt-2 italic">{criterion.feedback}</p>}
                                    </div>
                                ))}
                            </div>

                            {evaluationSummary.generalFeedback && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-2">General Feedback</h3>
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-gray-700">
                                        {evaluationSummary.generalFeedback}
                                    </div>
                                </div>
                            )}

                            {evaluationSummary.individualMarks?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">Individual Marks</h3>
                                    <div className="space-y-2">
                                        {evaluationSummary.individualMarks.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                                <div>
                                                    <span className="font-medium text-gray-700">{item.studentName}</span>
                                                    <span className="text-xs text-gray-400 ml-2">{item.studentId}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-semibold text-[#2F4F4F]">{item.individualMark}</span>
                                                    <span className="text-xs text-gray-400 ml-1">({item.contribution}% contribution)</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 flex justify-between gap-3">
                            <button
                                onClick={downloadEvaluationPdf}
                                className="flex items-center gap-2 bg-[#2F4F4F] text-white px-5 py-2 rounded-lg hover:bg-[#3A5F5F] transition"
                            >
                                <FaDownload size={14} />
                                Download PDF
                            </button>
                            <button
                                onClick={() => setShowEvaluationSummary(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisorDocumentView;
