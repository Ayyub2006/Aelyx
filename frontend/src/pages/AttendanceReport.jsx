import React, { useState, useEffect } from 'react';
import { getClasses } from '../services/classApi';
import { getStudents } from '../services/studentApi';
import { getAttendanceReport } from '../services/attendanceApi';
import { Download, FileText } from 'lucide-react';
import clsx from 'clsx';

const AttendanceReport = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    } else {
      setStudents([]);
      setSelectedStudent('');
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data.classes);
    } catch (error) {
      console.error("Failed to fetch classes");
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const res = await getStudents(classId);
      setStudents(res.data.students);
    } catch (error) {
      console.error("Failed to fetch students");
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedClass || !startDate || !endDate) return alert('Please fill Class, Start Date, and End Date');
    if (new Date(startDate) > new Date(endDate)) return alert('Start date must be before end date');

    setLoading(true);
    try {
      const res = await getAttendanceReport(selectedClass, startDate, endDate, selectedStudent);
      setRecords(res.data.records);
      setSummary(res.data.summary);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return;
    
    const headers = ['Date,Student,Class,Status'];
    const csvData = records.map(r => {
      const dateStr = new Date(r.attendanceDate).toLocaleDateString();
      const className = classes.find(c => c._id === selectedClass);
      const classStr = className ? `Grade ${className.grade}-${className.section}` : '';
      return `${dateStr},"${r.student.name}",${classStr},${r.status}`;
    });
    
    const csvContent = headers.concat(csvData).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">View Attendance Reports</h1>
        {records.length > 0 && (
          <button onClick={exportCSV} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm">
            <Download size={18} className="mr-2" /> Export CSV
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
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

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Student (Optional)</label>
          <select 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            disabled={!selectedClass || students.length === 0}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border disabled:bg-gray-100"
          >
            <option value="">-- All Students --</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" 
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" 
          />
        </div>

        <button 
          onClick={handleGenerateReport}
          disabled={loading || !selectedClass}
          className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 h-[42px] flex items-center"
        >
          <FileText size={18} className="mr-2" /> 
          {loading ? 'Loading...' : 'Generate'}
        </button>
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">{selectedStudent ? 'Total Attendance Days' : 'Total Students (Records)'}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{summary.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">{selectedStudent ? 'Days Present' : 'Present Students'}</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{summary.present}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">{selectedStudent ? 'Days Absent' : 'Absent Students'}</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{summary.absent}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">Attendance Percentage</p>
            <p className="text-3xl font-bold text-primary mt-1">{summary.percentage}%</p>
          </div>
        </div>
      )}

      {records.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map(record => {
                  const className = classes.find(c => c._id === selectedClass);
                  const classStr = className ? `Grade ${className.grade}-${className.section}` : '';
                  return (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.attendanceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {classStr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2.5 py-1 text-xs font-medium rounded-full border",
                        record.status === 'PRESENT' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                      )}>
                        {record.status === 'PRESENT' ? 'Present' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        selectedClass && !loading && (
          <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500">
            No attendance records found for the selected filters.
          </div>
        )
      )}
    </div>
  );
};

export default AttendanceReport;
