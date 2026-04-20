import { useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const email = useRef();
    const password = useRef();
    const { isFetching, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

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
        <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
            <div className="w-96 p-8 bg-white rounded-xl shadow-lg flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-indigo-600 text-center">CampusConnect</h3>
                <span className="text-gray-500 text-sm text-center">Login to your account</span>
                <form onSubmit={handleClick} className="flex flex-col gap-4">
                    <input
                        placeholder="Email"
                        type="email"
                        required
                        className="p-3 border rounded-lg focus:outline-none focus:border-indigo-500"
                        ref={email}
                    />
                    <input
                        placeholder="Password"
                        type="password"
                        required
                        minLength="6"
                        className="p-3 border rounded-lg focus:outline-none focus:border-indigo-500"
                        ref={password}
                    />
                    <button
                        className="p-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                        disabled={isFetching}
                    >
                        {isFetching ? "Loading..." : "Log In"}
                    </button>
                </form>
                <Link to="/register" className="text-center text-sm text-indigo-500 hover:underline">
                    Create a New Account
                </Link>
            </div>
        </div>
    );
};

export default Login;
