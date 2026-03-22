import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { SocketProvider } from './context/SocketContext';

import { Navbar } from './components/Navbar';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <WalletProvider>
          <SocketProvider>
            <div className="app-container">
              <Navbar />
              <main className="container">
                <Routes>
                  <Route path="/" element={<Navigate to="/login" />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/student/*" element={<StudentDashboard />} />
                  <Route path="/staff/*" element={<StaffDashboard />} />
                  <Route path="/admin/*" element={<AdminDashboard />} />
                  <Route path="*" element={<div className="flex-center animate-fade-in"><h1 className="gradient-text">404 Not Found</h1></div>} />
                </Routes>
              </main>
            </div>
          </SocketProvider>
        </WalletProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
