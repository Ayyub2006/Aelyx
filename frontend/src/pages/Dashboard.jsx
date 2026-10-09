import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../services/dashboardApi';
import { Users, GraduationCap, Users2, CheckCircle, XCircle, ArrowRight, TrendingUp, Sparkles, Calendar, Clock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

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
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin opacity-80"></div>
          <div className="absolute inset-2 rounded-full border-r-4 border-accent animate-spin-reverse opacity-60"></div>
          <div className="absolute inset-4 rounded-full border-b-4 border-secondary animate-spin opacity-40"></div>
        </div>
      </div>
    );
  }

  const attendanceTotal = (summary?.todayPresent || 0) + (summary?.todayAbsent || 0);
  const attendancePercentage = attendanceTotal > 0 
    ? Math.round((summary.todayPresent / attendanceTotal) * 100) 
    : 0;

  const studentPercentage = summary?.attendancePercentage || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } }
  };

  // Modern Date Formatting
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div 
      className="space-y-8 max-w-7xl mx-auto pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Super Premium Welcome Banner */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay z-0"></div>
        
        {/* Animated Glow Orbs */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-accent/30 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none group-hover:bg-accent/40 transition-colors duration-700 z-0 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-primary/40 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none group-hover:bg-primary/50 transition-colors duration-700 z-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <Sparkles size={16} className="text-yellow-300 mr-2" />
              <span className="text-sm font-semibold tracking-wide text-indigo-100 uppercase">{user?.role} PORTAL</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
              Welcome back, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 drop-shadow-sm">
                {user?.name}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-indigo-100/90 font-light leading-relaxed max-w-xl">
              {user?.role === 'ADMIN' ? 'Here is a complete overview of your entire school operations for today.' 
              : user?.role === 'STUDENT' ? 'Here is your personal attendance tracking and performance summary.' 
              : 'Here is the overview of your assigned classes and student attendance.'}
            </p>
          </div>
          
          <div className="hidden lg:flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <Calendar size={32} className="text-indigo-200 mb-3" />
            <div className="text-center">
              <p className="text-sm font-semibold text-indigo-200/80 uppercase tracking-widest mb-1">Today</p>
              <p className="text-xl font-bold text-white whitespace-nowrap">{currentDate}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column (Stats & Graph) */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Metrics Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {user?.role !== 'STUDENT' ? (
              <>
                <div className="glass-card p-6 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><GraduationCap size={100} /></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4">
                      <GraduationCap size={26} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Classes</p>
                      <p className="text-4xl font-black text-gray-900 mt-1">{summary?.totalClasses || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card p-6 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users size={100} /></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-4">
                      <Users size={26} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Students</p>
                      <p className="text-4xl font-black text-gray-900 mt-1">{summary?.totalStudents || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={100} /></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-4">
                      {user?.role === 'ADMIN' ? <Users2 size={26} /> : <CheckCircle size={26} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                        {user?.role === 'ADMIN' ? 'Teachers' : 'Avg Attendance'}
                      </p>
                      <p className="text-4xl font-black text-gray-900 mt-1">
                        {user?.role === 'ADMIN' ? (summary?.totalTeachers || 0) : `${attendancePercentage}%`}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="glass-card p-6 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users size={100} /></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-4">
                      <Users size={26} />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Student</p>
                    <p className="text-xl font-black text-gray-900 mt-1 truncate">{summary?.studentDetails?.name}</p>
                  </div>
                </div>
                
                <div className="glass-card p-6 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><GraduationCap size={100} /></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4">
                      <GraduationCap size={26} />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Enrolled In</p>
                    <p className="text-2xl font-black text-gray-900 mt-1 truncate">{summary?.studentDetails?.className}</p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CheckCircle size={100} /></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 mb-4">
                      <CheckCircle size={26} />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Roll Number</p>
                    <p className="text-4xl font-black text-gray-900 mt-1">{summary?.studentDetails?.rollNumber}</p>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Graph Section */}
          <motion.div variants={itemVariants}>
            <div className="glass-card p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 h-[450px] flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center tracking-tight">
                    <TrendingUp size={24} className="mr-3 text-primary" />
                    Attendance Timeline
                  </h2>
                  <p className="text-gray-500 mt-1 font-medium ml-9">Past 7 days performance</p>
                </div>
                <div className="hidden sm:flex items-center text-sm font-bold text-indigo-700 bg-indigo-50/80 px-4 py-2 rounded-xl border border-indigo-100 shadow-inner mt-4 sm:mt-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></div> Live Sync
                </div>
              </div>
              
              <div className="flex-1 w-full min-h-0">
                {summary?.trend && summary.trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary.trend} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', fontWeight: 'bold' }}
                        cursor={{ stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      />
                      <Area type="monotone" dataKey="present" name="Present" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorPresent)" activeDot={{ r: 8, strokeWidth: 0, fill: '#6366f1', className: 'drop-shadow-md' }} />
                      <Area type="monotone" dataKey="absent" name="Absent" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorAbsent)" activeDot={{ r: 8, strokeWidth: 0, fill: '#f43f5e', className: 'drop-shadow-md' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <TrendingUp size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-lg">Not enough data to display trend</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column (Overview & Actions) */}
        <div className="xl:col-span-4 space-y-8 flex flex-col">
          
          {/* Radial Overview Card */}
          <motion.div variants={itemVariants} className="flex-1 glass-card p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 relative overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center justify-between">
              <span>Overall Health</span>
              <Clock size={20} className="text-gray-400" />
            </h2>
            
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* Custom Radial Progress Visual */}
              <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke="url(#gradient-health)" 
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0, 300" }}
                    animate={{ strokeDasharray: `${(user?.role === 'STUDENT' ? studentPercentage : attendancePercentage) * 2.83}, 300` }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                  />
                  <defs>
                    <linearGradient id="gradient-health" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">
                    {user?.role === 'STUDENT' ? studentPercentage : attendancePercentage}<span className="text-2xl text-gray-400">%</span>
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Attendance</span>
                </div>
              </div>
              
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-green-50/50 backdrop-blur-sm border border-green-100 rounded-2xl p-4 text-center">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Present</p>
                  <p className="text-2xl font-black text-green-700">{user?.role === 'STUDENT' ? summary?.totalPresentDays : summary?.todayPresent}</p>
                </div>
                <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl p-4 text-center">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Absent</p>
                  <p className="text-2xl font-black text-red-700">{user?.role === 'STUDENT' ? summary?.totalAbsentDays : summary?.todayAbsent}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Card */}
          {user?.role !== 'STUDENT' && (
            <motion.div variants={itemVariants} className="glass-card p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/attendance" className="group flex items-center justify-between p-4 bg-white/40 hover:bg-white/80 border border-white/50 rounded-2xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4">
                      <CheckCircle size={20} />
                    </div>
                    <span className="font-bold text-gray-800">Mark Attendance</span>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link to="/reports" className="group flex items-center justify-between p-4 bg-white/40 hover:bg-white/80 border border-white/50 rounded-2xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mr-4">
                      <TrendingUp size={20} />
                    </div>
                    <span className="font-bold text-gray-800">View Reports</span>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/students" className="group flex items-center justify-between p-4 bg-white/40 hover:bg-white/80 border border-white/50 rounded-2xl transition-all duration-300">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mr-4">
                        <Users size={20} />
                      </div>
                      <span className="font-bold text-gray-800">Manage Users</span>
                    </div>
                    <ArrowRight size={18} className="text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
          
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
