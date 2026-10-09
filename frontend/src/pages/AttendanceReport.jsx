import React, { useState, useEffect } from 'react';
import { getClasses } from '../services/classApi';
import { getStudents, getMyProfile } from '../services/studentApi';
import { getAttendanceReport } from '../services/attendanceApi';
import { Download, FileText, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AttendanceReport = () => {
  const { user } = useAuth();
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
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      fetchMyProfile();
    } else {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'STUDENT') {
      if (selectedClass) {
        fetchStudents(selectedClass);
      } else {
        setStudents([]);
        setSelectedStudent('');
      }
    }
  }, [selectedClass, user]);

  const fetchMyProfile = async () => {
    try {
      const res = await getMyProfile();
      const myStudent = res.data.student;
      setSelectedClass(myStudent.class._id);
      setSelectedStudent(myStudent._id);
      setClasses([{ _id: myStudent.class._id, grade: myStudent.class.grade, section: myStudent.class.section }]);
    } catch (error) {
      setErrorMsg("Failed to load student profile");
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data.classes);
    } catch (error) {
      setErrorMsg("Failed to fetch classes");
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const res = await getStudents(classId);
      setStudents(res.data.students);
    } catch (error) {
      setErrorMsg("Failed to fetch students");
    }
  };

  const handleGenerateReport = async () => {
    setErrorMsg('');
    if (!selectedClass || !startDate || !endDate) {
      setErrorMsg('Please fill Class, Start Date, and End Date');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('Start date must be before end date');
      return;
    }

    setLoading(true);
    try {
      const res = await getAttendanceReport(selectedClass, startDate, endDate, selectedStudent);
      setRecords(res.data.records);
      setSummary(res.data.summary);
      
      // Generate Chart Data
      const grouped = {};
      res.data.records.forEach(r => {
        const dateStr = new Date(r.attendanceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        if (!grouped[dateStr]) {
          grouped[dateStr] = { date: dateStr, present: 0, absent: 0, total: 0 };
        }
        grouped[dateStr].total += 1;
        if (r.status === 'PRESENT') grouped[dateStr].present += 1;
        else grouped[dateStr].absent += 1;
      });

      const processedChartData = Object.values(grouped).map(d => ({
        ...d,
        rate: Math.round((d.present / d.total) * 100)
      })).reverse(); // Reverse for chronological order (assuming API returns latest first)
      
      setChartData(processedChartData);
      
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to generate report');
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
      return `${dateStr},"${r.student?.name || 'Unknown Student'}",${classStr},${r.status}`;
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

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={user?.role === 'STUDENT'}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border disabled:bg-gray-100 disabled:opacity-75"
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
            disabled={user?.role === 'STUDENT' || !selectedClass || students.length === 0}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border disabled:bg-gray-100 disabled:opacity-75"
          >
            <option value="">-- All Students --</option>
            {user?.role === 'STUDENT' ? (
              <option value={selectedStudent}>My Report</option>
            ) : (
              students.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
              ))
            )}
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

      {chartData.length > 1 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BarChart2 size={20} className="mr-2 text-primary" /> 
            {selectedStudent ? 'Student Attendance Trend' : 'Class Attendance Trend'}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} domain={[0, 100]} dx={-10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Attendance Rate']}
                />
                <Area type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified By</th>
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
                      {record.student?.name || <span className="text-gray-400 italic">Deleted Student</span>}
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
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {record.auditTrail && record.auditTrail.length > 0 ? (
                        <div className="flex flex-col">
                          <span>{record.auditTrail[record.auditTrail.length - 1].modifiedBy?.name || 'Unknown'}</span>
                          <span className="text-gray-400 text-[10px]">
                            {new Date(record.auditTrail[record.auditTrail.length - 1].timestamp).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        'N/A'
                      )}
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
