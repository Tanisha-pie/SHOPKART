import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  // Controlled form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/customers/register", {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (response.data.success) {
        // Redirect to Login page with a success message state
        navigate("/login", {
          state: { successMessage: "Account created successfully! Please log in." },
        });
      }
    } catch (err) {
      if (err.response) {
        // Backend returned error (e.g., 400 or 409)
        setServerError(err.response.data.message || "Registration failed");
      } else {
        setServerError("Unable to connect to server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1>Create Account</h1>
        <p>Join ShopKart to start shopping today</p>
      </div>

      {serverError && (
        <div className="alert alert-danger" role="alert">
          <span>⚠️ {serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            className={`form-input ${errors.fullName ? "error" : ""}`}
            placeholder="e.g. John Doe"
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <div className="form-error">{errors.fullName}</div>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            className={`form-input ${errors.email ? "error" : ""}`}
            placeholder="e.g. john@gmail.com"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            className={`form-input ${errors.password ? "error" : ""}`}
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label" htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            className={`form-input ${errors.phone ? "error" : ""}`}
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" /> Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign In</Link>
      </div>
    </div>
  );
};

export default Register;
