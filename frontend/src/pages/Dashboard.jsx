import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../services/dashboardApi';
import { Users, GraduationCap, Users2, CheckCircle, XCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const attendanceTotal = (summary?.todayPresent || 0) + (summary?.todayAbsent || 0);
  const attendancePercentage = attendanceTotal > 0 
    ? Math.round((summary.todayPresent / attendanceTotal) * 100) 
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-8 max-w-7xl mx-auto pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end bg-white p-8 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, <span className="gradient-text">{user?.name}</span>! 👋</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Here is what's happening in your {user?.role === 'ADMIN' ? 'school' : user?.role === 'STUDENT' ? 'attendance record' : 'classes'} today.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {user?.role !== 'STUDENT' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Classes Stat */}
          <div className="glass-card hover-lift p-6 rounded-2xl flex items-center bg-white/80">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-xl shadow-inner">
              <GraduationCap size={28} />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.totalClasses || 0}</p>
            </div>
          </div>

          {/* Students Stat */}
          <div className="glass-card hover-lift p-6 rounded-2xl flex items-center bg-white/80">
            <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600 rounded-xl shadow-inner">
              <Users size={28} />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.totalStudents || 0}</p>
            </div>
          </div>

          {/* Teachers Stat (Admin Only) */}
          {user?.role === 'ADMIN' && (
            <div className="glass-card hover-lift p-6 rounded-2xl flex items-center bg-white/80">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-xl shadow-inner">
                <Users2 size={28} />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.totalTeachers || 0}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {user?.role === 'STUDENT' && summary?.studentDetails && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card hover-lift p-6 rounded-2xl flex items-center bg-white/80">
            <div className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600 rounded-xl shadow-inner">
              <Users size={28} />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Student Name</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{summary.studentDetails.name}</p>
            </div>
          </div>
          <div className="glass-card hover-lift p-6 rounded-2xl flex items-center bg-white/80">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-xl shadow-inner">
              <GraduationCap size={28} />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Class Enrolled</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{summary.studentDetails.className}</p>
            </div>
          </div>
          <div className="glass-card hover-lift p-6 rounded-2xl flex items-center bg-white/80">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-xl shadow-inner">
              <CheckCircle size={28} />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Roll Number</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{summary.studentDetails.rollNumber}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        
        {/* Graph Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="glass-card bg-white/80 p-8 rounded-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="w-2 h-8 bg-accent rounded-full mr-3 inline-block"></span>
                7-Day Attendance Trend
              </h2>
              <div className="flex items-center text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <TrendingUp size={16} className="mr-2 text-accent" /> Live Data
              </div>
            </div>
            
            <div className="flex-1 w-full h-[300px]">
              {summary?.trend && summary.trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="present" name="Present" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                    <Area type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAbsent)" activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Not enough data to display trend</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Attendance Overview */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <div className="glass-card p-8 rounded-2xl gradient-bg text-white shadow-lg flex flex-col justify-center items-center relative overflow-hidden h-full min-h-[220px]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10 text-center w-full">
              <p className="text-indigo-100 font-medium uppercase tracking-widest text-sm mb-2">
                {user?.role === 'STUDENT' ? "Overall Rate" : "Today's Rate"}
              </p>
              <div className="flex items-end justify-center mb-4">
                <span className="text-7xl font-black tracking-tighter">
                  {user?.role === 'STUDENT' ? summary?.attendancePercentage : attendancePercentage}
                </span>
                <span className="text-3xl font-bold text-indigo-200 mb-2 ml-1">%</span>
              </div>
              <div className="w-full bg-indigo-900/40 rounded-full h-3 mt-2 overflow-hidden shadow-inner p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${user?.role === 'STUDENT' ? summary?.attendancePercentage : attendancePercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className="bg-white h-2 rounded-full" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 glass-card p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between group">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {user?.role === 'STUDENT' ? 'Total Present' : 'Present'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === 'STUDENT' ? summary?.totalPresentDays : summary?.todayPresent}
                </p>
              </div>
              <div className="p-2.5 bg-green-50 text-green-500 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle size={24} />
              </div>
            </div>
            
            <div className="flex-1 glass-card p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between group">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {user?.role === 'STUDENT' ? 'Total Absent' : 'Absent'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.role === 'STUDENT' ? summary?.totalAbsentDays : summary?.todayAbsent}
                </p>
              </div>
              <div className="p-2.5 bg-red-50 text-red-500 rounded-xl group-hover:scale-110 transition-transform">
                <XCircle size={24} />
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Quick Links */}
      {user?.role !== 'STUDENT' && (
        <motion.div variants={itemVariants} className="mt-10 pt-6 border-t border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="w-2 h-8 bg-secondary rounded-full mr-3 inline-block"></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/attendance" className="group p-5 bg-white border border-indigo-100 rounded-xl text-indigo-700 font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm flex items-center justify-between">
              <span>Mark Attendance</span>
              <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link to="/reports" className="group p-5 bg-white border border-emerald-100 rounded-xl text-emerald-700 font-medium hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm flex items-center justify-between">
              <span>View Reports</span>
              <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
            {user?.role === 'ADMIN' && (
              <>
                <Link to="/students" className="group p-5 bg-white border border-amber-100 rounded-xl text-amber-700 font-medium hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm flex items-center justify-between">
                  <span>Manage Students</span>
                  <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/teachers" className="group p-5 bg-white border border-purple-100 rounded-xl text-purple-700 font-medium hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm flex items-center justify-between">
                  <span>Manage Teachers</span>
                  <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
