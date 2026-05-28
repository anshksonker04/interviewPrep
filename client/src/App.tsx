import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from './components/Toast';

// Route guards
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';

// Page components
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Quizzes } from './pages/Quizzes';
import { QuizRunner } from './pages/QuizRunner';
import { Bookmarks } from './pages/Bookmarks';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { SyllabusQuiz } from './pages/SyllabusQuiz';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/syllabus-quiz" element={<SyllabusQuiz />} />
            <Route path="/quiz/:id" element={<QuizRunner />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Wildcard Fallback redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      {/* Floating notification layer */}
      <ToastContainer />
    </ThemeProvider>
  );
};

export default App;
