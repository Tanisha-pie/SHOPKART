import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    error,
    cartCount,
    subtotal,
    totalUniqueItems,
    refreshCart,
  } = useCart();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="cart-page-container">
      <div className="cart-header">
        <h1 className="page-heading">My Shopping Cart</h1>
        {!loading && !error && cart.length > 0 && (
          <p className="page-subheading">
            {cartCount} {cartCount === 1 ? "unit" : "units"} across {totalUniqueItems}{" "}
            {totalUniqueItems === 1 ? "item" : "items"}
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && cart.length === 0 ? (
        <div className="state-container loading-state">
          <div className="spinner spinner-dark" />
          <p>Loading your cart...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <h3>Unable to load your cart</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={refreshCart}>
            Try Again
          </button>
        </div>
      ) : cart.length === 0 ? (
        /* Empty State */
        <div className="state-container empty-cart-state">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn-browse-products">
            Browse Products
          </Link>
        </div>
      ) : (
        /* Cart Content Grid */
        <div className="cart-content-layout">
          {/* Left Column: Items */}
          <div className="cart-items-list">
            {cart.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div className="cart-summary-col">
            <div className="order-summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-row">
                <span>Unique Products</span>
                <span>{totalUniqueItems}</span>
              </div>

              <div className="summary-row">
                <span>Total Units</span>
                <span>{cartCount}</span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <span className="free-shipping">FREE</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-row total-row">
                <span>Subtotal</span>
                <span className="summary-total-amount">
                  ₹{Number(subtotal).toLocaleString("en-IN")}
                </span>
              </div>

              <button className="btn-checkout" onClick={handleCheckout}>
                Proceed to Checkout →
              </button>

              <div className="summary-guarantee">
                🔒 Safe & Secure Checkout
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
