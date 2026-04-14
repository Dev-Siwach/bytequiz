import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResult from './pages/student/QuizResult';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateQuiz from './pages/teacher/CreateQuiz';
import EditQuiz from './pages/teacher/EditQuiz';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/quiz/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><TakeQuiz /></ProtectedRoute>} />
          <Route path="/student/result/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><QuizResult /></ProtectedRoute>} />
          
          <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/quiz/create" element={<ProtectedRoute allowedRoles={['TEACHER']}><CreateQuiz /></ProtectedRoute>} />
          <Route path="/teacher/quiz/:id/edit" element={<ProtectedRoute allowedRoles={['TEACHER']}><EditQuiz /></ProtectedRoute>} />
          
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageUsers /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
