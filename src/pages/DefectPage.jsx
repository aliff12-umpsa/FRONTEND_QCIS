import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DataPages.css";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function DefectPage({ userRole }) {
  const [defects, setDefects] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newDefect, setNewDefect] = useState({
    inspection_id: "",
    defect_type: "",
    description: "",
    severity: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

  const [filterInspectionId, setFilterInspectionId] = useState("");

  const isAdmin = userRole === "admin";

  // Load inspections and products
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchInspections();
      await fetchProducts();
      setLoading(false);
    };
    loadData();
  }, []);

  // Fetch all defects after inspections are loaded
  useEffect(() => {
    if (inspections.length > 0) {
      fetchAllDefects();
    }
  }, [inspections]);

  // Fetch inspections list
  const fetchInspections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/inspections`);
      setInspections(res.data || []);
    } catch (err) {
      console.error("Error fetching inspections:", err);
      setInspections([]);
    }
  };

  // Fetch products list
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/products`);
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  // Fetch all defects
  const fetchAllDefects = async () => {
    try {
      setLoading(true);
      let allDefects = [];

      // Try direct endpoint first
      try {
        const res = await axios.get(`${BASE_URL}/defects`);
        if (Array.isArray(res.data)) {
          allDefects = res.data;
        }
      } catch {
        // Fallback: fetch defects per inspection
        const defectsMap = new Map();
        for (const inspection of inspections) {
          try {
            const res = await axios.get(`${BASE_URL}/defects/${inspection.id}`);
            if (Array.isArray(res.data)) {
              res.data.forEach((d) => defectsMap.set(d.id, d));
            }
          } catch {}
        }
        allDefects = Array.from(defectsMap.values());
      }

      setDefects(allDefects);
    } catch (err) {
      console.error("Error fetching defects:", err);
      setDefects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch defects by inspection ID
  const fetchDefectsByInspection = async (inspectionId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/defects/${inspectionId}`);
      setDefects(res.data || []);
    } catch (err) {
      console.error("Error fetching defects by inspection:", err);
      setDefects([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = async (id) => {
    setFilterInspectionId(id);
    if (!id) {
      await fetchAllDefects();
    } else {
      await fetchDefectsByInspection(id);
    }
  };

  // Add new defect
  const addDefect = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/defects`, newDefect);
      setNewDefect({ inspection_id: "", defect_type: "", description: "", severity: "" });
      handleFilterChange(filterInspectionId);
    } catch (err) {
      console.error("Error adding defect:", err);
      alert("Error adding defect. Please try again.");
    }
  };

  // Start editing
  const startEdit = (defect) => {
    if (!isAdmin) return alert("Only admins can edit defects!");
    setEditingId(defect.id);
    setEditingData({ ...defect });
  };

  // Update defect
  const updateDefect = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/defects/${editingId}`, editingData);
      setEditingId(null);
      setEditingData({});
      handleFilterChange(filterInspectionId);
    } catch (err) {
      console.error("Error updating defect:", err);
      alert("Error updating defect. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  // Delete defect
  const deleteDefect = async (id) => {
    if (!isAdmin) return alert("Only admins can delete defects!");
    if (!window.confirm("Delete this defect?")) return;
    try {
      await axios.delete(`${BASE_URL}/defects/${id}`);
      handleFilterChange(filterInspectionId);
    } catch (err) {
      console.error("Error deleting defect:", err);
      alert("Error deleting defect. Please try again.");
    }
  };

  // Get inspection label
  const getInspectionLabel = (inspection) => {
    const product = products.find((p) => p.id === inspection.product_id);
    const date = inspection.inspection_date
      ? new Date(inspection.inspection_date).toLocaleDateString()
      : "Unknown Date";
    return `${product?.name || "Product"} - ${date} (${inspection.result || "N/A"})`;
  };

  // Get severity badge class
  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "low":
        return "badge-success";
      case "medium":
        return "badge-warning";
      case "high":
        return "badge-danger";
      default:
        return "badge-info";
    }
  };

  return (
    <div className="page-container">
      {/* --- Header --- */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-exclamation-triangle"></i> Defect Management
          </h1>
          <p>Track and manage quality defects found during inspections</p>
        </div>
      </div>

      {/* --- Filter Section --- */}
      <div className="form-card">
        <h3>
          <i className="fas fa-filter"></i> Filter Defects
        </h3>
        <div className="form-row">
          <div className="form-field">
            <label>Filter by Inspection</label>
            <select
              value={filterInspectionId}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="">All Inspections</option>
              {inspections.map((inspection) => (
                <option key={inspection.id} value={inspection.id}>
                  {getInspectionLabel(inspection)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --- Add Defect Form --- */}
      <div className="form-card">
        <h3>
          <i className="fas fa-bug"></i> Report New Defect
        </h3>
        <form onSubmit={addDefect} className="data-form">
          <div className="form-row">
            <div className="form-field">
              <label>Inspection *</label>
              <select
                value={newDefect.inspection_id}
                onChange={(e) =>
                  setNewDefect({ ...newDefect, inspection_id: e.target.value })
                }
                required
              >
                <option value="">Select Inspection</option>
                {inspections.map((inspection) => (
                  <option key={inspection.id} value={inspection.id}>
                    {getInspectionLabel(inspection)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Defect Type *</label>
              <input
                type="text"
                placeholder="e.g., Scratch, Dent"
                value={newDefect.defect_type}
                onChange={(e) =>
                  setNewDefect({ ...newDefect, defect_type: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Description *</label>
              <textarea
                placeholder="Detailed description..."
                value={newDefect.description}
                onChange={(e) =>
                  setNewDefect({ ...newDefect, description: e.target.value })
                }
                required
                rows="3"
              />
            </div>
            <div className="form-field">
              <label>Severity *</label>
              <select
                value={newDefect.severity}
                onChange={(e) =>
                  setNewDefect({ ...newDefect, severity: e.target.value })
                }
                required
              >
                <option value="">Select Severity</option>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-plus-circle"></i> Report Defect
          </button>
        </form>
      </div>

      {/* --- Edit Defect Form --- */}
      {editingId && (
        <div className="form-card edit-card">
          <h3>
            <i className="fas fa-edit"></i> Edit Defect
          </h3>
          <form onSubmit={updateDefect} className="data-form">
            <div className="form-row">
              <div className="form-field">
                <label>Inspection *</label>
                <select
                  value={editingData.inspection_id}
                  onChange={(e) =>
                    setEditingData({ ...editingData, inspection_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select Inspection</option>
                  {inspections.map((inspection) => (
                    <option key={inspection.id} value={inspection.id}>
                      {getInspectionLabel(inspection)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Defect Type *</label>
                <input
                  type="text"
                  value={editingData.defect_type}
                  onChange={(e) =>
                    setEditingData({ ...editingData, defect_type: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Description *</label>
                <textarea
                  value={editingData.description}
                  onChange={(e) =>
                    setEditingData({ ...editingData, description: e.target.value })
                  }
                  required
                  rows="3"
                />
              </div>
              <div className="form-field">
                <label>Severity *</label>
                <select
                  value={editingData.severity}
                  onChange={(e) =>
                    setEditingData({ ...editingData, severity: e.target.value })
                  }
                  required
                >
                  <option value="">Select Severity</option>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                <i className="fas fa-check"></i> Update
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Defects Table --- */}
      <div className="table-card">
        <h3>
          <i className="fas fa-list"></i> {filterInspectionId ? "Filtered Defects" : "All Defects"}{" "}
          {!loading && `(${defects.length})`}
          {loading && (
            <i className="fas fa-spinner fa-spin" style={{ marginLeft: 10, fontSize: 16 }}></i>
          )}
        </h3>
        {!isAdmin && (
          <div className="role-notice">
            <i className="fas fa-info-circle"></i>{" "}
            <span>You are viewing as <strong>Inspector</strong>. Only admins can edit or delete defects.</span>
          </div>
        )}
        <div className="table-responsive">
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: 48, color: "#667eea", marginBottom: 16 }}></i>
              <p style={{ color: "#64748b", margin: 0 }}>Loading defects...</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Inspection</th>
                  <th>Defect Type</th>
                  <th>Description</th>
                  <th>Severity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {defects.length > 0 ? (
                  defects.map((defect) => {
                    const inspection = inspections.find((i) => i.id === defect.inspection_id);
                    const product = products.find((p) => p.id === inspection?.product_id);
                    return (
                      <tr key={defect.id}>
                        <td>{defect.id}</td>
                        <td>
                          <div>
                            <strong>{product?.name || `Inspection #${defect.inspection_id}`}</strong>
                            <br />
                            <small className="text-muted">
                              {inspection?.inspection_date
                                ? new Date(inspection.inspection_date).toLocaleDateString()
                                : "N/A"}
                            </small>
                          </div>
                        </td>
                        <td>{defect.defect_type}</td>
                        <td className="notes-cell">{defect.description}</td>
                        <td>
                          <span className={`badge ${getSeverityClass(defect.severity)}`}>
                            {defect.severity?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {isAdmin ? (
                              <>
                                <button
                                  onClick={() => startEdit(defect)}
                                  className="btn btn-sm btn-warning"
                                >
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                                <button
                                  onClick={() => deleteDefect(defect.id)}
                                  className="btn btn-sm btn-danger"
                                >
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
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 40 }}>
                      <i className="fas fa-inbox" style={{ fontSize: 48, color: "#cbd5e1", marginBottom: 16 }}></i>
                      <p style={{ color: "#64748b", margin: 0 }}>
                        No defects found. {filterInspectionId ? "Try selecting a different inspection." : "Start by reporting a defect!"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
