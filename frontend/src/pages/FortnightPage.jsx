import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import GroupSetupForm from "../components/fortnight/GroupSetupForm";
import LeaderView from "../components/fortnight/LeaderView";
import SupervisorView from "../components/fortnight/SupervisorView";

/**
 * FortnightPage — main entry point for the Fortnight Log & Progress component.
 *
 * Role routing:
 *   student → Leader flow  (setup form if no group, then LeaderView)
 *   sponsor → SupervisorView
 *   admin   → info message (admins manage via admin panel)
 */
const FortnightPage = () => {
    const { user } = useContext(AuthContext);

    // Group ID is stored in localStorage per user so it persists across sessions
    const storageKey = `fortnightGroupId_${user?._id}`;

    const [groupId, setGroupId] = useState(
        () => localStorage.getItem(storageKey) || null
    );

    // Called by GroupSetupForm once the group is successfully registered
    const handleSetupComplete = (newGroupId) => {
        localStorage.setItem(storageKey, newGroupId);
        setGroupId(newGroupId);
    };

    // ── Sponsor / Supervisor ──────────────────────────────────────────────────
    if (user?.role === "sponsor") {
        return <SupervisorView user={user} />;
    }

    // ── Student / Leader ──────────────────────────────────────────────────────
    if (user?.role === "student") {
        if (!groupId) {
            return (
                <GroupSetupForm user={user} onSetupComplete={handleSetupComplete} />
            );
        }
        return <LeaderView user={user} groupId={groupId} />;
    }

    // ── Admin ─────────────────────────────────────────────────────────────────
    if (user?.role === "admin") {
        return (
            <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
                <div className="max-w-xl mx-auto mt-20 text-center">
                    <div className="w-16 h-16 bg-[#2F4F4F] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-[#FFD700] text-3xl">📋</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Fortnight Log</h1>
                    <p className="text-gray-500 text-sm">
                        As an admin, you can view all group data via the{" "}
                        <strong>Manage Students</strong> panel. Individual group
                        leaders and supervisors manage fortnight submissions directly
                        through their respective dashboards.
                    </p>
                </div>
            </div>
        );
    }

    return null;
};

export default FortnightPage;
