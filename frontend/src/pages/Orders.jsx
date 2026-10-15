import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/orders");
      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Unable to load your orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  return (
    <div className="orders-page-container">
      <div className="orders-header">
        <h1 className="page-heading">My Orders</h1>
        {!loading && !error && orders.length > 0 && (
          <p className="page-subheading">
            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
          </p>
        )}
      </div>

      {loading ? (
        <div className="state-container loading-state">
          <div className="spinner spinner-dark" />
          <p>Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <h3>Unable to load your orders</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchOrders}>
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="state-container empty-orders-state">
          <div className="empty-orders-icon">📦</div>
          <h2>You have not placed any orders yet</h2>
          <p>Once you purchase products, your order history will appear here.</p>
          <Link to="/products" className="btn-browse-products">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-history-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id-label">Order #{order._id}</span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="order-badges-group">
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                  <span className={`status-badge ${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items in this order */}
              <div className="order-items-preview">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-snippet">
                    <span className="item-snippet-name">{item.name}</span>
                    <span className="item-snippet-qty">× {item.quantity}</span>
                    <span className="item-snippet-price">
                      ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="order-total-info">
                  <span className="order-total-label">Total Amount:</span>
                  <span className="order-total-value">
                    ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
                <Link to={`/order-success/${order._id}`} className="btn-order-details">
                  View Order Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
