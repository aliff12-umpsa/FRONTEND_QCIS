import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserPage from "./pages/UserPage";
import ProductPage from "./pages/ProductPage";
import InspectionPage from "./pages/InspectionPage";
import DefectPage from "./pages/DefectPage";
import QualityReport from "./pages/QualityReport";

// Layout
import Layout from "./components/Layout";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("userRole");
    
    if (user && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // Protected Route wrapper
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (loading) {
      return <div className="loading-screen">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // If allowedRoles is empty, allow all authenticated users
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return (
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
        </div>
      );
    }
    
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Login />
          } 
        />

        {/* Protected Routes with Layout */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          {/* Dashboard - All authenticated users */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Users - Admin only */}
          <Route 
            path="users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserPage />
              </ProtectedRoute>
            } 
          />

          {/* Products - Admin only */}
          <Route 
            path="products" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductPage />
              </ProtectedRoute>
            } 
          />

          {/* Inspections - Admin and Inspector */}
          <Route
            path="inspections"
            element={<InspectionPage userRole={userRole} />}
          />

          {/* Defects - Admin and Inspector */}
          <Route
            path="defects"
            element={<DefectPage userRole={userRole} />}
          />

          {/* Quality Reports - Admin and Inspector */}
          <Route
            path="quality-reports"
            element={<QualityReport userRole={userRole} />}
          />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;