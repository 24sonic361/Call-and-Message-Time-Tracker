import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import SpNavBar from './components/SpNavBar';

import { AuthProvider, useAuth } from './AuthProvider';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <SpNavBar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={ 
              <PrivateRoute>
                <HomePage />
              </PrivateRoute> 
            } 
          />
          <Route 
            path="/admin" 
            element={ 
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute> 
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
