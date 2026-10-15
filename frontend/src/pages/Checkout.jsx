import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../services/api";

// Dynamically load the official Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, subtotal, cartCount, refreshCart } = useCart();

  // Shipping details state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    const cleanPhone = shippingAddress.phone.trim();
    if (!cleanPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(cleanPhone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = "Address line is required";
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!shippingAddress.state.trim()) {
      newErrors.state = "State is required";
    }

    const cleanPincode = shippingAddress.pincode.trim();
    if (!cleanPincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(cleanPincode)) {
      newErrors.pincode = "Pincode must be exactly 6 digits";
    }

    return newErrors;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!cart || cart.length === 0) {
      setErrorMessage("Your cart is empty. Please add items before checking out.");
      return;
    }

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create ShopKart Pending Order and Razorpay Order on Backend
      const orderRes = await API.post("/orders/create-payment-order", {
        shippingAddress,
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || "Failed to create order");
      }

      const {
        shopKartOrderId,
        razorpayOrderId,
        amount,
        currency,
        key,
      } = orderRes.data;

      // Step 2: Load Razorpay Checkout SDK
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        // Fallback for environments where external Razorpay script is blocked or offline
        const simulate = window.confirm(
          "Razorpay script could not be loaded online or is blocked by the browser. Would you like to proceed with a Simulated Test Payment?"
        );
        if (simulate) {
          const verifyRes = await API.post("/orders/verify-payment", {
            shopKartOrderId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: "simulated_test_signature",
          });

          if (verifyRes.data.success) {
            await refreshCart();
            navigate(`/order-success/${shopKartOrderId}`);
            return;
          } else {
            throw new Error("Payment verification failed.");
          }
        } else {
          setProcessing(false);
          return;
        }
      }

      // Step 3: Open Razorpay Checkout modal
      const options = {
        key: key || "rzp_test_5173ShopKart",
        amount: amount,
        currency: currency || "INR",
        name: "ShopKart",
        description: `Order #${shopKartOrderId}`,
        order_id: razorpayOrderId,
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async function (response) {
          try {
            // Step 4: Verify Payment Signature on Backend
            const verifyRes = await API.post("/orders/verify-payment", {
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // Clear global cart state and navigate to success page
              await refreshCart();
              navigate(`/order-success/${shopKartOrderId}`);
            } else {
              setErrorMessage("Payment verification failed. Your cart was not cleared.");
            }
          } catch (verErr) {
            console.error("Verification error:", verErr);
            setErrorMessage(
              verErr.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            setErrorMessage("Payment was cancelled. Your cart has been preserved.");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        setErrorMessage(`Payment failed: ${response.error.description}. Your cart is preserved.`);
        setProcessing(false);
      });

      paymentObject.open();
    } catch (err) {
      console.error("Checkout process error:", err);
      setErrorMessage(
        err.response?.data?.message || err.message || "An error occurred during checkout."
      );
      setProcessing(false);
    }
  };

  if (cartLoading && (!cart || cart.length === 0)) {
    return (
      <div className="state-container loading-state">
        <div className="spinner spinner-dark" />
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="state-container empty-cart-state">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Please add products to your cart before proceeding to checkout.</p>
        <Link to="/products" className="btn-browse-products">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1 className="page-heading">Checkout & Payment</h1>
        <p className="page-subheading">
          Enter delivery address and complete payment via Razorpay Test Mode
        </p>
      </div>

      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      <div className="checkout-layout">
        {/* Left Column: Shipping Address Form */}
        <div className="shipping-form-card">
          <h2 className="checkout-section-title">1. Shipping Address</h2>

          <form onSubmit={handlePlaceOrder} noValidate id="checkout-form">
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                className={`form-input ${errors.fullName ? "error" : ""}`}
                placeholder="e.g. Aarav Sharma"
                value={shippingAddress.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <div className="form-error">{errors.fullName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number (10 digits) *
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                maxLength="10"
                className={`form-input ${errors.phone ? "error" : ""}`}
                placeholder="e.g. 9876543210"
                value={shippingAddress.phone}
                onChange={handleChange}
              />
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="addressLine1">
                Street Address / House No. *
              </label>
              <input
                id="addressLine1"
                type="text"
                name="addressLine1"
                className={`form-input ${errors.addressLine1 ? "error" : ""}`}
                placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                value={shippingAddress.addressLine1}
                onChange={handleChange}
              />
              {errors.addressLine1 && (
                <div className="form-error">{errors.addressLine1}</div>
              )}
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="city">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  className={`form-input ${errors.city ? "error" : ""}`}
                  placeholder="e.g. Bengaluru"
                  value={shippingAddress.city}
                  onChange={handleChange}
                />
                {errors.city && <div className="form-error">{errors.city}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="state">
                  State *
                </label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  className={`form-input ${errors.state ? "error" : ""}`}
                  placeholder="e.g. Karnataka"
                  value={shippingAddress.state}
                  onChange={handleChange}
                />
                {errors.state && <div className="form-error">{errors.state}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pincode">
                  Pincode (6 digits) *
                </label>
                <input
                  id="pincode"
                  type="text"
                  name="pincode"
                  maxLength="6"
                  className={`form-input ${errors.pincode ? "error" : ""}`}
                  placeholder="e.g. 560001"
                  value={shippingAddress.pincode}
                  onChange={handleChange}
                />
                {errors.pincode && <div className="form-error">{errors.pincode}</div>}
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Review & Razorpay Action */}
        <div className="checkout-summary-col">
          <div className="order-summary-card">
            <h2 className="summary-title">2. Order Summary</h2>

            <div className="checkout-items-review">
              {cart.map((item) => (
                <div key={item.product._id} className="checkout-review-item">
                  <div className="review-item-main">
                    <span className="review-item-name">{item.product.name}</span>
                    <span className="review-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="review-item-price">
                    ₹{Number(item.product.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Items Total ({cartCount} units)</span>
              <span>₹{Number(subtotal).toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-row">
              <span>Delivery Charges</span>
              <span className="free-shipping">FREE</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row total-row">
              <span>Total Payable</span>
              <span className="summary-total-amount">
                ₹{Number(subtotal).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="razorpay-badge-banner">
              💳 Secured with <strong>Razorpay Test Mode</strong>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="btn-place-order"
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner" /> Processing Payment...
                </>
              ) : (
                `Pay with Razorpay (₹${Number(subtotal).toLocaleString("en-IN")})`
              )}
            </button>

            <div className="summary-guarantee">
              🔒 100% Secure Checkout | Test Mode Only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
