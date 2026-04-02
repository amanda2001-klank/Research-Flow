import { useState } from "react";
import { FaUpload, FaTimes, FaFile } from "react-icons/fa";

const API = "http://localhost:5000/api";

const DocumentUploadModal = ({ groupId, user, existingDoc, onClose, onSuccess }) => {
    const [title, setTitle] = useState(existingDoc?.title || '');
    const [documentType, setDocumentType] = useState(existingDoc?.documentType || 'Proposal');
    const [description, setDescription] = useState(existingDoc?.description || '');
    const [file, setFile] = useState(null);
    const [comments, setComments] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const isNewVersion = !!existingDoc;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a file");
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            if (isNewVersion) {
                formData.append('uploadedBy', user?.username || 'unknown');
                formData.append('comments', comments);
                const res = await fetch(`${API}/documents/${existingDoc._id}/version`, {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) throw new Error('Upload failed');
            } else {
                formData.append('groupId', groupId);
                formData.append('title', title);
                formData.append('documentType', documentType);
                formData.append('description', description);
                formData.append('uploadedBy', user?.username || 'unknown');
                const res = await fetch(`${API}/documents`, {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) throw new Error('Upload failed');
            }

            onSuccess();
        } catch (err) {
            console.error(err);
            alert("Upload failed. Please try again.");
        }
        setUploading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-[#2F4F4F] to-[#3A5F5F]">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            {isNewVersion ? 'Upload New Version' : 'Upload Document'}
                        </h2>
                        {isNewVersion && <p className="text-sm text-gray-300">{existingDoc.title}</p>}
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-white transition">
                        <FaTimes size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title and Type (only for new docs) */}
                    {!isNewVersion && (
                        <>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Document Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    placeholder="e.g. Research Proposal Draft"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2F4F4F]"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Document Type</label>
                                <select
                                    value={documentType}
                                    onChange={e => setDocumentType(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2F4F4F] bg-white"
                                >
                                    <option value="Proposal">Proposal</option>
                                    <option value="Progress Report">Progress Report</option>
                                    <option value="Final Report">Final Report</option>
                                    <option value="Presentation">Presentation</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={2}
                                    placeholder="Brief description of this document..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2F4F4F] resize-none"
                                />
                            </div>
                        </>
                    )}

                    {/* Version comments (for updates) */}
                    {isNewVersion && (
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Version Notes (Optional)</label>
                            <textarea
                                value={comments}
                                onChange={e => setComments(e.target.value)}
                                rows={2}
                                placeholder="What changed in this version?"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2F4F4F] resize-none"
                            />
                        </div>
                    )}

                    {/* File Drop Zone */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${dragActive ? 'border-[#2F4F4F] bg-[#2F4F4F]/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <input
                            type="file"
                            id="fileInput"
                            onChange={e => setFile(e.target.files[0])}
                            className="hidden"
                        />
                        <label htmlFor="fileInput" className="cursor-pointer">
                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FaFile className="text-[#2F4F4F]" size={20} />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                        <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <FaUpload className="mx-auto text-gray-400 mb-2" size={24} />
                                    <p className="text-sm text-gray-500">Drag & drop a file here or <span className="text-[#2F4F4F] font-medium">browse</span></p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PPT, PPTX up to 50MB</p>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={uploading || !file}
                        className={`w-full py-3 rounded-xl font-medium text-white transition-all ${uploading || !file
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-[#2F4F4F] hover:bg-[#3A5F5F] shadow-md hover:shadow-lg'}`}
                    >
                        {uploading ? 'Uploading...' : (isNewVersion ? `Upload Version ${(existingDoc.currentVersion || 0) + 1}` : 'Upload Document')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DocumentUploadModal;
