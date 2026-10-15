import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import { CartProvider } from "./context/CartContext";
import API from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Attempt initial session check on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get("/customers/me");
        setUser(response.data);

        // Fetch user's wishlist count
        try {
          const wishRes = await API.get("/wishlist");
          if (wishRes.data.success) {
            setWishlistCount(wishRes.data.count || 0);
          }
        } catch (e) {
          // Ignore if wishlist fetch fails
        }
      } catch (error) {
        setUser(null);
        setWishlistCount(0);
      }
    };
    checkAuth();
  }, []);

  return (
    <CartProvider>
      <Router>
        <div className="app-container">
          <Navbar user={user} setUser={setUser} wishlistCount={wishlistCount} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to={user ? "/products" : "/login"} replace />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/home" element={<Home user={user} setUser={setUser} />} />
              <Route
                path="/products"
                element={<Products onWishlistCountChange={setWishlistCount} />}
              />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route
                path="/wishlist"
                element={<Wishlist onWishlistCountChange={setWishlistCount} />}
              />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/products" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
