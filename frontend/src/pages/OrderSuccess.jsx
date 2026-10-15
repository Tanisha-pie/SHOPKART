import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/orders/${id}`);
        if (response.data.success) {
          setOrder(response.data.order);
        }
      } catch (err) {
        console.error("Error loading order:", err);
        setError("Unable to load order details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="state-container loading-state">
        <div className="spinner spinner-dark" />
        <p>Loading order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="state-container error-state">
        <div className="state-icon">⚠️</div>
        <h3>{error || "Order not found"}</h3>
        <Link to="/orders" className="btn-browse-products">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        <div className="success-icon-badge">✅</div>
        <h1 className="success-heading">Order Placed Successfully!</h1>
        <p className="success-subheading">
          Thank you for your purchase. Your payment was verified and your order is confirmed.
        </p>

        <div className="order-meta-banner">
          <div className="meta-box">
            <span className="meta-label">Order ID</span>
            <span className="meta-val font-mono">{order._id}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Payment Status</span>
            <span className="status-badge paid">{order.paymentStatus}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Order Status</span>
            <span className="status-badge placed">{order.status}</span>
          </div>
          {order.razorpayPaymentId && (
            <div className="meta-box">
              <span className="meta-label">Razorpay Payment ID</span>
              <span className="meta-val font-mono">{order.razorpayPaymentId}</span>
            </div>
          )}
        </div>

        {/* Purchased Items List */}
        <div className="order-summary-section">
          <h3>Items Purchased</h3>
          <div className="success-items-list">
            {order.items.map((item, index) => (
              <div key={index} className="success-item-row">
                <div className="item-main-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-unit-calc">
                    ₹{Number(item.price).toLocaleString("en-IN")} × {item.quantity}
                  </span>
                </div>
                <span className="item-subtotal">
                  ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-divider" />

          <div className="success-total-row">
            <span>Total Paid</span>
            <span className="success-total-price">
              ₹{Number(order.totalAmount).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="shipping-confirmation-box">
          <h3>Delivery Address</h3>
          <p>
            <strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})
          </p>
          <p>
            {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
        </div>

        <div className="success-actions-row">
          <Link to="/orders" className="btn-view-orders">
            📦 View My Orders
          </Link>
          <Link to="/products" className="btn-continue-shopping">
            🛍️ Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
