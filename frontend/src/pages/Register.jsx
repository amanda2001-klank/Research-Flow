import axios from "axios";
import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaGraduationCap, FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const Register = () => {
    const email = useRef();
    const password = useRef();
    const fullName = useRef();
    const navigate = useNavigate();
    const [role, setRole] = useState("student");
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState("");

    const handleClick = async (e) => {
        e.preventDefault();

        if (!agreed) {
            setError("Please agree to the terms and conditions");
            return;
        }

        // Derive username from email (the part before @) since the field was removed to match the UI image
        const generatedUsername = email.current.value.split('@')[0] + '_' + Math.floor(Math.random() * 1000);

        const user = {
            username: generatedUsername,
            email: email.current.value,
            password: password.current.value,
            fullName: fullName.current.value,
            role: role
        };

        try {
            await axios.post("http://localhost:5000/api/auth/register", user);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data || "Registration failed. Please try again.");
            console.log(err);
        }
    };

    return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#E2E8F0] py-16">
            {/* Top Dark Wave/Curve Section */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[450px] bg-[#2F4F4F] shadow-2xl z-0"
                style={{ borderRadius: '0 0 50% 50%' }}
            ></div>

            {/* Subtle SVG Node/Network Pattern Over Bottom Section */}
            <div
                className="absolute inset-x-0 bottom-0 top-[400px] z-0 opacity-[0.05]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10L90 90M90 10L10 90' stroke='%232F4F4F' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='10' cy='10' r='1' fill='%232F4F4F'/%3E%3Ccircle cx='90' cy='90' r='1' fill='%232F4F4F'/%3E%3Ccircle cx='90' cy='10' r='1' fill='%232F4F4F'/%3E%3Ccircle cx='10' cy='10' r='1' fill='%232F4F4F'/%3E%3Ccircle cx='50' cy='50' r='1.5' fill='%232F4F4F'/%3E%3C/svg%3E")`,
                    backgroundSize: '150px 150px'
                }}
            ></div>

            {/* Register Card Container */}
            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo and Title Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-4">
                        <FaGraduationCap className="text-[#2F4F4F] text-3xl" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">ResearchFlow</h1>
                    <p className="text-gray-300 text-sm">Join the network of academic innovation</p>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-[6px] border-[#FFD700] transform transition-all duration-500">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
                        <p className="text-sm text-gray-500">Begin your collaborative research journey</p>
                    </div>

                    <form onSubmit={handleClick} className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                                Register As
                            </label>
                            <div className="relative">
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition appearance-none cursor-pointer font-medium text-gray-700"
                                >
                                    <option value="student">Student Researcher</option>
                                    <option value="sponsor">Sponsor</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaUser size={16} />
                                </div>
                                <input
                                    placeholder="Dr. Julian Vane"
                                    required
                                    ref={fullName}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition font-medium text-gray-700 placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        {/* Institutional Email */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                                Institutional Email
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaEnvelope size={16} />
                                </div>
                                <input
                                    placeholder="researcher@university.edu"
                                    required
                                    ref={email}
                                    type="email"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition font-medium text-gray-700 placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        {/* Security Phrase (Password) */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                                Security Phrase
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaLock size={16} />
                                </div>
                                <input
                                    placeholder="••••••••"
                                    required
                                    ref={password}
                                    type="password"
                                    minLength="6"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition font-medium text-gray-700 placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        {/* Ethics Agreement */}
                        <div className="flex items-start gap-4 p-1">
                            <input
                                type="checkbox"
                                id="agreement"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 w-4 h-4 text-[#2F4F4F] border-gray-300 rounded-lg focus:ring-[#FFD700] cursor-pointer"
                            />
                            <label htmlFor="agreement" className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none">
                                I agree to the{" "}
                                <a href="#" className="font-bold text-gray-700 underline decoration-[#FFD700]">Research Ethics Code</a>
                                {" "}and the{" "}
                                <a href="#" className="font-bold text-gray-700 underline decoration-[#FFD700]">Data Processing Agreement</a>.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-[#2F4F4F] text-white font-bold rounded-xl hover:bg-[#3A5F5F] transform transition active:scale-[0.98] shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 group"
                        >
                            Initialize Account
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                        </button>

                        {/* Error Message */}
                        {error && (
                            <div className="text-red-600 text-xs text-center bg-red-50 p-4 rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 text-center text-sm text-gray-400 font-medium">
                        Already a member?{" "}
                        <Link to="/login" className="text-gray-700 font-bold hover:underline">
                            Sign in instead
                        </Link>
                    </div>
                </div>

                {/* Secure Footer Section */}
                <div className="mt-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-[1px] w-12 bg-gray-300"></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Encrypted & Secure</span>
                        <div className="h-[1px] w-12 bg-gray-300"></div>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-gray-600 transition flex items-center gap-2">
                            Documentation
                        </a>
                        <a href="#" className="hover:text-gray-600 transition flex items-center gap-2">
                            Help Center
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
