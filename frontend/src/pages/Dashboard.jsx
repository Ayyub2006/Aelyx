import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../services/dashboardApi';
import { Users, GraduationCap, Users2, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getDashboardSummary();
        setSummary(res.data);
      } catch (error) {
        console.error("Failed to load dashboard summary");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const attendanceTotal = (summary?.todayPresent || 0) + (summary?.todayAbsent || 0);
  const attendancePercentage = attendanceTotal > 0 
    ? Math.round((summary.todayPresent / attendanceTotal) * 100) 
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Here is what's happening in your {user?.role === 'ADMIN' ? 'school' : 'classes'} today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Classes Stat */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <GraduationCap size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Classes</p>
            <p className="text-2xl font-bold text-gray-900">{summary?.totalClasses}</p>
          </div>
        </div>

        {/* Students Stat */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Users size={24} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{summary?.totalStudents}</p>
          </div>
        </div>

        {/* Teachers Stat (Admin Only) */}
        {user?.role === 'ADMIN' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Users2 size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalTeachers}</p>
            </div>
          </div>
        )}

      </div>

      {/* Today's Attendance Overview */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Attendance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Present Today</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{summary?.todayPresent}</p>
              </div>
              <div className="p-3 bg-green-50 text-green-500 rounded-full">
                <CheckCircle size={32} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Absent Today</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{summary?.todayAbsent}</p>
              </div>
              <div className="p-3 bg-red-50 text-red-500 rounded-full">
                <XCircle size={32} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
            <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
            <p className="text-4xl font-bold text-primary mt-2">{attendancePercentage}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${attendancePercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/attendance" className="p-4 bg-indigo-50 rounded-lg text-indigo-700 font-medium hover:bg-indigo-100 transition-colors text-center">
            Mark Attendance
          </Link>
          <Link to="/reports" className="p-4 bg-emerald-50 rounded-lg text-emerald-700 font-medium hover:bg-emerald-100 transition-colors text-center">
            View Reports
          </Link>
          {user?.role === 'ADMIN' && (
            <>
              <Link to="/students" className="p-4 bg-amber-50 rounded-lg text-amber-700 font-medium hover:bg-amber-100 transition-colors text-center">
                Add Student
              </Link>
              <Link to="/teachers" className="p-4 bg-purple-50 rounded-lg text-purple-700 font-medium hover:bg-purple-100 transition-colors text-center">
                Manage Teachers
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
