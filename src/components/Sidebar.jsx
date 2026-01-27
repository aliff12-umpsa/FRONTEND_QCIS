import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ userRole = 'inspector', onLogout }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sidebar-user-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setShowUserMenu(false);
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");
      
      // Call onLogout if provided
      if (onLogout && typeof onLogout === 'function') {
        onLogout();
      }
      
      // Force full page reload to login
      window.location.href = "/login";
    }
  };

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Menu items based on role
  const menuItems = [
    {
      path: "/app/dashboard",
      icon: "fa-chart-line",
      label: "Dashboard",
      roles: ["admin", "inspector"]
    },
    {
      path: "/app/users",
      icon: "fa-users",
      label: "Users",
      roles: ["admin"]
    },
    {
      path: "/app/products",
      icon: "fa-box",
      label: "Products",
      roles: ["admin"]
    },
    {
      path: "/app/inspections",
      icon: "fa-clipboard-check",
      label: "Inspections",
      roles: ["admin", "inspector"]
    },
    {
      path: "/app/defects",
      icon: "fa-exclamation-triangle",
      label: "Defects",
      roles: ["admin", "inspector"]
    },
    {
      path: "/app/quality-reports",
      icon: "fa-file-alt",
      label: "Quality Reports",
      roles: ["admin", "inspector"]
    }
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        className={`hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <h2>QC System</h2>
          <p className="sidebar-subtitle">UMPSA</p>
        </div>

        {/* User Info - Clickable for Dropdown */}
        <div className="sidebar-user-container">
          <div 
            className="sidebar-user" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name || "User"}</p>
              <span className={`user-role role-${userRole}`}>
                {userRole === "admin" ? "Administrator" : "Inspector"}
              </span>
            </div>
            <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'} user-menu-icon`}></i>
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-item user-info-item">
                <i className="fas fa-envelope"></i>
                <span>{user?.email || "No email"}</span>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {visibleMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <i className={`fas ${item.icon}`}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Status */}
        <div className="sidebar-footer">
          <div className="footer-info">
            <i className="fas fa-shield-alt"></i>
            <span>Logged in as {userRole}</span>
          </div>
        </div>
      </div>
    </>
  );
}