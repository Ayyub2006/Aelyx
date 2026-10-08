import React, { useState, useEffect } from 'react';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../services/teacherApi';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    subject: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await getTeachers();
      setTeachers(res.data.teachers);
    } catch (error) {
      console.error("Failed to fetch teachers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentTeacher) {
        await updateTeacher(currentTeacher._id, {
          name: formData.name,
          phone: formData.phone,
          subject: formData.subject,
        });
      } else {
        await createTeacher(formData);
      }
      setShowModal(false);
      fetchTeachers();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (teacher) => {
    setCurrentTeacher(teacher);
    setFormData({
      name: teacher.user.name,
      email: teacher.user.email,
      password: '', // Should not be editable here easily or at all
      phone: teacher.phone,
      subject: teacher.subject,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await deleteTeacher(id);
        fetchTeachers();
      } catch (error) {
        alert(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const openAddModal = () => {
    setCurrentTeacher(null);
    setFormData({ name: '', email: '', password: '', phone: '', subject: '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700"
        >
          <Plus size={18} className="mr-2" /> Add Teacher
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No teachers found.</td></tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{teacher.user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{teacher.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{teacher.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{teacher.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(teacher)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(teacher._id)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">{currentTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input required disabled={!!currentTeacher} type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border disabled:bg-gray-100" />
              </div>
              {!currentTeacher && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700">
                  {currentTeacher ? 'Save Changes' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
