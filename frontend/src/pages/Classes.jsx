import React, { useState, useEffect } from 'react';
import { getClasses, createClass, updateClass, deleteClass } from '../services/classApi';
import { getTeachers } from '../services/teacherApi';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [formData, setFormData] = useState({ grade: '', section: '', teacherId: '', period: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'ADMIN') {
        const [classRes, teacherRes] = await Promise.all([getClasses(), getTeachers()]);
        setClasses(classRes.data.classes);
        setTeachers(teacherRes.data.teachers);
      } else {
        const classRes = await getClasses();
        setClasses(classRes.data.classes);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setCurrentClass(null);
    setFormData({ grade: '', section: '', teacherId: '', period: '' });
    setShowModal(true);
  };

  const handleEdit = (cls) => {
    setCurrentClass(cls);
    setFormData({
      grade: cls.grade,
      section: cls.section,
      period: cls.period || '',
      teacherId: cls.teacher ? cls.teacher._id : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await deleteClass(id);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete class');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentClass) {
        await updateClass(currentClass._id, formData);
      } else {
        await createClass(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save class');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
        {user?.role === 'ADMIN' && (
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700"
          >
            <Plus size={18} className="mr-2" /> Add Class
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule / Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Teacher</th>
                {user?.role === 'ADMIN' && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : classes.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No classes found.</td></tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.section}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.period || <span className="text-gray-400 italic">Not set</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cls.teacher ? cls.teacher.user?.name || <span className="text-gray-400 italic">User Deleted</span> : <span className="text-gray-400 italic">Unassigned</span>}
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(cls)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(cls._id)} className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">{currentClass ? 'Edit Class' : 'Add New Class'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Grade</label>
                <input required type="text" name="grade" value={formData.grade} onChange={handleInputChange} placeholder="e.g. 6" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <input required type="text" name="section" value={formData.section} onChange={handleInputChange} placeholder="e.g. A" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Schedule / Period (Optional)</label>
                <input type="text" name="period" value={formData.period || ''} onChange={handleInputChange} placeholder="e.g. Period 1 (09:00 AM)" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign Teacher (Optional)</label>
                <select name="teacherId" value={formData.teacherId} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border">
                  <option value="">Select a Teacher</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.user.name} ({t.subject})</option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700">
                  {currentClass ? 'Save Changes' : 'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
