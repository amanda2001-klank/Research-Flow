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
        <div className="min-h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#E2E8F0]">
            {/* Top Dark Wave/Curve Section */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[450px] bg-[#2F4F4F] shadow-2xl z-0"
                style={{ borderRadius: '0 0 50% 50%' }}
            ></div>

            {/* Subtle SVG Node/Network Pattern Over Bottom Section */}
            <div
                className="absolute inset-x-0 bottom-0 top-[400px] z-0 opacity-[0.05]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10L90 90M90 10L10 90' stroke='%232F4F4F' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='10' cy='10' r='1' fill='%232F4F4F'/%3E%3Ccircle cx='90' cy='90' r='1' fill='%232F4F4F'/%3E%3Ccircle cx='90' cy='10' r='1' fill='%232F4F4F'/%3E%3Ccircle cx='10' cy='90' r='1' fill='%232F4F4F'/%3E%3Ccircle cx='50' cy='50' r='1.5' fill='%232F4F4F'/%3E%3C/svg%3E")`,
                    backgroundSize: '150px 150px'
                }}
            ></div>

            {/* Login Card Container */}
            <div className="relative z-10 w-full max-w-md px-4 mt-12">
                {/* Logo and Title Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-4">
                        <FaGraduationCap className="text-[#2F4F4F] text-3xl" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">ResearchFlow</h1>
                    <p className="text-gray-300 text-sm">Accelerating Academic Excellence</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-[6px] border-[#FFD700] transform transition-all duration-500 hover:shadow-3xl">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Secure Login</h2>
                        <p className="text-sm text-gray-500">Select your account type to continue</p>
                    </div>

                    <form onSubmit={handleClick} className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                                Identification
                            </label>
                            <div className="relative">
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition appearance-none cursor-pointer font-medium text-gray-700"
                                >
                                    <option value="student">Student Researcher</option>
                                    <option value="sponsor">Sponsor</option>
                                    <option value="admin">Administrator</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaEnvelope size={18} />
                                </div>
                                <input
                                    placeholder="name@university.edu"
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition font-medium text-gray-700 placeholder:text-gray-300"
                                    ref={email}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-bold text-[#FFD700] hover:text-[#E6C200] transition">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaLock size={18} />
                                </div>
                                <input
                                    placeholder="••••••••"
                                    type="password"
                                    required
                                    minLength="6"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition font-medium text-gray-700 placeholder:text-gray-300"
                                    ref={password}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-[#2F4F4F] text-white font-bold rounded-xl hover:bg-[#3A5F5F] transform transition active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            disabled={isFetching}
                        >
                            {isFetching ? "Signing in..." : "Sign In to Portal"}
                            {!isFetching && <span className="transition-transform group-hover:translate-x-1">→</span>}
                        </button>

                        {/* Error Message */}
                        {error && (
                            <div className="text-red-600 text-sm text-center bg-red-50 p-4 rounded-xl border border-red-100 animate-pulse">
                                <span className="font-bold text-xs uppercase tracking-tight block mb-1">Access Denied</span>
                                <span className="text-xs">{getErrorMessage()}</span>
                            </div>
                        )}
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 text-center text-sm text-gray-400 font-medium">
                        New to ResearchFlow?{" "}
                        <Link to="/register" className="text-gray-700 font-bold hover:underline">
                            Create an account
                        </Link>
                    </div>
                </div>

                {/* Secure Footer Section */}
                <div className="mt-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-[1px] w-12 bg-gray-300"></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Admin Login</span>
                        <div className="h-[1px] w-12 bg-gray-300"></div>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-gray-600 transition">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600 transition">Terms of Use</a>
                        <a href="#" className="hover:text-gray-600 transition">Contact</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
