import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserGraduate, FaTrash } from 'react-icons/fa';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchStudents() {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/students');
            setStudents(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching students:', err);
            setLoading(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStudents();
    }, []);

    const handleDeleteStudent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/admin/students/${id}`);
            fetchStudents();
        } catch (err) {
            console.error('Error deleting student:', err);
            alert('Failed to delete student');
        }
    };

    return (
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Hero Section */}
            <div className="p-8" style={{ backgroundColor: "#2c5f5d" }}>
                <div className="max-w-6xl mx-auto">
                    <div>
                        <div className="mb-2" style={{ color: "#E8A63A" }}>
                            <span className="text-sm font-semibold tracking-widest">● STUDENT MANAGEMENT</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Manage Students</h1>
                        <p className="text-gray-300">View and manage all student accounts in the system</p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Students List */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: "#2c5f5d" }}>
                            <h2 className="text-lg font-semibold text-white">Active Students</h2>
                        </div>
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#2c5f5d" }}>Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#2c5f5d" }}>Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#2c5f5d" }}>Username</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#2c5f5d" }}>Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: "#2c5f5d" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            Loading students...
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No students found
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-gray-800 font-medium">{student.fullName || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-600">{student.email}</td>
                                            <td className="px-6 py-4 text-gray-600">{student.username}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white`}
                                                    style={{ backgroundColor: student.isOnline ? "#27a745" : "#999" }}
                                                >
                                                    {student.isOnline ? '● Online' : '○ Offline'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDeleteStudent(student._id)}
                                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition-colors flex items-center gap-2 font-medium"
                                                >
                                                    <FaTrash size={14} />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageStudents;
