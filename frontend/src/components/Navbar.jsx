import React from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";

const Navbar = ({ user, setUser, wishlistCount = 0 }) => {
  const navigate = useNavigate();
  const { cartCount, refreshCart } = useCart();

  const handleLogout = async () => {
    try {
      await API.post("/customers/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      if (setUser) setUser(null);
      if (refreshCart) refreshCart();
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-wrapper">
        <Link to={user ? "/home" : "/products"} className="nav-brand">
          <div className="logo-icon">S</div>
          <span>ShopKart</span>
        </Link>

        <div className="nav-links">
          {user && (
            <Link to="/home" className="nav-link">
              Home
            </Link>
          )}

          <Link to="/products" className="nav-link">
            Products
          </Link>

          {user ? (
            <>
              <Link to="/wishlist" className="nav-link nav-wishlist-link">
                Wishlist
                {wishlistCount > 0 && (
                  <span className="navbar-badge">{wishlistCount}</span>
                )}
              </Link>

              <Link to="/cart" className="nav-link nav-cart-link">
                Cart
                {cartCount > 0 && (
                  <span className="navbar-badge cart-badge">{cartCount}</span>
                )}
              </Link>

              <Link to="/orders" className="nav-link">
                Orders
              </Link>

              <div className="nav-user">
                <div className="user-badge">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <span>{user.fullName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn-logout"
                title="Log out of your account"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
