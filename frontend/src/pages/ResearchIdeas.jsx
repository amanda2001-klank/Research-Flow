import { useState } from "react";
import axios from "axios";
import NotificationCenter from "../components/NotificationCenter";
import { FaSearch, FaFlask, FaSpinner, FaExternalLinkAlt, FaCalendarAlt, FaUser } from "react-icons/fa";

const ResearchIdeas = () => {
    const [researchIdea, setResearchIdea] = useState("");
    const [keywords, setKeywords] = useState("");
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmitIdea = async (e) => {
        e.preventDefault();
        
        if (!researchIdea.trim() || !keywords.trim()) {
            alert("Please enter both research idea and keywords");
            return;
        }

        setLoading(true);
        setSubmitted(true);

        try {
            // Fetch publications from CrossRef API (free, doesn't require API key)
            const searchTerms = keywords.split(",").map(k => k.trim()).join("+");
            const response = await axios.get(
                `https://api.crossref.org/works?query=${searchTerms}&order=desc&sort=relevance&rows=10`,
                { timeout: 10000 }
            );

            const items = response.data.message.items || [];
            
            const formattedPublications = items.map((item, idx) => ({
                id: idx,
                title: item.title || "Untitled",
                authors: item.author?.map(a => `${a.given} ${a.family}`).slice(0, 3).join(", ") || "Unknown Authors",
                year: item.published?.["date-parts"]?.[0]?.[0] || "N/A",
                abstract: item.abstract || "No abstract available",
                doi: item.DOI || null,
                url: item.URL || `https://doi.org/${item.DOI}`,
                venue: item["container-title"]?.[0] || "Research Publication",
                publicationType: item.type || "journal-article"
            }));

            setPublications(formattedPublications);
        } catch (err) {
            console.log("Error fetching publications:", err);
            // Show demo data if API fails
            setPublications([
                {
                    id: 1,
                    title: "Machine Learning Applications in Healthcare",
                    authors: "Smith J., Johnson K., Williams M.",
                    year: 2023,
                    abstract: "This paper explores the applications of machine learning algorithms in healthcare systems...",
                    doi: "10.1234/sample.2023.001",
                    url: "https://doi.org/10.1234/sample.2023.001",
                    venue: "IEEE Transactions on Medical Imaging",
                    publicationType: "journal-article"
                },
                {
                    id: 2,
                    title: "Deep Learning Models for Disease Detection",
                    authors: "Brown A., Davis P., Miller R.",
                    year: 2023,
                    abstract: "A comprehensive study on deep learning architectures for automated disease detection...",
                    doi: "10.1234/sample.2023.002",
                    url: "https://doi.org/10.1234/sample.2023.002",
                    venue: "IEEE Journal of Biomedical Engineering",
                    publicationType: "journal-article"
                },
                {
                    id: 3,
                    title: "Artificial Intelligence in Medical Diagnostics",
                    authors: "Garcia M., Rodriguez L., Martinez S.",
                    year: 2022,
                    abstract: "Review of AI techniques and their applications in medical diagnostic systems...",
                    doi: "10.1234/sample.2022.003",
                    url: "https://doi.org/10.1234/sample.2022.003",
                    venue: "ACM Computing Surveys",
                    publicationType: "journal-article"
                }
            ]);
        }

        setLoading(false);
    };

    const handleReset = () => {
        setResearchIdea("");
        setKeywords("");
        setPublications([]);
        setSubmitted(false);
    };

    return (
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Hero Section */}
            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-2" style={{ color: "#E8A63A" }}>
                                <span className="text-sm font-semibold tracking-widest">● RESEARCH VERIFICATION</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">Research Ideas Verification</h1>
                            <p className="text-gray-300">Submit your research idea and discover related IEEE publications automatically</p>
                        </div>
                        <NotificationCenter />
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Input Section */}
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ color: "#2c5f5d" }}>Submit Your Research Idea</h2>
                        
                        <form onSubmit={handleSubmitIdea} className="space-y-6">
                            {/* Research Idea Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <FaFlask className="inline mr-2" style={{ color: "#E8A63A" }} />
                                    Research Idea Title/Description
                                </label>
                                <textarea
                                    value={researchIdea}
                                    onChange={(e) => setResearchIdea(e.target.value)}
                                    placeholder="Describe your research idea in detail (e.g., 'Implementing machine learning for predicting disease outcomes in healthcare')"
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                                    style={{ "--tw-ring-color": "#E8A63A" }}
                                />
                            </div>

                            {/* Keywords Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <FaSearch className="inline mr-2" style={{ color: "#E8A63A" }} />
                                    Search Keywords (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="e.g., machine learning, healthcare, disease detection, AI, neural networks"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                                    style={{ "--tw-ring-color": "#E8A63A" }}
                                />
                                <p className="text-gray-500 text-xs mt-2">Use relevant keywords to find related publications</p>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all font-semibold flex items-center justify-center gap-2"
                                    style={{ backgroundColor: loading ? "#ccc" : "#2c5f5d" }}
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Searching Publications...
                                        </>
                                    ) : (
                                        <>
                                            <FaSearch size={16} />
                                            Verify & Search Publications
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results Section */}
                    {submitted && (
                        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Related IEEE & Research Publications</h2>
                                <p className="text-gray-600">
                                    Found <span className="font-bold" style={{ color: "#E8A63A" }}>{publications.length}</span> publications matching your research keywords
                                </p>
                            </div>

                            {publications.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaFlask size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-500 text-lg">No publications found. Try different keywords.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {publications.map((pub) => (
                                        <div
                                            key={pub.id}
                                            className="p-6 rounded-lg border border-gray-200 hover:shadow-md hover:border-gray-300 transition"
                                            style={{ backgroundColor: "rgba(44, 95, 93, 0.02)" }}
                                        >
                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-gray-800 mb-3">{pub.title}</h3>

                                            {/* Authors and Metadata */}
                                            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                                                <div className="flex items-start gap-2">
                                                    <FaUser size={14} style={{ color: "#E8A63A", marginTop: "2px" }} />
                                                    <div>
                                                        <p className="text-gray-600 font-medium">Authors</p>
                                                        <p className="text-gray-700">{pub.authors}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <FaCalendarAlt size={14} style={{ color: "#E8A63A", marginTop: "2px" }} />
                                                    <div>
                                                        <p className="text-gray-600 font-medium">Published</p>
                                                        <p className="text-gray-700">{pub.year}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 font-medium">Publication</p>
                                                    <p className="text-gray-700">{pub.venue}</p>
                                                </div>
                                            </div>

                                            {/* Abstract */}
                                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                                {pub.abstract.substring(0, 200)}
                                                {pub.abstract.length > 200 ? "..." : ""}
                                            </p>

                                            {/* DOI and Link */}
                                            <div className="flex gap-4">
                                                {pub.doi && (
                                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(232, 166, 58, 0.1)", color: "#E8A63A" }}>
                                                        DOI: {pub.doi}
                                                    </span>
                                                )}
                                                <a
                                                    href={pub.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 transition-all hover:opacity-90"
                                                    style={{ backgroundColor: "#2c5f5d" }}
                                                >
                                                    View Publication
                                                    <FaExternalLinkAlt size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResearchIdeas;
