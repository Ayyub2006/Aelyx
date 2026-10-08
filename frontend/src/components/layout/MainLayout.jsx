import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, GraduationCap, LayoutDashboard, LogOut, ClipboardList } from 'lucide-react';
import clsx from 'clsx';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'TEACHER'] },
    { name: 'Teachers', path: '/teachers', icon: Users, roles: ['ADMIN'] },
    { name: 'Classes', path: '/classes', icon: GraduationCap, roles: ['ADMIN'] },
    { name: 'Students', path: '/students', icon: Users, roles: ['ADMIN'] },
    { name: 'Attendance', path: '/attendance', icon: ClipboardList, roles: ['ADMIN', 'TEACHER'] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-xl font-bold text-primary">Mini ERP</span>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-4 space-y-1">
            {allowedNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={clsx(
                    "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={clsx("mr-3 h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-gray-500 text-xs">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header placeholder */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:hidden">
          <span className="text-xl font-bold text-primary">Mini ERP</span>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500">
            <LogOut size={20} />
          </button>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
