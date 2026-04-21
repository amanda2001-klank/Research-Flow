import { useState, useContext } from "react";
import axios from "axios";
import { IoChatbubbles, IoClose, IoSend } from "react-icons/io5";
import { AuthContext } from "../context/AuthContext";

const AIBot = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! I\'m your ResearchFlow AI assistant. How can I help you today?' }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/api/ai/query", { 
                question: input,
                userId: user?._id || "guest"
            });
            const botMessage = { sender: 'bot', text: res.data.answer || "I couldn't find an answer to that." };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error("AI Error:", err);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition transform hover:scale-105 flex items-center gap-2"
                    title="Open AI Assistant"
                >
                    <IoChatbubbles size={28} />
                </button>
            )}

            {isOpen && (
                <div className="bg-white w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
                        <div>
                            <span className="font-semibold text-lg">🤖 AI Assistant</span>
                            <p className="text-xs text-indigo-100 mt-1">Powered by ResearchFlow</p>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            title="Close chat"
                            className="hover:bg-indigo-700 p-1 rounded transition"
                        >
                            <IoClose size={24} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3 flex flex-col">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.sender === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-br-none' 
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-800 rounded-lg rounded-bl-none border border-gray-200 p-3 flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full animate-bounce bg-indigo-600"></div>
                                        <div className="w-2 h-2 rounded-full animate-bounce bg-indigo-600" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 rounded-full animate-bounce bg-indigo-600" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-300 p-3 bg-white flex gap-2">
                        <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                        />
                        <button 
                            onClick={handleSend} 
                            disabled={loading || !input.trim()}
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Send message"
                        >
                            <IoSend size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIBot;
