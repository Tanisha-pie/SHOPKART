import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const product = item.product;
  const quantity = item.quantity;
  const itemTotal = (product?.price || 0) * quantity;
  const isMaxStock = quantity >= (product?.stock || 0);

  const handleIncrease = async () => {
    if (isMaxStock || updating) return;
    setUpdating(true);
    setErrorMsg("");
    const res = await updateQuantity(product._id, quantity + 1);
    if (!res.success) {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(""), 3000);
    }
    setUpdating(false);
  };

  const handleDecrease = async () => {
    if (quantity <= 1 || updating) return;
    setUpdating(true);
    setErrorMsg("");
    const res = await updateQuantity(product._id, quantity - 1);
    if (!res.success) {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(""), 3000);
    }
    setUpdating(false);
  };

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    await removeFromCart(product._id);
    setRemoving(false);
  };

  return (
    <div className="cart-item-card">
      {/* Product Image */}
      <div className="cart-item-image-box">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item-image"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";
          }}
        />
      </div>

      {/* Product Details & Actions */}
      <div className="cart-item-info">
        <div className="cart-item-top">
          <div>
            <span className="cart-item-category">{product.category}</span>
            <Link to={`/products/${product._id}`} className="cart-item-title">
              {product.name}
            </Link>
          </div>
          <div className="cart-item-price-col">
            <span className="cart-item-total-price">
              ₹{Number(itemTotal).toLocaleString("en-IN")}
            </span>
            <span className="cart-item-unit-price">
              (₹{Number(product.price).toLocaleString("en-IN")} each)
            </span>
          </div>
        </div>

        {errorMsg && <div className="cart-item-error">{errorMsg}</div>}

        <div className="cart-item-bottom">
          {/* Quantity Controls */}
          <div className="quantity-controls">
            <button
              className="qty-btn"
              onClick={handleDecrease}
              disabled={quantity <= 1 || updating}
              title={quantity <= 1 ? "Minimum quantity is 1" : "Decrease quantity"}
            >
              −
            </button>
            <span className="qty-display">{updating ? "..." : quantity}</span>
            <button
              className="qty-btn"
              onClick={handleIncrease}
              disabled={isMaxStock || updating}
              title={
                isMaxStock
                  ? `Max available stock reached (${product.stock})`
                  : "Increase quantity"
              }
            >
              +
            </button>
          </div>

          <span className="cart-stock-hint">
            {product.stock} units available
          </span>

          <button
            className="cart-remove-btn"
            onClick={handleRemove}
            disabled={removing}
          >
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
