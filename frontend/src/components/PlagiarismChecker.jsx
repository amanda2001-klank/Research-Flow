import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaLink, FaUpload, FaSpinner } from 'react-icons/fa';

const PlagiarismChecker = () => {
    const { user } = useContext(AuthContext);
    const { isDark } = useContext(ThemeContext);
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const allowedTypes = [
            'text/plain',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Please upload a valid PDF, DOCX, or TXT file.');
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setText(''); // Clear text when file is selected
        setError('');
    };

    const handleCheck = async () => {
        if (!text.trim() && !file) {
            setError('Please provide text or upload a document for analysis.');
            return;
        }

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const formData = new FormData();
            if (file) {
                formData.append('document', file);
            } else {
                formData.append('text', text);
            }
            formData.append('userRole', user?.role);

            const res = await axios.post('http://localhost:5000/api/plagiarism/check', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setResults(res.data);
        } catch (err) {
            console.error("Plagiarism Check Error:", err);
            setError(err.response?.data?.error || 'An error occurred while checking plagiarism.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-gray-50'} transition-colors duration-300`}>
            {/* Header */}
            <div className={`border-b px-8 py-6 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h1 className={`text-3xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    <FaFileAlt className="text-[#FFD700]" />
                    Plagiarism Checker
                </h1>
                <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Unlimited document analysis for PDF, DOCX, and TXT research papers</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Input Area */}
                    <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="p-6">
                            <label className={`block text-sm font-bold mb-4 uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Research Document Source
                            </label>

                            {file ? (
                                <div className={`w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-[#FFD700] rounded-xl mb-4 p-4 text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <FaFileAlt size={32} className="text-[#2F4F4F] mb-2" />
                                    <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{file.name}</p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{(file.size / 1024).toFixed(1)} KB • Ready for analysis</p>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-[#FF6B6B] text-xs font-bold mt-2 uppercase tracking-widest hover:underline"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            ) : (
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Paste your research content here..."
                                    className={`w-full h-64 p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all resize-none font-sans leading-relaxed mb-4 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                                />
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex gap-3">
                                    <label className="px-4 py-2 bg-[#2F4F4F] text-white rounded-lg cursor-pointer hover:bg-[#3A5F5F] transition-all flex items-center gap-2 text-sm font-medium shadow-sm">
                                        <FaUpload />
                                        Upload Document
                                        <input type="file" className="hidden" accept=".txt,.pdf,.docx" onChange={handleFileChange} />
                                    </label>
                                    {text && (
                                        <button
                                            onClick={() => setText('')}
                                            className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                                        >
                                            Clear Text
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={handleCheck}
                                    disabled={loading || (!text.trim() && !file)}
                                    className="px-8 py-3 bg-[#FFD700] text-[#2F4F4F] rounded-xl hover:bg-[#F3CB00] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center gap-2 shadow-lg shadow-[#FFD700]/20"
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Deep Scanning...
                                        </>
                                    ) : (
                                        <>
                                            Scan Whole Document
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && (
                                <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 text-sm border ${isDark ? 'bg-red-900 text-red-200 border-red-800' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    <FaExclamationTriangle />
                                    {error}
                                </div>
                            )}

                            <div className={`mt-6 flex gap-6 border-t pt-6 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    PDF Support
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                    Word (DOCX) Support
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <div className="w-2 h-2 rounded-full bg-[#FFD700]"></div>
                                    Unlimited Length
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Area */}
                    {results && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Summary Card */}
                            <div className={`rounded-2xl shadow-sm border p-8 flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Deep Scan Analysis</h2>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${results.percentage > 20 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                                }`}>
                                                {results.analysisStatus}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-8">
                                        <div>
                                            <div className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{results.metadata.wordCount}</div>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total Words</div>
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{results.metadata.chunksAnalyzed}</div>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Verified Zones</div>
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{results.matchedSources.length}</div>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Matches</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className={`text-5xl font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>{results.percentage}%</div>
                                        <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Global Similarity</div>
                                    </div>
                                    <div className={`w-20 h-20 rounded-full border-8 flex items-center justify-center relative overflow-hidden shadow-inner ${isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-50 bg-gray-50'}`}>
                                        <div
                                            className={`absolute bottom-0 w-full transition-all duration-1000 ${results.percentage > 20 ? 'bg-red-500' : 'bg-green-500'
                                                }`}
                                            style={{ height: `${results.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Matched Sources */}
                            <div className="space-y-4">
                                <h3 className={`text-sm font-bold uppercase tracking-widest px-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Matched Sources ({results.matchedSources.length})</h3>
                                {results.matchedSources.length > 0 ? (
                                    <div className="grid gap-4">
                                        {results.matchedSources.map((source, index) => (
                                            <div key={index} className={`p-6 rounded-2xl shadow-sm border transition-colors group ${isDark ? 'bg-gray-800 border-gray-700 hover:border-[#FFD700]' : 'bg-white border-gray-200 hover:border-[#FFD700]'}`}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="space-y-1">
                                                    <h4 className={`font-bold group-hover:transition-colors ${isDark ? 'text-white group-hover:text-[#FFD700]' : 'text-gray-800 group-hover:text-[#2F4F4F]'}`}>{source.title}</h4>
                                                    <div className={`flex items-center gap-1 text-xs font-medium opacity-60 hover:opacity-100 transition-opacity ${isDark ? 'text-indigo-400' : 'text-[#2F4F4F]'}`}>
                                                            <FaLink size={10} />
                                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-sm">
                                                                {source.url}
                                                            </a>
                                                        </div>
                                                    </div>
                                                <div className={`px-3 py-1 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                                                    <span className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{source.similarity}%</span>
                                                    </div>
                                                </div>
                                                <p className={`text-sm leading-relaxed italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    "{source.snippet}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`p-12 rounded-2xl border border-dashed text-center space-y-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FaCheckCircle size={24} />
                                        </div>
                                        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Zero Matches Found</h4>
                                        <p className={`text-sm max-w-xs mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>This content appears to be 100% unique based on our web index.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlagiarismChecker;
