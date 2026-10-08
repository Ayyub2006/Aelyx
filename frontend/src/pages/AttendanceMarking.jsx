import React, { useState, useEffect } from 'react';
import { getClasses } from '../services/classApi';
import { getStudents } from '../services/studentApi';
import { markAttendance } from '../services/attendanceApi';
import { useAuth } from '../context/AuthContext';
import { Check, X, Save } from 'lucide-react';
import clsx from 'clsx';

const AttendanceMarking = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      // If TEACHER, filter classes they are assigned to
      if (user.role === 'TEACHER') {
        const assigned = res.data.classes.filter(c => c.teacher && c.teacher.user._id === user.id);
        setClasses(assigned);
      } else {
        setClasses(res.data.classes);
      }
    } catch (error) {
      console.error("Failed to fetch classes");
    }
  };

  const fetchStudents = async (classId) => {
    setLoading(true);
    try {
      const res = await getStudents(classId);
      setStudents(res.data.students);
      // Initialize all as PRESENT by default
      const initialAttendance = {};
      res.data.students.forEach(s => {
        initialAttendance[s._id] = 'PRESENT';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s._id] = status;
    });
    setAttendance(updated);
  };

  const toggleStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || !date) return alert('Please select a class and date');
    
    const records = Object.keys(attendance).map(studentId => ({
      studentId,
      status: attendance[studentId]
    }));

    try {
      await markAttendance({ classId: selectedClass, date, records });
      alert('Attendance saved successfully');
      // Reset or redirect
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save attendance');
    }
  };

  const presentCount = Object.values(attendance).filter(v => v === 'PRESENT').length;
  const absentCount = Object.values(attendance).filter(v => v === 'ABSENT').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>

      {/* Top Controls */}
      <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
          >
            <option value="">-- Choose Class --</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>Grade {c.grade} - Section {c.section}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input 
            type="date" 
            value={date}
            max={new Date().toISOString().split('T')[0]} // Max today
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" 
          />
        </div>
      </div>

      {selectedClass && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex space-x-6 text-sm">
              <span className="font-semibold text-gray-700">Total: {students.length}</span>
              <span className="font-semibold text-green-600">Present: {presentCount}</span>
              <span className="font-semibold text-red-600">Absent: {absentCount}</span>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => markAll('PRESENT')} className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                Mark All Present
              </button>
              <button onClick={() => markAll('ABSENT')} className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                Mark All Absent
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-500">Loading students...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-500">No students found in this class.</td></tr>
                ) : (
                  students.map(student => (
                    <tr key={student._id} className={clsx("transition-colors", attendance[student._id] === 'ABSENT' ? 'bg-red-50' : 'hover:bg-gray-50')}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex rounded-md shadow-sm">
                          <button
                            type="button"
                            onClick={() => toggleStatus(student._id, 'PRESENT')}
                            className={clsx(
                              "relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium",
                              attendance[student._id] === 'PRESENT' 
                                ? "bg-green-500 text-white border-green-500 z-10" 
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            <Check size={16} className="mr-1" /> Present
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStatus(student._id, 'ABSENT')}
                            className={clsx(
                              "relative inline-flex items-center px-4 py-2 rounded-r-md border border-l-0 border-gray-300 text-sm font-medium",
                              attendance[student._id] === 'ABSENT' 
                                ? "bg-red-500 text-white border-red-500 z-10" 
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            <X size={16} className="mr-1" /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={students.length === 0}
              className="flex items-center px-6 py-2.5 bg-primary text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Save size={18} className="mr-2" /> Save Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceMarking;
