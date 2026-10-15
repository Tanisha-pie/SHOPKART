import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch cart on initial mount
  const refreshCart = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/cart");
      if (response.data.success) {
        setCart(response.data.cart || []);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Not authenticated: empty cart
        setCart([]);
      } else {
        setError("Unable to load your cart.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  // Add product to cart (or increment quantity)
  const addToCart = async (productId) => {
    try {
      setError("");
      const response = await API.post(`/cart/${productId}`);
      if (response.data.success) {
        setCart(response.data.cart || []);
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add product to cart";
      return { success: false, message: msg };
    }
  };

  // Update quantity (with stock and minimum limits)
  const updateQuantity = async (productId, quantity) => {
    try {
      setError("");
      const response = await API.patch(`/cart/${productId}`, { quantity });
      if (response.data.success) {
        setCart(response.data.cart || []);
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update quantity";
      return { success: false, message: msg };
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    try {
      setError("");
      const response = await API.delete(`/cart/${productId}`);
      if (response.data.success) {
        setCart(response.data.cart || []);
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to remove product";
      return { success: false, message: msg };
    }
  };

  // Derived values (calculated dynamically without being stored in DB)
  // Total units for Navbar (e.g., Keyboard x 2 + Mouse x 1 = 3)
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  // Subtotal in rupees: Σ(price * quantity)
  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const qty = item.quantity || 0;
    return sum + price * qty;
  }, 0);

  const totalUniqueItems = cart.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        cartCount,
        subtotal,
        totalUniqueItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
