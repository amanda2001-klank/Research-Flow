import { useEffect, useMemo, useState } from "react";
import { FaExchangeAlt, FaTimes } from "react-icons/fa";

const API = "http://localhost:5000/api";

const formatSize = (bytes = 0) => `${(Number(bytes || 0) / (1024 * 1024)).toFixed(2)} MB`;

const VersionCompareModal = ({ doc, onClose }) => {
    const sortedVersions = useMemo(
        () => [...(doc?.versions || [])].sort((a, b) => a.versionNumber - b.versionNumber),
        [doc]
    );

    const [fromVersion, setFromVersion] = useState(null);
    const [toVersion, setToVersion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [comparison, setComparison] = useState(null);

    useEffect(() => {
        if (!doc) return;
        const latest = doc.currentVersion || sortedVersions[sortedVersions.length - 1]?.versionNumber || 1;
        setToVersion(latest);
        setFromVersion(Math.max(1, latest - 1));
    }, [doc, sortedVersions]);

    useEffect(() => {
        const fetchComparison = async () => {
            if (!doc?._id || !fromVersion || !toVersion) return;
            if (fromVersion === toVersion) return;

            try {
                setLoading(true);
                setError("");
                const res = await fetch(`${API}/documents/${doc._id}/compare?from=${fromVersion}&to=${toVersion}`);
                if (!res.ok) throw new Error("Failed to compare versions");
                const data = await res.json();
                setComparison(data.comparison);
            } catch (err) {
                console.error(err);
                setError("Unable to compare selected versions.");
                setComparison(null);
            }
            setLoading(false);
        };

        fetchComparison();
    }, [doc, fromVersion, toVersion]);

    if (!doc) return null;

    const noComparisonPossible = sortedVersions.length < 2;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#2F4F4F] to-[#3A5F5F] flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white">Version Comparison</h2>
                        <p className="text-sm text-gray-200 mt-0.5">{doc.title}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-white transition">
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="p-5">
                    {noComparisonPossible ? (
                        <p className="text-sm text-gray-500">At least two versions are needed to compare changes.</p>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <div className="min-w-[140px]">
                                    <label className="text-xs text-gray-500 mb-1 block">From Version</label>
                                    <select
                                        value={fromVersion || ""}
                                        onChange={(e) => setFromVersion(Number(e.target.value))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2F4F4F]"
                                    >
                                        {sortedVersions.map((v) => (
                                            <option key={`from_${v.versionNumber}`} value={v.versionNumber}>v{v.versionNumber}</option>
                                        ))}
                                    </select>
                                </div>
                                <FaExchangeAlt className="text-gray-400 mt-5" size={14} />
                                <div className="min-w-[140px]">
                                    <label className="text-xs text-gray-500 mb-1 block">To Version</label>
                                    <select
                                        value={toVersion || ""}
                                        onChange={(e) => setToVersion(Number(e.target.value))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2F4F4F]"
                                    >
                                        {sortedVersions.map((v) => (
                                            <option key={`to_${v.versionNumber}`} value={v.versionNumber}>v{v.versionNumber}</option>
                                        ))}
                                    </select>
                                </div>
                                {fromVersion === toVersion && (
                                    <p className="text-xs text-red-500 mt-5">Select different versions to compare.</p>
                                )}
                            </div>

                            {loading ? (
                                <p className="text-sm text-gray-400">Comparing versions...</p>
                            ) : error ? (
                                <p className="text-sm text-red-500">{error}</p>
                            ) : comparison ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 mb-1">From</p>
                                            <p className="text-sm font-semibold text-gray-800">v{comparison.from.versionNumber} - {comparison.from.fileName}</p>
                                            <p className="text-xs text-gray-500 mt-1">{formatSize(comparison.from.fileSize)}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(comparison.from.uploadedAt).toLocaleString()}</p>
                                            {comparison.from.comments && (
                                                <p className="text-xs text-gray-600 mt-2 italic">"{comparison.from.comments}"</p>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                            <p className="text-xs text-gray-500 mb-1">To</p>
                                            <p className="text-sm font-semibold text-gray-800">v{comparison.to.versionNumber} - {comparison.to.fileName}</p>
                                            <p className="text-xs text-gray-500 mt-1">{formatSize(comparison.to.fileSize)}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(comparison.to.uploadedAt).toLocaleString()}</p>
                                            {comparison.to.comments && (
                                                <p className="text-xs text-gray-600 mt-2 italic">"{comparison.to.comments}"</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                        <p className="text-sm font-semibold text-gray-800 mb-2">Change Summary</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                            <p className="text-gray-600">Filename changed: <strong>{comparison.fileNameChanged ? "Yes" : "No"}</strong></p>
                                            <p className="text-gray-600">File type changed: <strong>{comparison.fileTypeChanged ? "Yes" : "No"}</strong></p>
                                            <p className="text-gray-600">Size delta: <strong>{comparison.fileSizeDeltaMb} MB</strong></p>
                                            <p className="text-gray-600">Upload gap: <strong>{comparison.timeDeltaHours} hour(s)</strong></p>
                                            <p className="text-gray-600">Version notes changed: <strong>{comparison.commentsChanged ? "Yes" : "No"}</strong></p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Select versions to compare.</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersionCompareModal;
