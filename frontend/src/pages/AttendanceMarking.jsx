import React, { useState, useEffect } from 'react';
import { getClasses } from '../services/classApi';
import { getStudents } from '../services/studentApi';
import { markAttendance, getClassAttendanceByDate, updateClassAttendance } from '../services/attendanceApi';
import { useAuth } from '../context/AuthContext';
import { Check, X, Save, Edit3 } from 'lucide-react';
import clsx from 'clsx';

const AttendanceMarking = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' }
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    if (selectedClass && date) {
      loadData(selectedClass, date);
    } else {
      setStudents([]);
      setAttendance({});
      setIsEditMode(false);
    }
  }, [selectedClass, date]);

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      if (user.role === 'TEACHER') {
        const assigned = res.data.classes.filter(c => c.teacher && c.teacher.user._id === user.id);
        setClasses(assigned);
      } else {
        setClasses(res.data.classes);
      }
    } catch (error) {
      setErrorMsg("Failed to fetch classes");
    }
  };

  const loadData = async (classId, selectedDate) => {
    setLoading(true);
    try {
      // 1. Fetch all students for the class
      const studentRes = await getStudents(classId);
      const classStudents = studentRes.data.students;
      setStudents(classStudents);

      // 2. Check if attendance already exists for this date
      const attendanceRes = await getClassAttendanceByDate(classId, selectedDate);
      const existingRecords = attendanceRes.data.attendance;

      if (existingRecords.length > 0) {
        // Edit Mode
        setIsEditMode(true);
        const loadedAttendance = {};
        existingRecords.forEach(record => {
          loadedAttendance[record.student._id] = record.status;
        });
        
        // Handle students who were added to the class after attendance was marked
        classStudents.forEach(s => {
          if (!loadedAttendance[s._id]) {
             loadedAttendance[s._id] = 'PRESENT';
          }
        });

        setAttendance(loadedAttendance);
      } else {
        // Mark Mode
        setIsEditMode(false);
        const initialAttendance = {};
        classStudents.forEach(s => {
          initialAttendance[s._id] = 'PRESENT';
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      setErrorMsg("Failed to load attendance data");
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
    setErrorMsg('');
    setSuccessMsg('');
    if (!selectedClass || !date) {
      setErrorMsg('Please select a class and date');
      return;
    }
    
    const records = Object.keys(attendance).map(studentId => ({
      studentId,
      status: attendance[studentId]
    }));

    try {
      if (isEditMode) {
        await updateClassAttendance(selectedClass, { date, records });
        setSuccessMsg('Attendance updated successfully');
      } else {
        await markAttendance({ classId: selectedClass, date, records });
        setSuccessMsg('Attendance saved successfully');
        setIsEditMode(true); // Automatically switch to edit mode after saving
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to save attendance');
    }
  };

  const presentCount = Object.values(attendance).filter(v => v === 'PRESENT').length;
  const absentCount = Object.values(attendance).filter(v => v === 'ABSENT').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h1>
        {isEditMode && (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium flex items-center">
            <Edit3 size={16} className="mr-1" /> Edit Mode Active
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm">
          <p className="text-sm text-green-700">{successMsg}</p>
        </div>
      )}

      <div className="glass-card p-6 rounded-lg shadow flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
          >
            <option value="">-- Choose Class --</option>
            {Array.from(new Map(classes.map(c => [c.grade + '-' + c.section, c])).values()).map(c => (
              <option key={c._id} value={c._id}>Grade {c.grade} - Section {c.section}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input 
            type="date" 
            value={date}
            max={new Date().toISOString().split('T')[0]} 
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" 
          />
        </div>
      </div>

      {selectedClass && (
        <div className="glass-card rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-white/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex space-x-6 text-sm">
              <span className="font-semibold text-gray-700">Total: {students.length}</span>
              <span className="font-semibold text-green-600">Present: {presentCount}</span>
              <span className="font-semibold text-red-600">Absent: {absentCount}</span>
            </div>
            {user?.role !== 'ADMIN' && (
              <div className="flex space-x-3">
                <button onClick={() => markAll('PRESENT')} className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                  Mark All Present
                </button>
                <button onClick={() => markAll('ABSENT')} className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                  Mark All Absent
                </button>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="glass-card">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="glass-card divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-500">Loading records...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-500">No students found in this class.</td></tr>
                ) : (
                  students.map(student => (
                    <tr key={student._id} className={clsx("transition-colors", attendance[student._id] === 'ABSENT' ? 'bg-red-50' : 'hover:bg-white/30')}>
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
                            disabled={user?.role === 'ADMIN'}
                            className={clsx(
                              "relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium",
                              attendance[student._id] === 'PRESENT' 
                                ? "bg-green-500 text-white border-green-500 z-10" 
                                : "glass-card text-gray-700",
                              user?.role !== 'ADMIN' && attendance[student._id] !== 'PRESENT' ? "hover:bg-white/30" : "",
                              user?.role === 'ADMIN' ? "cursor-not-allowed opacity-80" : ""
                            )}
                          >
                            <Check size={16} className="mr-1" /> Present
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStatus(student._id, 'ABSENT')}
                            disabled={user?.role === 'ADMIN'}
                            className={clsx(
                              "relative inline-flex items-center px-4 py-2 rounded-r-md border border-l-0 border-gray-300 text-sm font-medium",
                              attendance[student._id] === 'ABSENT' 
                                ? "bg-red-500 text-white border-red-500 z-10" 
                                : "glass-card text-gray-700",
                              user?.role !== 'ADMIN' && attendance[student._id] !== 'ABSENT' ? "hover:bg-white/30" : "",
                              user?.role === 'ADMIN' ? "cursor-not-allowed opacity-80" : ""
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

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col space-y-3 p-4 bg-white/30/50">
            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading records...</div>
            ) : students.length === 0 ? (
              <div className="py-10 text-center text-gray-500">No students found in this class.</div>
            ) : (
              students.map(student => (
                <div 
                  key={student._id} 
                  className={clsx(
                    "p-4 rounded-xl shadow-sm border transition-colors flex flex-col gap-3",
                    attendance[student._id] === 'ABSENT' ? 'bg-red-50 border-red-100' : 'glass-card border-gray-200'
                  )}
                >
                  <div className="flex justify-between items-center border-b border-white/50 pb-2">
                    <span className="font-bold text-gray-900 text-lg">{student.name}</span>
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-mono font-bold">Roll: {student.rollNumber}</span>
                  </div>
                  
                  <div className="flex w-full mt-1">
                    <button
                      type="button"
                      onClick={() => toggleStatus(student._id, 'PRESENT')}
                      disabled={user?.role === 'ADMIN'}
                      className={clsx(
                        "flex-1 flex justify-center items-center py-2.5 rounded-l-lg border text-sm font-bold transition-colors",
                        attendance[student._id] === 'PRESENT' 
                          ? "bg-green-500 text-white border-green-500 z-10" 
                          : "glass-card text-gray-700 border-gray-300",
                        user?.role === 'ADMIN' ? "cursor-not-allowed opacity-80" : ""
                      )}
                    >
                      <Check size={18} className="mr-1.5" /> Present
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(student._id, 'ABSENT')}
                      disabled={user?.role === 'ADMIN'}
                      className={clsx(
                        "flex-1 flex justify-center items-center py-2.5 rounded-r-lg border border-l-0 text-sm font-bold transition-colors",
                        attendance[student._id] === 'ABSENT' 
                          ? "bg-red-500 text-white border-red-500 z-10" 
                          : "glass-card text-gray-700 border-gray-300",
                        user?.role === 'ADMIN' ? "cursor-not-allowed opacity-80" : ""
                      )}
                    >
                      <X size={18} className="mr-1.5" /> Absent
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {user?.role !== 'ADMIN' && (
            <div className="p-4 border-t bg-white/30 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={students.length === 0 || loading}
                className={clsx(
                  "flex items-center px-6 py-2.5 text-white rounded-md transition-colors shadow-sm disabled:opacity-50",
                  isEditMode ? "bg-amber-600 hover:bg-amber-700" : "bg-primary hover:bg-indigo-700"
                )}
              >
                <Save size={18} className="mr-2" /> 
                {isEditMode ? 'Update Attendance' : 'Save Attendance'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceMarking;
