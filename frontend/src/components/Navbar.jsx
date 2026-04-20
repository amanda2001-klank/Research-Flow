import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
    const { user, dispatch } = useContext(AuthContext);

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("user");
        window.location.reload();
    };

    return (
        <div className="h-14 bg-white flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-indigo-600">CampusConnect</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <img
                        src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.username}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover bg-gray-200"
                    />
                    <span className="text-sm font-medium">{user?.username}</span>
                </div>
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
