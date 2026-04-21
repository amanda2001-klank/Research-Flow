import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StudentResearchForm from "./pages/StudentResearchForm";
import SupervisorAllocation from "./pages/SupervisorAllocation";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route
        path="/student-research"
        element={user ? <StudentResearchForm /> : <Navigate to="/login" />}
      />
      <Route
        path="/supervisor-allocation"
        element={user ? <SupervisorAllocation /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
