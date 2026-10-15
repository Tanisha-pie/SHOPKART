import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product, isInitiallyWishlisted = false, onWishlistChange }) => {
  const { addToCart, cart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(isInitiallyWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState(""); // "success", "info", "error"

  const isOutOfStock = product.stock <= 0;

  // Check if item is already in cart to show contextual button
  const existingCartItem = cart.find((item) => item.product?._id === product._id);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistLoading) return;

    setWishlistLoading(true);
    setToastMessage("");

    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${product._id}`);
        setIsWishlisted(false);
        setToastMessage("Removed from Wishlist");
        setToastType("info");
        if (onWishlistChange) onWishlistChange(product._id, false);
      } else {
        await API.post(`/wishlist/${product._id}`);
        setIsWishlisted(true);
        setToastMessage("♥ Added to Wishlist");
        setToastType("success");
        if (onWishlistChange) onWishlistChange(product._id, true);
      }

      setTimeout(() => setToastMessage(""), 2500);
    } catch (err) {
      if (err.response?.status === 401) {
        setToastMessage("Please login first");
        setToastType("error");
      } else if (err.response?.status === 409) {
        setIsWishlisted(true);
        setToastMessage("Already in Wishlist");
        setToastType("info");
      } else {
        setToastMessage(err.response?.data?.message || "Unable to save product");
        setToastType("error");
      }
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || cartLoading) return;

    setCartLoading(true);
    setToastMessage("");

    const res = await addToCart(product._id);
    if (res.success) {
      setToastMessage("🛒 Added to Cart!");
      setToastType("success");
    } else {
      setToastMessage(res.message);
      setToastType("error");
    }

    setTimeout(() => setToastMessage(""), 2500);
    setCartLoading(false);
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";
          }}
        />
        <span className="product-category-badge">{product.category}</span>

        {/* Quick heart toggle button on image */}
        <button
          className={`btn-card-heart ${isWishlisted ? "active" : ""}`}
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {wishlistLoading ? "⏳" : isWishlisted ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-content">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        <div className="product-meta">
          <span className="product-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          <span className={`stock-status ${isOutOfStock ? "out-of-stock" : "in-stock"}`}>
            {isOutOfStock ? "Out of Stock" : `${product.stock} units left`}
          </span>
        </div>

        {toastMessage && (
          <div className={`card-status-toast ${toastType}`}>
            {toastMessage}
          </div>
        )}

        <div className="product-card-button-row">
          <Link to={`/products/${product._id}`} className="btn-view-details">
            View Details
          </Link>
          <button
            className={`btn-action-cart ${isOutOfStock ? "disabled" : ""}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
            title={isOutOfStock ? "Out of stock" : "Add to Cart"}
          >
            {cartLoading
              ? "⏳ Adding..."
              : isOutOfStock
              ? "Out of Stock"
              : existingCartItem
              ? `In Cart (${existingCartItem.quantity}) +`
              : "Add to Cart 🛒"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
