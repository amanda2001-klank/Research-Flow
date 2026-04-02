import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import NotificationCenter from "../components/NotificationCenter";
import { FaFileUpload, FaCheckCircle, FaExclamationTriangle, FaLink } from "react-icons/fa";

const PlagiarismChecker = () => {
    const { user } = useContext(AuthContext);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [scanResults, setScanResults] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const handleScan = async () => {
        if (!uploadedFile) return;
        
        setIsScanning(true);
        // Simulate scanning delay
        setTimeout(() => {
            setScanResults({
                fileName: uploadedFile.name,
                overallSimilarity: 18,
                status: "passed",
                matchedSources: [
                    {
                        id: 1,
                        source: "Research Paper XYZ",
                        similarity: 8,
                        url: "https://example.com/paper1"
                    },
                    {
                        id: 2,
                        source: "Wikipedia Article",
                        similarity: 7,
                        url: "https://wikipedia.org/article"
                    },
                    {
                        id: 3,
                        source: "Journal Publication",
                        similarity: 3,
                        url: "https://example.com/journal"
                    }
                ],
                scanDate: new Date().toLocaleDateString(),
                scanTime: new Date().toLocaleTimeString()
            });
            setIsScanning(false);
        }, 2000);
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Plagiarism Checker</h1>
                        <p className="text-gray-600 mt-2">Check your research papers for originality</p>
                    </div>
                    <NotificationCenter />
                </div>

                {/* Upload Section */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Upload Document</h2>
                    
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 hover:bg-blue-100 transition cursor-pointer">
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                            id="fileInput"
                        />
                        <label htmlFor="fileInput" className="cursor-pointer">
                            <FaFileUpload className="text-4xl text-blue-600 mx-auto mb-4" />
                            <p className="text-lg font-semibold text-gray-800">
                                {uploadedFile ? uploadedFile.name : "Drop your file here or click to select"}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">Supported formats: PDF, DOC, DOCX, TXT (Max 50MB)</p>
                        </label>
                    </div>

                    <button
                        onClick={handleScan}
                        disabled={!uploadedFile || isScanning}
                        className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isScanning ? "Scanning..." : "Scan for Plagiarism"}
                    </button>
                </div>

                {/* Results Section */}
                {scanResults && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-8 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">Scan Results</h2>
                                    <p className="text-sm text-gray-600">File: {scanResults.fileName}</p>
                                    <p className="text-sm text-gray-600">Scanned: {scanResults.scanDate} at {scanResults.scanTime}</p>
                                </div>
                                <div className="text-right">
                                    <div className={`text-5xl font-bold ${scanResults.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                                        {scanResults.overallSimilarity}%
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 uppercase font-semibold">
                                        {scanResults.status === 'passed' ? (
                                            <span className="text-green-600 flex items-center justify-end gap-1">
                                                <FaCheckCircle size={16} /> Passed
                                            </span>
                                        ) : (
                                            <span className="text-red-600 flex items-center justify-end gap-1">
                                                <FaExclamationTriangle size={16} /> High Similarity
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Similarity Threshold Info */}
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    ✓ Your similarity score is below the acceptable threshold (25%). Your work appears to be original.
                                </p>
                            </div>
                        </div>

                        {/* Matched Sources */}
                        <div className="p-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Matched Sources</h3>
                            <div className="space-y-4">
                                {scanResults.matchedSources.map((source) => (
                                    <div key={source.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800">{source.source}</h4>
                                                <a 
                                                    href={source.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                                >
                                                    <FaLink size={12} /> View Source
                                                </a>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-2xl font-bold ${source.similarity > 5 ? 'text-orange-600' : 'text-green-600'}`}>
                                                    {source.similarity}%
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">Match</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlagiarismChecker;
