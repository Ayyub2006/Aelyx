import React, { useState, useEffect } from 'react';
import { getClasses, createClass, updateClass, deleteClass } from '../services/classApi';
import { getTeachers } from '../services/teacherApi';
import { Plus, Edit2, Trash2, X, Search, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [formData, setFormData] = useState({ grade: '', section: '', teacherId: '', period: '' });
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredClasses = classes.filter(cls => 
    cls.grade.toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
    cls.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.teacher?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
              <GraduationCap size={20} />
            </span>
            Class Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">View and manage school classes and schedules.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search classes..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {user?.role === 'ADMIN' && (
            <button
              onClick={openAddModal}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm hover-lift whitespace-nowrap text-sm font-medium"
            >
              <Plus size={18} className="mr-2" /> Add Class
            </button>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden bg-white/80 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade - Section</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule / Period</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Teacher</th>
                {user?.role === 'ADMIN' && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                  </td></tr>
                ) : filteredClasses.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500 font-medium bg-gray-50/30">No classes found matching your criteria.</td></tr>
                ) : (
                  filteredClasses.map((cls, index) => (
                    <motion.tr 
                      key={cls._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold mr-3 shadow-inner">
                            {cls.grade}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">Grade {cls.grade}</div>
                            <div className="text-xs text-gray-500">Section {cls.section}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {cls.period || 'Not set'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {cls.teacher ? (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mr-3">
                              {cls.teacher.user?.name?.charAt(0) || '?'}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{cls.teacher.user?.name || 'User Deleted'}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Unassigned
                          </span>
                        )}
                      </td>
                      {user?.role === 'ADMIN' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(cls)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mr-2">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(cls._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative z-10 overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">{currentClass ? 'Edit Class Details' : 'Create New Class'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} autoComplete="off" className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Grade</label>
                    <input required type="text" name="grade" value={formData.grade} onChange={handleInputChange} placeholder="e.g. 6" className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                    <input required type="text" name="section" value={formData.section} onChange={handleInputChange} placeholder="e.g. A" className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Schedule / Period</label>
                  <input type="text" name="period" value={formData.period || ''} onChange={handleInputChange} placeholder="e.g. Period 1 (09:00 AM)" className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Assign Teacher (Optional)</label>
                  <select name="teacherId" value={formData.teacherId} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all">
                    <option value="">-- Select a Teacher --</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.user.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>
                <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-medium text-white gradient-bg hover:shadow-lg hover:shadow-primary/30 transition-all hover-lift">
                    {currentClass ? 'Save Changes' : 'Create Class'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Classes;
