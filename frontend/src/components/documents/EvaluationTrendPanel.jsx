import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api";

const EvaluationTrendPanel = ({ groupId, title = "Rubric Trend Analytics" }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [trend, setTrend] = useState(null);

    useEffect(() => {
        const fetchTrend = async () => {
            if (!groupId) {
                setTrend(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");
                const res = await fetch(`${API}/evaluations/trends/${groupId}`);
                if (!res.ok) throw new Error("Failed to load trend data");
                const data = await res.json();
                setTrend(data);
            } catch (err) {
                console.error(err);
                setError("Unable to load trend analytics.");
            }
            setLoading(false);
        };

        fetchTrend();
    }, [groupId]);

    const maxTimeline = useMemo(() => {
        const values = (trend?.timeline || []).map((item) => Number(item.totalMark || 0));
        return Math.max(100, ...values);
    }, [trend]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-500">Performance trends from past evaluations</p>
                </div>
                {trend?.summary?.evaluationCount > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                        {trend.summary.evaluationCount} evaluation(s)
                    </span>
                )}
            </div>

            {loading ? (
                <p className="text-sm text-gray-400">Loading trend analytics...</p>
            ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
            ) : !trend?.timeline?.length ? (
                <p className="text-sm text-gray-500">No evaluation records yet to generate trends.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-xs text-gray-500">Average Total</p>
                            <p className="text-2xl font-bold text-gray-800">{trend.summary.averageTotal}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-xs text-gray-500">Latest Total</p>
                            <p className="text-2xl font-bold text-[#2F4F4F]">{trend.summary.lastTotal ?? "-"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-xs text-gray-500">Trend Delta</p>
                            <p className={`text-2xl font-bold ${Number(trend.summary.trendDelta) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {Number(trend.summary.trendDelta) >= 0 ? "+" : ""}{trend.summary.trendDelta}
                            </p>
                        </div>
                    </div>

                    <div className="mb-5">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Timeline</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 items-end">
                            {trend.timeline.map((point, index) => {
                                const height = Math.max(12, Math.round((point.totalMark / maxTimeline) * 90));
                                return (
                                    <div key={`${point.evaluatedAt}_${index}`} className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-2">
                                        <div className="h-24 flex items-end justify-center">
                                            <div
                                                className="w-6 rounded-md bg-gradient-to-t from-[#2F4F4F] to-[#FFD700]"
                                                style={{ height: `${height}px` }}
                                                title={`${point.totalMark}`}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 text-center mt-1 truncate">{point.documentType}</p>
                                        <p className="text-xs font-semibold text-center text-gray-700">{point.totalMark}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Criteria Averages</p>
                        <div className="space-y-2">
                            {(trend.criteria || []).map((criterion) => (
                                <div key={criterion.name} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-700 font-medium">{criterion.name}</span>
                                        <span className="text-sm font-semibold text-[#2F4F4F]">{criterion.average}/100</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-[#2F4F4F] to-[#FFD700]"
                                            style={{ width: `${Math.max(0, Math.min(100, criterion.average))}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        Last: {criterion.lastScore} | Range: {criterion.min} - {criterion.max}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default EvaluationTrendPanel;
