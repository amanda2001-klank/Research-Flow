import axios from "axios";
import { useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
    const username = useRef();
    const email = useRef();
    const password = useRef();
    const passwordAgain = useRef();
    const navigate = useNavigate();

    const handleClick = async (e) => {
        e.preventDefault();
        if (passwordAgain.current.value !== password.current.value) {
            passwordAgain.current.setCustomValidity("Passwords don't match!");
        } else {
            const user = {
                username: username.current.value,
                email: email.current.value,
                password: password.current.value,
            };
            try {
                await axios.post("http://localhost:5000/api/auth/register", user);
                navigate("/login");
            } catch (err) {
                console.log(err);
            }
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
            <div className="w-96 p-8 bg-white rounded-xl shadow-lg flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-indigo-600 text-center">CampusConnect</h3>
                <span className="text-gray-500 text-sm text-center">Create a new account</span>
                <form onSubmit={handleClick} className="flex flex-col gap-4">
                    <input
                        placeholder="Username"
                        required
                        ref={username}
                        className="p-3 border rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        placeholder="Email"
                        required
                        ref={email}
                        type="email"
                        className="p-3 border rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        placeholder="Password"
                        required
                        ref={password}
                        type="password"
                        minLength="6"
                        className="p-3 border rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        placeholder="Password Again"
                        required
                        ref={passwordAgain}
                        type="password"
                        className="p-3 border rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <button className="p-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
                        Sign Up
                    </button>
                </form>
                <Link to="/login" className="text-center text-sm text-indigo-500 hover:underline">
                    Log into Account
                </Link>
            </div>
        </div>
    );
};

export default Register;
