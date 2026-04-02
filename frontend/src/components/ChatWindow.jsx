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
        <div className="flex-1 flex items-center justify-center bg-[#F8F9FA] text-gray-400 flex-col gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <IoSend className="text-gray-400 transform -rotate-45 ml-1" size={24} />
            </div>
            <p>Select a channel or user to start chatting</p>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-[#F8F9FA] relative">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 flex items-center px-6 justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800 text-lg"># {chatWith.role === 'student' ? 'general' : chatWith.username}</span>
                    {/* {chatWith.role === 'student' && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold">STUDENT</span>} */}
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <FaSearch className="hover:text-gray-600 cursor-pointer" />
                    <FaEllipsisV className="hover:text-gray-600 cursor-pointer" />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">

                {/* Intro Message */}
                <div className="flex items-center gap-4 mb-8 mt-4 justify-center">
                    <div className="h-[1px] bg-gray-200 flex-1"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Today</span>
                    <div className="h-[1px] bg-gray-200 flex-1"></div>
                </div>

                {messages.map((m, idx) => (
                    <div ref={scrollRef} key={idx}>
                        <Message message={m} own={m.sender === user._id} />
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-gray-200">
                <div className="bg-white border border-gray-200 rounded-xl flex items-center p-2 shadow-sm focus-within:border-indigo-300 focus-within:ring-2 ring-indigo-50 transition-all">
                    <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition">
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
                        className="bg-[#2F4F4F] text-white p-2.5 rounded-lg hover:bg-[#253f3f] transition shadow-md"
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
