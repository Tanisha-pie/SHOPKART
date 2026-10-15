import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Home = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(user || null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        // GET /customers/me sends the HttpOnly cookie automatically
        const response = await API.get("/customers/me");
        if (isMounted) {
          setCustomer(response.data);
          if (setUser) setUser(response.data);
        }
      } catch (err) {
        // If not logged in or invalid token (401), automatically redirect to /login
        console.warn("Unauthenticated access to /home. Redirecting to /login.");
        if (isMounted) {
          if (setUser) setUser(null);
          navigate("/login", { replace: true });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <div className="spinner spinner-dark" style={{ margin: "0 auto 1rem" }} />
        <p style={{ color: "var(--text-muted)", fontWeight: 500 }}>
          Loading your customer dashboard...
        </p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome, {customer.fullName}! 👋</h1>
          <p>We're glad to see you back on ShopKart.</p>
        </div>
        <div>
          <span className="status-chip">
            <span className="status-dot" /> Authenticated Customer
          </span>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="profile-card">
        <div className="section-header">
          <h2>Customer Profile Information</h2>
        </div>

        <div className="profile-grid">
          <div className="profile-item">
            <span className="label">Customer ID</span>
            <span className="value" style={{ fontSize: "0.92rem", fontFamily: "monospace" }}>
              {customer._id}
            </span>
          </div>

          <div className="profile-item">
            <span className="label">Full Name</span>
            <span className="value">{customer.fullName}</span>
          </div>

          <div className="profile-item">
            <span className="label">Email Address</span>
            <span className="value">{customer.email}</span>
          </div>

          <div className="profile-item">
            <span className="label">Phone Number</span>
            <span className="value">{customer.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
