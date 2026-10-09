import React, { useState, useEffect } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../services/studentApi';
import { getClasses } from '../services/classApi';
import { Plus, Edit2, Trash2, X, Search, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    classId: '',
    guardianContact: ''
  });

  const [filterClassId, setFilterClassId] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterClassId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, classRes] = await Promise.all([
        getStudents(filterClassId),
        getClasses()
      ]);
      setStudents(studentRes.data.students);
      setClasses(classRes.data.classes);
    } catch (error) {
      console.error("Failed to fetch data", error);
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
      if (currentStudent) {
        await updateStudent(currentStudent._id, {
          name: formData.name,
          classId: formData.classId,
          guardianContact: formData.guardianContact,
        });
      } else {
        await createStudent(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      classId: student.class._id,
      guardianContact: student.guardianContact,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(id);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const openAddModal = () => {
    setCurrentStudent(null);
    setFormData({ name: '', rollNumber: '', classId: '', guardianContact: '' });
    setShowModal(true);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mr-3">
              <Users size={20} />
            </span>
            Student Directory
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage student records and class enrollments.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            value={filterClassId} 
            onChange={(e) => setFilterClassId(e.target.value)}
            className="block py-2.5 px-4 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-sm"
          >
            <option value="">All Classes</option>
            {Array.from(new Map(classes.map(c => [c.grade + '-' + c.section, c])).values()).map(c => (
              <option key={c._id} value={c._id}>Grade {c.grade}-{c.section}</option>
            ))}
          </select>

          {user?.role === 'ADMIN' && (
            <button
              onClick={openAddModal}
              className="flex items-center px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm hover-lift whitespace-nowrap text-sm font-medium"
            >
              <Plus size={18} className="mr-2" /> Add Student
            </button>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden bg-white/80 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Profile</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guardian Contact</th>
                {user?.role === 'ADMIN' && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                  </td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 font-medium bg-gray-50/30">No students found matching your criteria.</td></tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <motion.tr 
                      key={student._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-teal-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center text-teal-700 font-bold mr-3 shadow-inner">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-bold text-gray-900">{student.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded inline-block">{student.rollNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {student.class ? `Grade ${student.class.grade}-${student.class.section}` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.guardianContact}
                      </td>
                      {user?.role === 'ADMIN' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(student)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors mr-2">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(student._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                <h2 className="text-lg font-bold text-gray-900">{currentStudent ? 'Edit Student Profile' : 'Enroll New Student'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Roll Number</label>
                  <input required disabled={!!currentStudent} type="text" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Assign Class</label>
                  <select required name="classId" value={formData.classId} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all">
                    <option value="">-- Select a Class --</option>
                    {Array.from(new Map(classes.map(c => [c.grade + '-' + c.section, c])).values()).map(c => (
                      <option key={c._id} value={c._id}>Grade {c.grade}-{c.section}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Guardian Contact</label>
                  <input required type="text" name="guardianContact" value={formData.guardianContact} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all" />
                </div>
                
                <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-medium text-white gradient-bg hover:shadow-lg hover:shadow-primary/30 transition-all hover-lift">
                    {currentStudent ? 'Save Changes' : 'Enroll Student'}
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

export default Students;
