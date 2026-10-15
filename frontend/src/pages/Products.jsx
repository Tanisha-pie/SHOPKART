import React, { useState, useEffect } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

const Products = ({ onWishlistCountChange }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("");

  // Fetch initial wishlist to reflect saved hearts
  useEffect(() => {
    const fetchWishlistIds = async () => {
      try {
        const response = await API.get("/wishlist");
        if (response.data.success) {
          const ids = new Set((response.data.wishlist || []).map((item) => item._id));
          setWishlistIds(ids);
          if (onWishlistCountChange) {
            onWishlistCountChange(ids.size);
          }
        }
      } catch (err) {
        // If not logged in, ignore
      }
    };

    fetchWishlistIds();
  }, [onWishlistCountChange]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, sort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category && category !== "All Categories") params.category = category;
      if (sort) params.sort = sort;

      const response = await API.get("/products", { params });

      if (response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistChange = (productId, isAdded) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isAdded) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      if (onWishlistCountChange) {
        onWishlistCountChange(next.size);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setSort("");
  };

  return (
    <div className="products-container">
      {/* Header */}
      <div className="products-header">
        <div>
          <h1 className="page-heading">Discover Products</h1>
          <p className="page-subheading">
            Browse our curated catalogue of top-tier products
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <SearchBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
      />

      {/* UI States */}
      {loading ? (
        <div className="state-container loading-state">
          <div className="spinner spinner-dark" />
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchProducts}>
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="state-container empty-state">
          <div className="state-icon">📦</div>
          <h3>No products found</h3>
          <p>Try adjusting your search terms or category filter.</p>
          <button className="btn-reset" onClick={handleResetFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="products-results-info">
            Showing <strong>{products.length}</strong> {products.length === 1 ? "product" : "products"}
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isInitiallyWishlisted={wishlistIds.has(product._id)}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
