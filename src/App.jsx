import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

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

  // Check authentication status on mount and when storage changes
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("userRole");
    
    console.log("🔍 Checking auth:", { hasToken: !!token, hasUser: !!user, role });
    
    if (token && user && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for storage changes (for logout in other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Logout handler
  const handleLogout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // Login handler (to be passed to Login component)
  const handleLogin = (user, role) => {
    console.log("✅ App: User logged in", { user: user.name, role });
    setIsAuthenticated(true);
    setUserRole(role);
  };

  // Protected Route wrapper
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (loading) {
      return (
        <div className="loading-screen" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div className="spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Loading...</p>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      console.log("❌ Not authenticated, redirecting to login");
      return <Navigate to="/login" replace />;
    }

    // If allowedRoles is empty, allow all authenticated users
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return (
        <div className="access-denied" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem'
        }}>
          <i className="fas fa-lock" style={{ fontSize: '3rem', color: '#e74c3c' }}></i>
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
          <button 
            onClick={() => window.location.hash = '#/app/dashboard'}
            style={{
              padding: '0.5rem 1rem',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      );
    }
    
    return children;
  };

  return (
    <HashRouter>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
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
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/app/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;