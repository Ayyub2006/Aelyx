import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Students from './pages/Students';
import AttendanceMarking from './pages/AttendanceMarking';
import AttendanceReport from './pages/AttendanceReport';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              
              <Route element={<RoleRoute roles={['ADMIN']} />}>
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/students" element={<Students />} />
              </Route>
              
              <Route element={<RoleRoute roles={['ADMIN', 'TEACHER']} />}>
                <Route path="/attendance" element={<AttendanceMarking />} />
                <Route path="/reports" element={<AttendanceReport />} />
              </Route>
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
