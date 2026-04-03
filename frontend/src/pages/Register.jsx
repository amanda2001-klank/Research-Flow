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

        const generatedUsername =
            email.current.value.split("@")[0] +
            "_" +
            Math.floor(Math.random() * 1000);

        const user = {
            username: generatedUsername,
            email: email.current.value,
            password: password.current.value,
            fullName: fullName.current.value,
            role: role,
        };

        try {
            await axios.post(
                "http://localhost:5000/api/auth/register",
                user
            );
            navigate("/login");
        } catch (err) {
            setError(
                err.response?.data ||
                    "Registration failed. Please try again."
            );
            console.log(err);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 font-sans overflow-hidden relative">
            {/* Left Side - Image Showcase */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#2F4F4F]">
                <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                    alt="University Campus"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-[20s] hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1f1f] via-[#2F4F4F]/40 to-transparent"></div>
                
                <div className="absolute bottom-12 left-12 right-12 text-white z-10">
                    <div className="w-12 h-1 bg-[#FFD700] mb-6 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.6)]"></div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-2xl">
                        Start Your <br/> Academic Journey
                    </h1>
                    <p className="text-lg text-slate-200 max-w-lg font-light leading-relaxed drop-shadow-md">
                        Join an elite community of passionate researchers and supervisors. and push the boundaries of knowledge.
                    </p>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-8 relative overflow-y-auto">
                <div className="w-full max-w-md relative z-10 py-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-lg mb-4 transform transition hover:-translate-y-1 border border-slate-100">
                            <FaGraduationCap className="text-[#2F4F4F] text-3xl" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">ResearchFlow</h2>
                        <p className="text-sm text-slate-500 font-medium">Create your specialized account</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
                        <form onSubmit={handleClick} className="space-y-4">
                            
                            {/* Role */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Register As
                                </label>
                                <div className="relative group">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all appearance-none cursor-pointer text-sm font-medium text-slate-700"
                                    >
                                        <option value="student">Student Researcher</option>
                                        <option value="sponsor">Sponsor</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FFD700] transition-colors">
                                        <FaUser size={14} />
                                    </div>
                                    <input
                                        placeholder="Dr. Julian Vane"
                                        required
                                        ref={fullName}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Institutional Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FFD700] transition-colors">
                                        <FaEnvelope size={14} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="researcher@university.edu"
                                        required
                                        ref={email}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Security Phrase
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FFD700] transition-colors">
                                        <FaLock size={14} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        minLength="6"
                                        ref={password}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Agreement */}
                            <div className="flex items-start gap-2 pt-1">
                                <div className="flex items-center h-4">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="w-4 h-4 text-[#2F4F4F] border-slate-300 rounded focus:ring-[#FFD700] focus:ring-offset-0 cursor-pointer accent-[#2F4F4F] transition-all"
                                    />
                                </div>
                                <p className="text-[12px] text-slate-500 leading-tight cursor-pointer select-none" onClick={() => setAgreed(!agreed)}>
                                    I agree to the <span className="font-bold text-slate-700 hover:text-[#2F4F4F] transition-colors">Terms of Service</span> and <span className="font-bold text-slate-700 hover:text-[#2F4F4F] transition-colors">Privacy Policy</span>.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg animate-pulse">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-xs text-red-700 font-medium">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-[#2F4F4F] text-white font-bold text-sm rounded-xl hover:bg-[#1a2f2f] transform transition active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                                >
                                    Create Account
                                    <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-[13px] text-slate-500 font-medium">
                        Already have an account?{" "}
                        <Link to="/login" className="font-bold text-[#2F4F4F] hover:text-[#1a2f2f] transition-colors hover:underline decoration-2 underline-offset-4">
                            Sign in to your portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
