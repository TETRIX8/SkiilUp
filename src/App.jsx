// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { DisciplinesPage } from './components/student/DisciplinesPage';
import { DisciplineDetail } from './components/student/DisciplineDetail';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CreateAssignmentPage } from './components/admin/CreateAssignmentPage';
import { EditAssignmentPage } from './components/admin/EditAssignmentPage';
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
import { RatingPage } from './components/student/RatingPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import WebGLIntro from './components/ui/WebGLIntro';
import { CommunityPage } from './components/student/CommunityPage';
import { SchedulePage } from './components/student/SchedulePage';

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

  // Public route to allow password reset without auth
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Routes>
          {/* Public route for email link */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* If not authenticated, show auth landing */}
          {!isAuthenticated && (
            <>
              <Route path="/" element={<AuthPage />} />
              <Route path="*" element={<AuthPage />} />
            </>
          )}

          {/* Admin routes */}
          {isAuthenticated && (user?.role === 'admin' || user?.role === 'teacher') && (
            <>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/assignments/create" element={<CreateAssignmentPage />} />
              <Route path="/admin/assignments/:id/edit" element={<EditAssignmentPage />} />
              <Route path="/admin/assignments" element={<AdminDashboard />} />
              <Route path="/admin/topics" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/submissions" element={<AdminDashboard />} />
              <Route path="*" element={<AdminDashboard />} />
            </>
          )}

          {/* Student routes */}
          {isAuthenticated && !(user?.role === 'admin' || user?.role === 'teacher') && (
            <>
              <Route path="/" element={<StudentDashboard />} />
              <Route path="/disciplines" element={<DisciplinesPage />} />
              <Route path="/discipline/:disciplineId" element={<DisciplineDetail />} />
              <Route path="/topics/:id" element={<TopicDetail />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/assignments/:id" element={<AssignmentDetail />} />
              <Route path="/rating" element={<RatingPage />} />
              <Route path="/grades" element={<GradesPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Profile />} />
              <Route path="*" element={<Error404 />} />
            </>
          )}
        </Routes>
      </div>
      <AKProjectBadge />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <WebGLIntro />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
