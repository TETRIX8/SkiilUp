// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { DisciplinesPage } from './components/student/DisciplinesPage';
import { DisciplineDetail } from './components/student/DisciplineDetail';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TopicDetail } from './components/student/TopicDetail';
import { AssignmentDetail } from './components/student/AssignmentDetail';
import { StudentDashboard } from './components/student/StudentDashboard';
import { AchievementsPage } from './components/student/AchievementsPage';
import { ProgressPage } from './components/student/ProgressPage';
import { CalendarPage } from './components/student/CalendarPage';
import { GradesPage } from './components/student/GradesPage';
import { Profile } from './pages/Profile';
import Error404 from './pages/Error404';
import { AKProjectBadge } from './components/ui/AKProjectBadge';
import './App.css';
import { AssignmentsPage } from './components/student/AssignmentsPage';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        <AKProjectBadge />
      </>
    );
  }

  // Show admin dashboard for admins and teachers
  if (user?.role === 'admin' || user?.role === 'teacher') {
    return (
      <>
        <AdminDashboard />
        <AKProjectBadge />
      </>
    );
  }

  // Show student routes with new dashboard
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Routes>
          <Route path="/" element={<StudentDashboard />} />
          <Route path="/disciplines" element={<DisciplinesPage />} />
          <Route path="/discipline/:disciplineId" element={<DisciplineDetail />} />
          <Route path="/topics/:id" element={<TopicDetail />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/assignments/:id" element={<AssignmentDetail />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/community" element={<DisciplinesPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Profile />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </div>
      <AKProjectBadge />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
