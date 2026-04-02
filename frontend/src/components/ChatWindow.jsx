import { useContext, useEffect, useRef, useState } from "react";
import Message from "./Message";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import axios from "axios";
import { IoSend, IoAttach } from "react-icons/io5";
import { FaSearch, FaEllipsisV } from "react-icons/fa";

const ChatWindow = ({ chatWith }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const { user } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const scrollRef = useRef();

    useEffect(() => {
        if (!chatWith) return;
        const getMessages = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/messages/" + user._id + "/" + chatWith._id);
                setMessages(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        getMessages();
    }, [chatWith, user._id]);

    useEffect(() => {
        if (!socket) return;
        socket.on("receive_message", (data) => {
            if (data.sender === chatWith?._id) {
                setMessages((prev) => [...prev, data]);
            }
        });
    }, [socket, chatWith]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            sender: user._id,
            recipient: chatWith._id,
            content: newMessage,
            createdAt: Date.now(),
            senderName: user.username // Helper for UI
        };

        socket.emit("send_message", {
            ...message,
            room: chatWith._id,
        });

        try {
            const res = await axios.post("http://localhost:5000/api/messages", message);
            setMessages([...messages, res.data]);
            setNewMessage("");
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!chatWith) return (
        <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4" style={{ backgroundColor: "#f5f5f5" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#e0e0e0" }}>
                <IoSend className="transform -rotate-45 ml-1" size={24} style={{ color: "#999" }} />
            </div>
            <p>Select a channel or user to start chatting</p>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col relative" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Header */}
            <div className="h-16 border-b flex items-center px-6 justify-between bg-white shadow-sm z-10" style={{ borderColor: "#ddd" }}>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800 text-lg"># {chatWith.role === 'student' ? 'general' : chatWith.username}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <FaSearch className="hover:cursor-pointer" style={{ color: "#999" }} />
                    <FaEllipsisV className="hover:cursor-pointer" style={{ color: "#999" }} />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">

                {/* Intro Message */}
                <div className="flex items-center gap-4 mb-8 mt-4 justify-center">
                    <div className="h-[1px] flex-1" style={{ backgroundColor: "#ddd" }}></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Today</span>
                    <div className="h-[1px] flex-1" style={{ backgroundColor: "#ddd" }}></div>
                </div>

                {messages.map((m, idx) => (
                    <div ref={scrollRef} key={idx}>
                        <Message message={m} own={m.sender === user._id} />
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t" style={{ backgroundColor: "rgba(255,255,255,0.5)", borderColor: "#ddd" }}>
                <div className="bg-white border rounded-lg flex items-center p-2 shadow-sm transition-all" style={{ borderColor: "#ddd" }}>
                    <button className="p-2 rounded-full hover:bg-gray-50 transition" style={{ color: "#999" }}>
                        <IoAttach size={20} />
                    </button>
                    <input
                        className="flex-1 p-2 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                        placeholder={`Message #${chatWith.username}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                    />
                    <button
                        className="text-white p-2.5 rounded-lg hover:opacity-90 transition shadow-md"
                        style={{ backgroundColor: "#E8A63A" }}
                        onClick={handleSubmit}
                        disabled={!newMessage.trim()}
                    >
                        <IoSend size={16} />
                    </button>
                </div>
                <div className="text-[10px] text-gray-400 mt-2 flex gap-4 px-2">
                    <span className="cursor-pointer hover:text-gray-600"><b>B</b> Bold</span>
                    <span className="cursor-pointer hover:text-gray-600"><i>I</i> Italic</span>
                    <span className="cursor-pointer hover:text-gray-600 font-mono">{'<>'} Code</span>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
