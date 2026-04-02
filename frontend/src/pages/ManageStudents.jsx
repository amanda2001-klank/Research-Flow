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
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FaUserGraduate className="text-[#FFD700]" />
                        Manage Students
                    </h1>
                    <p className="text-gray-600 mt-2">View and manage student accounts</p>
                </div>

                {/* Students List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Username</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
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
                                    <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-800">{student.fullName || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-600">{student.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{student.username}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs ${student.isOnline
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {student.isOnline ? 'Online' : 'Offline'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDeleteStudent(student._id)}
                                                className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-2"
                                            >
                                                <FaTrash />
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
    );
};

export default ManageStudents;
