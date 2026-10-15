import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCart } = useCart();

  const successMessage = location.state?.successMessage || "";

  // Controlled form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      // POST /customers/login - HttpOnly cookie is attached in Set-Cookie header by backend
      const response = await API.post("/customers/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.data.success) {
        // Fetch current user immediately or let Home fetch it
        try {
          const profileRes = await API.get("/customers/me");
          if (setUser) setUser(profileRes.data);
          if (refreshCart) refreshCart();
        } catch (e) {
          // Home will also verify
        }
        if (refreshCart) refreshCart();
        navigate("/home");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setErrorMessage("Invalid Credentials");
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Unable to connect to server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Log in to access your ShopKart account</p>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="alert">
          <span>✓ {successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            className="form-input"
            placeholder="e.g. john@gmail.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            className="form-input"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" /> Signing In...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account? <Link to="/register">Create one</Link>
      </div>
    </div>
  );
};

export default Login;
