import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthProvider";
import AppLayout from "./layouts/AppLayout";
import SpNavBar from "./components/SpNavBar";
// Pages
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RequestAccountPage from "./pages/RequestAccountPage";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import BillPage from "./pages/BillPage";
import LandingPage from "./pages/LandingPage";

// Protect routes
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppLayout>
        <SpNavBar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/request" element={<RequestAccountPage />} />
          <Route path="/bill" element={<BillPage />} />
          <Route path="/landing" element={<LandingPage />} />


          {/* Private Routes */}
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
      </AppLayout>
    </Router>
  </AuthProvider>
);

export default App;
