import { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AIBot from '../components/AIBot';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';

const AIAssistant = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        {
            sender: 'ai',
            content: 'Hello! I\'m your ResearchFlow AI assistant. How can I help you with your research today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            sender: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/ai/query', {
                question: input,
                userId: user._id
            });

            const aiMessage = {
                sender: 'ai',
                content: res.data.answer || 'I\'m sorry, I couldn\'t find a specific answer for that. Please try rephrasing.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error("Frontend AI Error:", err);
            const errorMessage = {
                sender: 'ai',
                content: 'Sorry, I encountered an error connecting to my research engine. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Header */}
            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                <div className="max-w-6xl mx-auto">
                    <div>
                        <div className="mb-2" style={{ color: "#E8A63A" }}>
                            <span className="text-sm font-semibold tracking-widest">🤖 AI ASSISTANT</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Research AI Companion</h1>
                        <p className="text-gray-300">Ask me anything about your research or studies</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] p-4 rounded-2xl ${msg.sender === 'user'
                                    ? 'text-white'
                                    : 'bg-white border border-gray-200 text-gray-800'
                                    }`}
                                style={msg.sender === 'user' ? { backgroundColor: "#2c5f5d" } : {}}
                            >
                                {msg.sender === 'ai' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaRobot style={{ color: "#E8A63A" }} />
                                        <span className="font-semibold text-sm">AI Assistant</span>
                                    </div>
                                )}
                                <p className="leading-relaxed">{msg.content}</p>
                                <span className={`text-xs mt-2 block ${msg.sender === 'user' ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="max-w-[70%] p-4 rounded-2xl bg-white border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#E8A63A" }}></div>
                                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#E8A63A", animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "#E8A63A", animationDelay: '0.4s' }}></div>
                                    </div>
                                    <span className="text-gray-500 text-sm">AI is typing...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-6" style={{ backgroundColor: "#fff" }}>
                <div className="max-w-4xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your question..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                        disabled={loading}
                        style={{ focusRingColor: "#E8A63A" }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                        style={{ backgroundColor: "#E8A63A" }}
                    >
                        <FaPaperPlane />
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
