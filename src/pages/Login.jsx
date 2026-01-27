import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// Set backend URL (make sure it matches your server)
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

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/users`);
      const users = res.data;

      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (user) {
        const userData = JSON.stringify(user);
        const userRole = user.role || "inspector";
        const token = "token-" + Date.now();

        localStorage.setItem("user", userData);
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("token", token);

        if (onLogin) onLogin(user, userRole);

        navigate("/app/dashboard", { replace: true });
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Check if backend is running.");
      } else {
        setError("Login failed! Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

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
      const checkRes = await axios.get(`${BASE_URL}/users`);
      const users = checkRes.data;

      const existingUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existingUser) {
        setError("Email already registered! Please login.");
        setLoading(false);
        return;
      }

      const newUserData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: "inspector",
      };

      await axios.post(`${BASE_URL}/users`, newUserData);

      // Small delay to let backend update
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Fetch updated user
      const updatedRes = await axios.get(`${BASE_URL}/users`);
      const updatedUsers = updatedRes.data;
      const newUser = updatedUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (newUser) {
        const userData = JSON.stringify(newUser);
        const userRole = newUser.role || "inspector";
        const token = "token-" + Date.now();

        localStorage.setItem("user", userData);
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("token", token);

        if (onLogin) onLogin(newUser, userRole);

        navigate("/app/dashboard", { replace: true });
      } else {
        setError("Account created but login failed. Please try logging in.");
        setIsLogin(true);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) setError("Email already exists!");
        else if (err.response.status === 400)
          setError(err.response.data.message || "Invalid input.");
        else
          setError(`Signup failed: ${err.response.data.message || "Server error"}`);
      } else if (err.request) {
        setError("Cannot connect to server. Check if backend is running.");
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

        <div className="auth-tabs">
          <button
            className={`tab-btn ${isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            type="button"
          >
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
          <button
            className={`tab-btn ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            type="button"
          >
            <i className="fas fa-user-plus"></i> Create Account
          </button>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i> Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="login-form">
            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-user"></i> Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">
                <i className="fas fa-lock"></i> Password
              </label>
              <input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">
                <i className="fas fa-lock"></i> Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
