import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
    const { user, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("user");
        window.location.reload();
    };

    const handleProfileClick = () => {
        navigate("/profile");
    };

    return (
        <div className="h-14 bg-white flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-indigo-600">CampusConnect</span>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition cursor-pointer"
                >
                    <img
                        src={user?.avatar ? `http://localhost:5000${user.avatar}` : "https://ui-avatars.com/api/?name=" + user?.username}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover bg-gray-200"
                        onError={(e) => {
                            e.target.src = "https://ui-avatars.com/api/?name=" + user?.username;
                        }}
                    />
                    <span className="text-sm font-medium">{user?.username}</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;
