import { format } from "timeago.js";

const Message = ({ message, own }) => {
    return (
        <div className={`flex flex-col ${own ? "items-end" : "items-start"} mt-4 mb-2`}>
            <div className="flex gap-2 max-w-[70%] items-end">
                {!own && (
                    <img
                        src={`https://ui-avatars.com/api/?name=${message.senderName || 'U'}&background=E8A63A&color=fff`}
                        className="w-8 h-8 rounded-full mb-1"
                        alt=""
                    />
                )}

                <div className={`p-4 shadow-sm relative`} style={{
                    backgroundColor: own ? "#2c5f5d" : "#fff",
                    color: own ? "#fff" : "#333",
                    borderRadius: own ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    border: own ? "none" : "1px solid #ddd"
                }}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
            </div>
            <div className={`text-[10px] text-gray-400 mt-1 ${own ? "mr-1" : "ml-11"}`}>
                {format(message.createdAt)}
            </div>
        </div>
    );
};

export default Message;
