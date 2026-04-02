import { useContext, useRef, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaGraduationCap, FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
    const email = useRef();
    const password = useRef();
    const { isFetching, error, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();
    const [role, setRole] = useState("student");

    const getErrorMessage = () => {
        if (!error) return "";
        if (error.code === "ERR_NETWORK") {
            return "Cannot connect to server. Start backend on http://localhost:5000 and try again.";
        }
        return error.response ? error.response.data : error.message;
    };

    const handleClick = async (e) => {
        e.preventDefault();
        dispatch({ type: "LOGIN_START" });
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                email: email.current.value,
                password: password.current.value,
            });
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
            navigate("/");
        } catch (err) {
            dispatch({ type: "LOGIN_FAILURE", payload: err });
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
                        Welcome to <br/> ResearchFlow
                    </h1>
                    <p className="text-lg text-slate-200 max-w-lg font-light leading-relaxed drop-shadow-md">
                        Accelerating Academic Excellence. Connect, collaborate, and manage campus assets seamlessly in one integrated platform.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-8 relative overflow-y-auto">
                <div className="w-full max-w-md relative z-10 py-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-lg mb-4 transform transition hover:-translate-y-1 border border-slate-100">
                            <FaGraduationCap className="text-[#2F4F4F] text-3xl" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">Secure Login</h2>
                        <p className="text-sm text-slate-500 font-medium">Access your academic workspace</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
                        <form onSubmit={handleClick} className="space-y-4">
                            
                            {/* Role */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Identification
                                </label>
                                <div className="relative group">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all appearance-none cursor-pointer text-sm font-medium text-slate-700"
                                    >
                                        <option value="student">Student Researcher</option>
                                        <option value="sponsor">Sponsor</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FFD700] transition-colors">
                                        <FaEnvelope size={14} />
                                    </div>
                                    <input
                                        placeholder="name@university.edu"
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                        ref={email}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <a href="#" className="text-[11px] font-bold text-[#FFD700] hover:text-[#e6c200] transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FFD700] transition-colors">
                                        <FaLock size={14} />
                                    </div>
                                    <input
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                        minLength="6"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                        ref={password}
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg animate-pulse">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-xs text-red-700 font-medium">{getErrorMessage()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-[#2F4F4F] text-white font-bold text-sm rounded-xl hover:bg-[#1a2f2f] transform transition active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={isFetching}
                                >
                                    {isFetching ? (
                                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Sign In to Portal
                                            <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-[13px] text-slate-500 font-medium">
                        New to ResearchFlow?{" "}
                        <Link to="/register" className="font-bold text-[#2F4F4F] hover:text-[#1a2f2f] transition-colors hover:underline decoration-2 underline-offset-4">
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
