import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DataPages.css";

const BASE_URL = "http://localhost:5000/api";

export default function InspectionPage({ userRole }) {
  const [inspections, setInspections] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [newInspection, setNewInspection] = useState({
    product_id: "",
    inspector_id: "",
    inspection_date: "",
    result: "pass",
    notes: "",
    photo_url: "",
  });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    fetchInspections();
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchInspections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/inspections`);
      setInspections(res.data);
    } catch (err) {
      console.error("Error fetching inspections", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const addInspection = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/inspections`, newInspection);
      setNewInspection({
        product_id: "",
        inspector_id: "",
        inspection_date: "",
        result: "pass",
        notes: "",
        photo_url: "",
      });
      fetchInspections();
    } catch (err) {
      console.error("Error adding inspection", err);
      alert("Error adding inspection. Please try again.");
    }
  };

  const deleteInspection = async (id) => {
    if (!isAdmin) {
      alert("Only admins can delete inspections!");
      return;
    }
    
    if (!window.confirm("Delete this inspection?")) return;
    
    try {
      await axios.delete(`${BASE_URL}/inspections/${id}`);
      fetchInspections();
    } catch (err) {
      console.error("Error deleting inspection", err);
      alert("Error deleting inspection. Please try again.");
    }
  };

  const startEdit = (inspection) => {
    if (!isAdmin) {
      alert("Only admins can edit inspections!");
      return;
    }
    
    setEditingId(inspection.id);
    setEditingData({
      product_id: inspection.product_id,
      inspector_id: inspection.inspector_id,
      inspection_date: inspection.inspection_date?.split('T')[0] || '',
      result: inspection.result,
      notes: inspection.notes || '',
      photo_url: inspection.photo_url || '',
    });
  };

  const updateInspection = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/inspections/${editingId}`, editingData);
      setEditingId(null);
      setEditingData({});
      fetchInspections();
    } catch (err) {
      console.error("Error updating inspection", err);
      alert("Error updating inspection. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-clipboard-check"></i>
            Inspection Management
          </h1>
          <p>Record and track quality control inspections</p>
        </div>
      </div>

      {/* Add Inspection Form */}
      <div className="form-card">
        <h3>
          <i className="fas fa-plus-circle"></i>
          New Inspection
        </h3>
        <form onSubmit={addInspection} className="data-form">
          <div className="form-row">
            <div className="form-field">
              <label>Product *</label>
              <select
                value={newInspection.product_id}
                onChange={(e) =>
                  setNewInspection({ ...newInspection, product_id: e.target.value })
                }
                required
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Inspector *</label>
              <select
                value={newInspection.inspector_id}
                onChange={(e) =>
                  setNewInspection({ ...newInspection, inspector_id: e.target.value })
                }
                required
              >
                <option value="">Select Inspector</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Inspection Date *</label>
              <input
                type="date"
                value={newInspection.inspection_date}
                onChange={(e) =>
                  setNewInspection({ ...newInspection, inspection_date: e.target.value })
                }
                required
              />
            </div>

            <div className="form-field">
              <label>Result *</label>
              <select
                value={newInspection.result}
                onChange={(e) =>
                  setNewInspection({ ...newInspection, result: e.target.value })
                }
                required
              >
                <option value="pass">✓ Pass</option>
                <option value="fail">✗ Fail</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Notes</label>
              <textarea
                placeholder="Add inspection notes..."
                value={newInspection.notes}
                onChange={(e) =>
                  setNewInspection({ ...newInspection, notes: e.target.value })
                }
                rows="3"
              />
            </div>

            <div className="form-field">
              <label>Photo URL</label>
              <input
                placeholder="https://example.com/photo.jpg"
                value={newInspection.photo_url}
                onChange={(e) =>
                  setNewInspection({ ...newInspection, photo_url: e.target.value })
                }
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <i className="fas fa-check-circle"></i>
            Add Inspection
          </button>
        </form>
      </div>

      {/* Edit Inspection Form */}
      {editingId && (
        <div className="form-card edit-card">
          <h3>
            <i className="fas fa-edit"></i>
            Edit Inspection
          </h3>
          <form onSubmit={updateInspection} className="data-form">
            <div className="form-row">
              <div className="form-field">
                <label>Product *</label>
                <select
                  value={editingData.product_id}
                  onChange={(e) =>
                    setEditingData({ ...editingData, product_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Inspector *</label>
                <select
                  value={editingData.inspector_id}
                  onChange={(e) =>
                    setEditingData({ ...editingData, inspector_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select Inspector</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Inspection Date *</label>
                <input
                  type="date"
                  value={editingData.inspection_date}
                  onChange={(e) =>
                    setEditingData({ ...editingData, inspection_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>Result *</label>
                <select
                  value={editingData.result}
                  onChange={(e) =>
                    setEditingData({ ...editingData, result: e.target.value })
                  }
                  required
                >
                  <option value="pass">✓ Pass</option>
                  <option value="fail">✗ Fail</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Notes</label>
                <textarea
                  placeholder="Add inspection notes..."
                  value={editingData.notes}
                  onChange={(e) =>
                    setEditingData({ ...editingData, notes: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <div className="form-field">
                <label>Photo URL</label>
                <input
                  placeholder="https://example.com/photo.jpg"
                  value={editingData.photo_url}
                  onChange={(e) =>
                    setEditingData({ ...editingData, photo_url: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                <i className="fas fa-check"></i>
                Update
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                <i className="fas fa-times"></i>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inspections Table */}
      <div className="table-card">
        <h3>
          <i className="fas fa-list"></i>
          All Inspections ({inspections.length})
        </h3>
        {!isAdmin && (
          <div className="role-notice">
            <i className="fas fa-info-circle"></i>
            <span>You are viewing as <strong>Inspector</strong>. Only admins can edit or delete inspections.</span>
          </div>
        )}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Inspector</th>
                <th>Date</th>
                <th>Result</th>
                <th>Notes</th>
                <th>Photo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection) => {
                const product = products.find(
                  (prod) => prod.id === inspection.product_id
                );
                const inspector = users.find(
                  (user) => user.id === inspection.inspector_id
                );
                return (
                  <tr key={inspection.id}>
                    <td>{inspection.id}</td>
                    <td>{product?.name || 'N/A'}</td>
                    <td>{inspector?.name || 'N/A'}</td>
                    <td>{formatDate(inspection.inspection_date)}</td>
                    <td>
                      <span className={`badge badge-${inspection.result === 'pass' ? 'success' : 'danger'}`}>
                        {inspection.result === 'pass' ? '✓ Pass' : '✗ Fail'}
                      </span>
                    </td>
                    <td className="notes-cell">{inspection.notes || '-'}</td>
                    <td>
                      {inspection.photo_url ? (
                        <a href={inspection.photo_url} target="_blank" rel="noopener noreferrer" className="photo-link">
                          <i className="fas fa-image"></i> View
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {isAdmin ? (
                          <>
                            <button onClick={() => startEdit(inspection)} className="btn btn-sm btn-warning">
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button onClick={() => deleteInspection(inspection.id)} className="btn btn-sm btn-danger">
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-muted">View Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}