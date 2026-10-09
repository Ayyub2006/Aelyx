import React, { useState, useEffect } from 'react';
import { getClasses } from '../services/classApi';
import { getAttendanceReport } from '../services/attendanceApi';
import { useAuth } from '../context/AuthContext';
import { FileText, Download } from 'lucide-react';
import clsx from 'clsx';

const AttendanceReport = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });

  useEffect(() => {
    fetchClasses();
  }, []);

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
      console.error("Failed to fetch classes");
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedClass || !startDate || !endDate) return alert('Please fill all filters');
    if (new Date(startDate) > new Date(endDate)) return alert('Start date must be before end date');

    setLoading(true);
    try {
      const res = await getAttendanceReport(selectedClass, startDate, endDate);
      const fetchedRecords = res.data.records;
      setRecords(fetchedRecords);

      // Calculate Summary
      const total = fetchedRecords.length;
      const present = fetchedRecords.filter(r => r.status === 'PRESENT').length;
      const absent = total - present;
      const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

      setSummary({ total, present, absent, percentage });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return;
    
    const headers = ['Date,Roll No,Name,Status'];
    const csvData = records.map(r => {
      const dateStr = new Date(r.attendanceDate).toLocaleDateString();
      return `${dateStr},${r.student.rollNumber},"${r.student.name}",${r.status}`;
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

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
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
        
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border" 
          />
        </div>

        <div className="flex-1 w-full">
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
            <p className="text-sm text-gray-500 font-medium">Total Records</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{summary.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">Present</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{summary.present}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">Absent</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{summary.absent}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-medium">Attendance %</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map(record => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(record.attendanceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2.5 py-1 text-xs font-medium rounded-full",
                        record.status === 'PRESENT' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        selectedClass && !loading && (
          <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500">
            No attendance records found for the selected date range.
          </div>
        )
      )}
    </div>
  );
};

export default AttendanceReport;
