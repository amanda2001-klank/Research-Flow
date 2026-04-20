import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import StudentDocumentView from "../components/documents/StudentDocumentView";
import SupervisorDocumentView from "../components/documents/SupervisorDocumentView";

/**
 * DocumentsPage — main entry point for the Document Management & Evaluation Center.
 *
 * Role routing:
 *   student → StudentDocumentView (upload, version control, view evaluations)
 *   sponsor → SupervisorDocumentView (review, rubric grading, feedback)
 */
const DocumentsPage = () => {
    const { user } = useContext(AuthContext);

    // Group ID from localStorage (set by FortnightPage group setup)
    const storageKey = `fortnightGroupId_${user?._id}`;
    const groupId = localStorage.getItem(storageKey) || null;

    if (user?.role === "sponsor") {
        return <SupervisorDocumentView user={user} />;
    }

    if (user?.role === "student") {
        return <StudentDocumentView user={user} groupId={groupId} />;
    }

    // Admin info
    return (
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
            <div className="max-w-xl mx-auto mt-20 text-center">
                <div className="w-16 h-16 bg-[#2F4F4F] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#FFD700] text-3xl">📄</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Document Management</h1>
                <p className="text-gray-500 text-sm">
                    As an admin, document management is handled by students and supervisors
                    through their respective dashboards.
                </p>
            </div>
        </div>
    );
};

export default DocumentsPage;
