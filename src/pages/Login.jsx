import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// Use environment variable for API URL
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Attempting login to:", BASE_URL);
      const res = await axios.get(`${BASE_URL}/users`);
      const users = res.data;

      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        // Store user data
        const userData = JSON.stringify(user);
        const userRole = user.role || "inspector";
        const token = "token-" + Date.now();
        
        localStorage.setItem("user", userData);
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("token", token);
        
        console.log("✅ Login successful");
        
        // Notify App component
        if (onLogin) {
          onLogin(user, userRole);
        }
        
        // Small delay to ensure state updates
        setTimeout(() => {
          navigate("/app/dashboard", { replace: true });
        }, 100);
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      if (err.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please check if backend is running.");
      } else {
        setError("Login failed! Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      console.log("📝 Attempting signup to:", BASE_URL);
      
      // Check if email already exists
      const checkRes = await axios.get(`${BASE_URL}/users`);
      const users = checkRes.data;
      
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        setError("Email already registered! Please login.");
        setLoading(false);
        return;
      }

      // Create new user
      const newUserData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        role: "inspector"
      };

      console.log("Creating user with data:", { ...newUserData, password: "***" });

      const createRes = await axios.post(`${BASE_URL}/users`, newUserData);
      
      console.log("✅ User created successfully:", createRes.data);

      // Wait a moment for database to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch updated user list
      const updatedRes = await axios.get(`${BASE_URL}/users`);
      const updatedUsers = updatedRes.data;
      const newUser = updatedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (newUser) {
        const userData = JSON.stringify(newUser);
        const userRole = newUser.role || "inspector";
        const token = "token-" + Date.now();
        
        localStorage.setItem("user", userData);
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("token", token);
        
        console.log("✅ Signup successful");
        
        // Notify App component
        if (onLogin) {
          onLogin(newUser, userRole);
        }
        
        // Small delay to ensure state updates
        setTimeout(() => {
          navigate("/app/dashboard", { replace: true });
        }, 100);
      } else {
        setError("Account created but login failed. Please try logging in.");
        setIsLogin(true);
      }

    } catch (err) {
      console.error("❌ Signup error details:", err.response || err);
      
      // More specific error messages
      if (err.response) {
        if (err.response.status === 409) {
          setError("Email already exists!");
        } else if (err.response.status === 400) {
          setError(err.response.data.message || "Invalid input. Please check your details.");
        } else {
          setError(`Signup failed: ${err.response.data.message || "Server error"}`);
        }
      } else if (err.request) {
        setError("Cannot connect to server. Please check if the backend is running.");
      } else {
        setError("Signup failed! Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <h1>Quality Control System</h1>
          <p>UMPSA Industrial Inspection Platform</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button 
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            type="button"
          >
            <i className="fas fa-sign-in-alt"></i>
            Login
          </button>
          <button 
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            type="button"
          >
            <i className="fas fa-user-plus"></i>
            Create Account
          </button>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </button>

            <div className="form-footer">
              <p>
                Don't have an account?{" "}
                <button 
                  type="button" 
                  className="link-btn"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                >
                  Create one here
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignup} className="login-form">
            <div className="signup-info">
              <i className="fas fa-info-circle"></i>
              <span>New accounts are created as <strong>Inspector</strong> role.</span>
            </div>

            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-user"></i>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">
                <i className="fas fa-lock"></i>
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Create Account
                </>
              )}
            </button>

            <div className="form-footer">
              <p>
                Already have an account?{" "}
                <button 
                  type="button" 
                  className="link-btn"
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        )}

        <div className="login-footer">
          <p>© 2026 UMPSA Quality Control System</p>
        </div>
      </div>
    </div>
  );
};

export default Login;