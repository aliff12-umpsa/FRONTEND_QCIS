// src/pages/ProductPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DataPages.css";

const BASE_URL = "http://localhost:5000/api";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: ""
  });

  // Edit form state
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    name: "",
    category: "",
    price: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add Product
  const addProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.name.trim()) {
      alert("Product name is required!");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/products`, newProduct);
      setNewProduct({
        name: "",
        category: "",
        price: ""
      });
      fetchProducts();
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Error adding product. Please try again.");
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This may affect related inspections.")) return;
    
    try {
      await axios.delete(`${BASE_URL}/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Error deleting product. Please try again.");
    }
  };

  // Start Editing
  const startEdit = (product) => {
    setEditingId(product.id);
    setEditingData({
      name: product.name,
      category: product.category,
      price: product.price
    });
  };

  // Update Product
  const updateProduct = async (e) => {
    e.preventDefault();
    
    if (!editingData.name.trim()) {
      alert("Product name is required!");
      return;
    }

    try {
      await axios.put(`${BASE_URL}/products/${editingId}`, editingData);
      setEditingId(null);
      setEditingData({
        name: "",
        category: "",
        price: ""
      });
      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Error updating product. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({
      name: "",
      category: "",
      price: ""
    });
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return "-";
    const numPrice = parseFloat(price);
    return `RM ${numPrice.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-box"></i>
            Product Management
          </h1>
          <p>Manage products available for quality inspection</p>
        </div>
      </div>

      {/* Add Product Form */}
      <div className="form-card">
        <h3>
          <i className="fas fa-plus-circle"></i>
          Add New Product
        </h3>
        <form onSubmit={addProduct} className="data-form">
          <div className="form-row">
            <div className="form-field">
              <label>Product Name *</label>
              <input
                type="text"
                placeholder="e.g., Widget A, Component X"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label>Category *</label>
              <input
                type="text"
                placeholder="e.g., Electronics, Hardware, Parts"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Price (RM) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
            </div>
            <div className="form-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <i className="fas fa-plus-circle"></i>
                Add Product
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Edit Product Form */}
      {editingId && (
        <div className="form-card edit-card">
          <h3>
            <i className="fas fa-edit"></i>
            Edit Product
          </h3>
          <form onSubmit={updateProduct} className="data-form">
            <div className="form-row">
              <div className="form-field">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={editingData.name}
                  onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <label>Category *</label>
                <input
                  type="text"
                  placeholder="Category"
                  value={editingData.category}
                  onChange={(e) => setEditingData({ ...editingData, category: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Price (RM) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price"
                  value={editingData.price}
                  onChange={(e) => setEditingData({ ...editingData, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-field" style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                  <i className="fas fa-check"></i>
                  Update
                </button>
                <button type="button" onClick={cancelEdit} className="btn btn-secondary" style={{ flex: 1 }}>
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="table-card">
        <h3>
          <i className="fas fa-list"></i>
          All Products ({products.length})
        </h3>
        <div className="table-responsive">
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <i className="fas fa-box-open" style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }}></i>
              <p style={{ marginTop: '16px', color: '#64748b', margin: 0 }}>
                No products found. Add your first product above!
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {product.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: '#10b981' }}>
                      {formatPrice(product.price)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => startEdit(product)} 
                          className="btn btn-sm btn-warning"
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)} 
                          className="btn btn-sm btn-danger"
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Product Statistics */}
      {products.length > 0 && (
        <div className="stats-row" style={{ marginTop: '24px' }}>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-content">
                <h3>Total Products</h3>
                <p className="stat-value">{products.length}</p>
              </div>
              <div className="stat-icon">
                <i className="fas fa-box"></i>
              </div>
            </div>
            <div className="stat-change positive">
              <i className="fas fa-box"></i>
              <span>In inventory</span>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-header">
              <div className="stat-content">
                <h3>Categories</h3>
                <p className="stat-value">
                  {[...new Set(products.map(p => p.category))].length}
                </p>
              </div>
              <div className="stat-icon">
                <i className="fas fa-tags"></i>
              </div>
            </div>
            <div className="stat-change positive">
              <i className="fas fa-layer-group"></i>
              <span>Unique types</span>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-header">
              <div className="stat-content">
                <h3>Avg Price</h3>
                <p className="stat-value">
                  {products.length > 0 
                    ? `RM ${(products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) / products.length).toFixed(2)}`
                    : 'RM 0.00'
                  }
                </p>
              </div>
              <div className="stat-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
            </div>
            <div className="stat-change">
              <i className="fas fa-calculator"></i>
              <span>Average value</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-content">
                <h3>Total Value</h3>
                <p className="stat-value">
                  {`RM ${products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0).toFixed(2)}`}
                </p>
              </div>
              <div className="stat-icon">
                <i className="fas fa-coins"></i>
              </div>
            </div>
            <div className="stat-change positive">
              <i className="fas fa-chart-line"></i>
              <span>Inventory value</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;