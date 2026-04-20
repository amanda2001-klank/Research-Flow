import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaQuestionCircle, FaSearch } from 'react-icons/fa';

const FAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    async function fetchFAQs() {
        try {
            const res = await axios.get('http://localhost:5000/api/faq');
            setFaqs(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching FAQs:', err);
            setLoading(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchFAQs();
    }, []);

    const categories = ['all', ...new Set(faqs.map(faq => faq.category))];

    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Hero Section */}
            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                <div className="max-w-6xl mx-auto">
                    <div>
                        <div className="mb-2" style={{ color: "#E8A63A" }}>
                            <span className="text-sm font-semibold tracking-widest">❓ FREQUENTLY ASKED QUESTIONS</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Help & Support</h1>
                        <p className="text-gray-300">Find answers to common questions about the platform</p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Search and Filter */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search FAQs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                                    style={{ focusRingColor: "#2c5f5d" }}
                                />
                            </div>

                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                                style={{ focusRingColor: "#E8A63A" }}
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* FAQ List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading FAQs...</div>
                        ) : filteredFAQs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No FAQs found</div>
                        ) : (
                            filteredFAQs.map((faq) => (
                                <div
                                    key={faq._id}
                                    className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "#E8A63A" }}>
                                            Q
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-800 mb-2">
                                                {faq.question}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                    {faq.category}
                                                </span>
                                                {faq.tags && faq.tags.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-block px-3 py-1 text-xs rounded-full text-white"
                                                        style={{ backgroundColor: "#2c5f5d" }}
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
