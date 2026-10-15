import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import WishlistCard from "../components/WishlistCard";

const Wishlist = ({ onWishlistCountChange }) => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/wishlist");

      if (response.data.success) {
        const items = response.data.wishlist || [];
        setWishlist(items);
        if (onWishlistCountChange) {
          onWishlistCountChange(items.length);
        }
      }
    } catch (err) {
      console.error("Error loading wishlist:", err);
      if (err.response?.status === 401) {
        // Not authenticated -> redirect to login
        navigate("/login");
      } else {
        setError("Something went wrong. We couldn't load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [navigate]);

  const handleRemoveItem = async (productId) => {
    // Optimistic UI update or API call followed by state update
    try {
      await API.delete(`/wishlist/${productId}`);
      setWishlist((prev) => {
        const updated = prev.filter((item) => item._id !== productId);
        if (onWishlistCountChange) {
          onWishlistCountChange(updated.length);
        }
        return updated;
      });
    } catch (err) {
      console.error("Error removing item:", err);
      // Re-fetch to sync
      fetchWishlist();
    }
  };

  return (
    <div className="wishlist-container">
      {/* Page Header */}
      <div className="wishlist-header">
        <h1 className="page-heading">My Wishlist</h1>
        {!loading && !error && wishlist.length > 0 && (
          <p className="page-subheading">
            {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="state-container loading-state">
          <div className="spinner spinner-dark" />
          <p>Loading your wishlist...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchWishlist}>
            Try Again
          </button>
        </div>
      ) : wishlist.length === 0 ? (
        /* Empty State */
        <div className="state-container empty-wishlist-state">
          <div className="empty-heart-icon">❤️</div>
          <h2>Your wishlist is empty</h2>
          <p>Save products you love and find them here later.</p>
          <Link to="/products" className="btn-browse-products">
            Browse Products
          </Link>
        </div>
      ) : (
        /* Dynamic Wishlist Grid */
        <div className="products-grid">
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
