import { useState } from "react";
import axios from "axios";
import { IoChatbubbles, IoClose, IoSend } from "react-icons/io5";

const AIBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! How can I help you today?' }]);
    const [input, setInput] = useState("");

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");

        try {
            const res = await axios.post("http://localhost:5000/api/ai/ask", { query: input });
            const botMessage = { sender: 'bot', text: res.data.answer };
            setMessages(prev => [...prev, botMessage]);
        } catch {
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting." }]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition transform hover:scale-105"
                >
                    <IoChatbubbles size={28} />
                </button>
            )}

            {isOpen && (
                <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
                        <span className="font-semibold">AI Assistant</span>
                        <button onClick={() => setIsOpen(false)}><IoClose size={20} /></button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-3">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${m.sender === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-2 border-t flex gap-2">
                        <input
                            type="text"
                            className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="Ask anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} className="text-indigo-600 hover:text-indigo-800">
                            <IoSend size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIBot;
