import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await API.get(`/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.product);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        if (err.response && err.response.status === 404) {
          setError("Product not found.");
        } else if (err.response && err.response.status === 400) {
          setError("Invalid product ID.");
        } else {
          setError("Something went wrong while loading the product.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    const res = await addToCart(product._id);
    if (res.success) {
      setAddedMessage("✓ Added to cart successfully!");
    } else {
      setAddedMessage(res.message);
    }
    setAddingToCart(false);
    setTimeout(() => {
      setAddedMessage("");
    }, 3000);
  };

  if (loading) {
    return (
      <div className="state-container loading-state">
        <div className="spinner spinner-dark" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="state-container error-state">
        <div className="state-icon">⚠️</div>
        <h3>{error || "Unable to display product"}</h3>
        <Link to="/products" className="btn-back">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-details-container">
      <Link to="/products" className="btn-back-link">
        ← Back to Catalogue
      </Link>

      <div className="product-details-card">
        {/* Left: Large Image */}
        <div className="details-image-section">
          <img
            src={product.image}
            alt={product.name}
            className="details-large-image"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80";
            }}
          />
        </div>

        {/* Right: Product Info */}
        <div className="details-info-section">
          <div className="details-category-tag">{product.category}</div>
          <h1 className="details-title">{product.name}</h1>

          <div className="details-price-row">
            <span className="details-price">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <span
              className={`details-stock-chip ${
                isOutOfStock ? "out-of-stock" : "in-stock"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : `${product.stock} units in stock`}
            </span>
          </div>

          <div className="details-divider" />

          <div className="details-description-block">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="details-actions">
            <button
              className="btn-add-to-cart"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              🛒 {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            {addedMessage && (
              <div className="add-cart-toast">
                ✓ Added to cart (Cart functionality coming in Lab-04!)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
