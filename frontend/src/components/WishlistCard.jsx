import React, { useState } from "react";
import { Link } from "react-router-dom";

const WishlistCard = ({ product, onRemove }) => {
  const [removing, setRemoving] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const handleRemove = async () => {
    try {
      setRemoving(true);
      await onRemove(product._id);
    } catch (err) {
      console.error("Failed to remove product:", err);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="product-card wishlist-card">
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

        <div className="wishlist-card-actions">
          <Link to={`/products/${product._id}`} className="btn-view-details">
            View Details
          </Link>
          <button
            onClick={handleRemove}
            className="btn-remove-wishlist"
            disabled={removing}
            title="Remove from wishlist"
          >
            {removing ? "Removing..." : "Remove ♥"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
