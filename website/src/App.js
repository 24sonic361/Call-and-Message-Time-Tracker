import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ItemListPage from './pages/Item/ItemListPage';
import ItemAddPage from './pages/Item/ItemAddPage';
import ItemDetailPage from './pages/Item/ItemDetailPage';

import SpNavBar from './components/SpNavBar';

import { AuthProvider, useAuth } from './AuthProvider';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <SpNavBar />
      <Router>
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
            path="/items"
            element={
              <PrivateRoute>
                <ItemListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/item/add"
            element={
              <PrivateRoute>
                <ItemAddPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/item/:id"
            element={
              <PrivateRoute>
                <ItemDetailPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
