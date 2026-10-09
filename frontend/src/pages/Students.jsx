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
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    classId: '',
    guardianContact: ''
  });

  const [filterClassId, setFilterClassId] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterClassId, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, classRes] = await Promise.all([
        getStudents(filterClassId, page, limit),
        getClasses()
      ]);
      setStudents(studentRes.data.students);
      if (studentRes.data.pagination) {
        setTotalPages(studentRes.data.pagination.totalPages);
      }
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
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-card p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden mb-8 border border-white/60"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center tracking-tight">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Users size={28} />
            </span>
            Student Directory
          </h1>
          <p className="text-gray-500 text-base mt-2 font-medium ml-[4.5rem]">Manage student records and class enrollments.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl glass-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            value={filterClassId} 
            onChange={(e) => {
              setFilterClassId(e.target.value);
              setPage(1);
            }}
            className="block py-2.5 px-4 border border-gray-200 rounded-xl glass-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-sm"
          >
            <option value="">All Classes</option>
            {Array.from(new Map(classes.map(c => [c.grade + '-' + c.section, c])).values()).map(c => (
              <option key={c._id} value={c._id}>Grade {c.grade}-{c.section}</option>
            ))}
          </select>

          {user?.role === 'ADMIN' && (
            <button
              onClick={openAddModal}
              className="flex items-center px-6 py-3 gradient-bg text-white rounded-2xl shadow-lg shadow-indigo-500/30 hover-lift whitespace-nowrap text-sm font-bold tracking-wide transition-all"
            >
              <Plus size={18} className="mr-2" /> Add Student
            </button>
          )}
        </div>
      </motion.div>

      <div className="glass-card rounded-2xl overflow-hidden  border border-white/50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white/40 backdrop-blur-md border-b border-white/50">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Profile</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll Number</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guardian Contact</th>
                {user?.role === 'ADMIN' && (
                  <th className="px-6 py-5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
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
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 font-medium bg-white/30/30">No students found matching your criteria.</td></tr>
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
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/50 flex items-center justify-between bg-white/30/50">
            <div className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 glass-card hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 glass-card hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
              className="glass-card rounded-2xl max-w-md w-full shadow-2xl relative z-10 overflow-hidden border border-white/50"
            >
              <div className="px-6 py-4 border-b border-white/50 flex justify-between items-center bg-white/30/50">
                <h2 className="text-lg font-bold text-gray-900">{currentStudent ? 'Edit Student Profile' : 'Enroll New Student'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} autoComplete="off" className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-white/30 focus:glass-card focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all" />
                </div>
                {!currentStudent && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Student Email (Optional)</label>
                      <input type="email" name="email" autoComplete="off" value={formData.email || ''} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-white/30 focus:glass-card focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all" placeholder="For student login" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Password (Optional)</label>
                      <input type="password" name="password" autoComplete="new-password" value={formData.password || ''} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-white/30 focus:glass-card focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all" placeholder="Required if email provided" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Roll Number</label>
                  <input required disabled={!!currentStudent} type="text" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-white/30 focus:glass-card focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Assign Class</label>
                  <select required name="classId" value={formData.classId} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-white/30 focus:glass-card focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all">
                    <option value="">-- Select a Class --</option>
                    {Array.from(new Map(classes.map(c => [c.grade + '-' + c.section, c])).values()).map(c => (
                      <option key={c._id} value={c._id}>Grade {c.grade}-{c.section}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Guardian Contact</label>
                  <input required type="text" name="guardianContact" value={formData.guardianContact} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-white/30 focus:glass-card focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm p-3 border transition-all" />
                </div>
                
                <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-white/50">
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
