import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, GraduationCap, LayoutDashboard, LogOut, ClipboardList, Menu, X, CheckSquare, BarChart3, School } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'TEACHER'] },
    { name: 'Teachers', path: '/teachers', icon: Users, roles: ['ADMIN'] },
    { name: 'Classes', path: '/classes', icon: GraduationCap, roles: ['ADMIN', 'TEACHER'] },
    { name: 'Students', path: '/students', icon: Users, roles: ['ADMIN', 'TEACHER'] },
    { name: 'Mark Attendance', path: '/attendance', icon: CheckSquare, roles: ['ADMIN', 'TEACHER'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'TEACHER'] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(user?.role));

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center px-8">
        <School className="w-8 h-8 text-primary mr-3" />
        <span className="text-2xl font-extrabold tracking-tight text-gray-900">Aelyx<span className="text-primary">ERP</span></span>
      </div>
      <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
        <nav className="px-4 space-y-2">
          {allowedNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive ? "text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 gradient-bg rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={clsx("mr-4 h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-primary font-bold shadow-inner">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full inline-block mt-0.5">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors group">
            <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#f4f7fe] overflow-hidden relative">
      {/* Background ambient light */}
      <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] hidden lg:flex flex-col z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-50 lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Mobile header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:hidden sticky top-0 z-30 shadow-sm">
          <div className="flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Aelyx<span className="text-primary">ERP</span></span>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
            <LogOut size={20} />
          </button>
        </header>
        
        {/* Page Content with Transitions */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
