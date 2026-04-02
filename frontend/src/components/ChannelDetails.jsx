import { FaSearch, FaEllipsisV } from "react-icons/fa";

const ChannelDetails = ({ chatWith }) => {
    if (!chatWith) return <div className="hidden lg:flex w-72 bg-white border-l border-gray-200"></div>;

    const members = [
        { name: chatWith.username, role: chatWith.role, online: true },
        { name: "My Self", role: "student", online: true },
    ];

    return (
        <div className="hidden lg:flex w-80 bg-white border-l border-gray-100 flex-col font-sans">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-gray-800 font-bold text-sm tracking-wide mb-6">Channel Details</h3>

                <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">DESCRIPTION</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        General discussion area for the ResearchFlow platform development team.
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">MEMBERS — {members.length}</h4>
                    <div className="flex flex-col gap-3">
                        {members.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${m.name}&background=${idx === 0 ? '2F4F4F' : 'FFD700'}&color=${idx === 0 ? 'FFFFFF' : '2F4F4F'}`}
                                        alt=""
                                        className="w-8 h-8 rounded-full"
                                    />
                                    {m.online && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{m.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChannelDetails;
