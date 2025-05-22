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
import UserPage from "./pages/Admin/UserPage";
import BillPage from "./pages/Admin/BillPage";
import LandingPage from "./pages/Admin/LandingPage";

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
            path="/user"
            element={
              <PrivateRoute>
                <UserPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/landing"
            element={
              <PrivateRoute>
                <LandingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/bill"
            element={
              <PrivateRoute>
                <BillPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </AppLayout>
    </Router>
  </AuthProvider>
);

export default App;
