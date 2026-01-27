import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DataPages.css";

const BASE_URL = "http://localhost:5000/api";

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

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

  // Filter state
  const [filterInspectionId, setFilterInspectionId] = useState("");

  const isAdmin = userRole === 'admin';

  // Load inspections and all defects on page load
  useEffect(() => {
    const loadData = async () => {
      await fetchInspections();
      await fetchProducts();
      // fetchAllDefects will be called after inspections are loaded
    };
    loadData();
  }, []);

  // Fetch all defects after inspections are loaded
  useEffect(() => {
    if (inspections.length > 0) {
      fetchAllDefects();
    } else {
      setLoading(false);
    }
  }, [inspections]);

  // Fetch all defects (workaround - loops through inspections)
  const fetchAllDefects = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching all defects...");
      
      // Try direct endpoint first
      try {
        const res = await axios.get(`${BASE_URL}/defects`);
        console.log("✅ Fetched defects directly:", res.data.length);
        setDefects(res.data);
        setLoading(false);
        return;
      } catch (directErr) {
        console.log("⚠️ No GET /api/defects endpoint, using workaround...");
      }

      // Fallback: Get defects from each inspection
      if (inspections.length === 0) {
        console.log("⚠️ No inspections loaded yet");
        setDefects([]);
        setLoading(false);
        return;
      }

      const allDefectsMap = new Map(); // Use Map to avoid duplicates
      
      for (const inspection of inspections) {
        try {
          const res = await axios.get(`${BASE_URL}/defects/${inspection.id}`);
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(defect => {
              allDefectsMap.set(defect.id, defect);
            });
          }
        } catch (e) {
          // No defects for this inspection, continue
        }
      }

      const allDefectsArray = Array.from(allDefectsMap.values());
      console.log("✅ Fetched defects from inspections:", allDefectsArray.length);
      setDefects(allDefectsArray);
      
    } catch (err) {
      console.error("❌ Error fetching all defects:", err);
      setDefects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch defects by inspection ID
  const fetchDefectsByInspection = async (inspectionId) => {
    try {
      const res = await axios.get(`${BASE_URL}/defects/${inspectionId}`);
      setDefects(res.data);
    } catch (err) {
      console.error("Error fetching defects:", err);
    }
  };

  // Fetch inspections list
  const fetchInspections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/inspections`);
      setInspections(res.data);
    } catch (err) {
      console.error("Error fetching inspections:", err);
    }
  };

  // Fetch products for display
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Add new defect
  const addDefect = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${BASE_URL}/defects`, newDefect);

      // Refresh based on selected inspection
      if (filterInspectionId === "") {
        fetchAllDefects();
      } else {
        fetchDefectsByInspection(filterInspectionId);
      }

      // Reset form
      setNewDefect({
        inspection_id: "",
        defect_type: "",
        description: "",
        severity: "",
      });
    } catch (err) {
      console.error("Error adding defect:", err);
      alert("Error adding defect. Please try again.");
    }
  };

  // Start editing
  const startEdit = (defect) => {
    if (!isAdmin) {
      alert("Only admins can edit defects!");
      return;
    }

    setEditingId(defect.id);
    setEditingData({
      inspection_id: defect.inspection_id,
      defect_type: defect.defect_type,
      description: defect.description,
      severity: defect.severity,
    });
  };

  // Update defect
  const updateDefect = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${BASE_URL}/defects/${editingId}`, editingData);
      setEditingId(null);
      setEditingData({});

      // Refresh list
      if (filterInspectionId === "") {
        fetchAllDefects();
      } else {
        fetchDefectsByInspection(filterInspectionId);
      }
    } catch (err) {
      console.error("Error updating defect:", err);
      alert("Error updating defect. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  // Delete a defect
  const deleteDefect = async (id) => {
    if (!isAdmin) {
      alert("Only admins can delete defects!");
      return;
    }

    if (!window.confirm("Delete this defect?")) return;

    try {
      await axios.delete(`${BASE_URL}/defects/${id}`);

      // Refresh list depending on selection
      if (filterInspectionId === "") {
        fetchAllDefects();
      } else {
        fetchDefectsByInspection(filterInspectionId);
      }
    } catch (err) {
      console.error("Error deleting defect:", err);
      alert("Error deleting defect. Please try again.");
    }
  };

  // Handle filter change
  const handleFilterChange = async (id) => {
    setFilterInspectionId(id);
    setLoading(true);
    
    if (id === "") {
      await fetchAllDefects();
    } else {
      await fetchDefectsByInspection(id);
    }
    
    setLoading(false);
  };

  // Get product name for inspection
  const getInspectionLabel = (inspection) => {
    const product = products.find(p => p.id === inspection.product_id);
    const date = new Date(inspection.inspection_date).toLocaleDateString();
    return `${product?.name || 'Product'} - ${date} (${inspection.result})`;
  };

  // Get severity badge class
  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'high': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-exclamation-triangle"></i>
            Defect Management
          </h1>
          <p>Track and manage quality defects found during inspections</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="form-card">
        <h3>
          <i className="fas fa-filter"></i>
          Filter Defects
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

      {/* Add Defect Form */}
      <div className="form-card">
        <h3>
          <i className="fas fa-bug"></i>
          Report New Defect
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
                placeholder="e.g., Scratch, Dent, Misalignment"
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
                placeholder="Detailed description of the defect..."
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
            <i className="fas fa-plus-circle"></i>
            Report Defect
          </button>
        </form>
      </div>

      {/* Edit Defect Form */}
      {editingId && (
        <div className="form-card edit-card">
          <h3>
            <i className="fas fa-edit"></i>
            Edit Defect
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
                  placeholder="Defect Type"
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
                  placeholder="Description"
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

      {/* Defects Table */}
      <div className="table-card">
        <h3>
          <i className="fas fa-list"></i>
          {filterInspectionId ? 'Filtered Defects' : 'All Defects'} 
          {!loading && `(${defects.length})`}
          {loading && <i className="fas fa-spinner fa-spin" style={{ marginLeft: '10px', fontSize: '16px' }}></i>}
        </h3>
        {!isAdmin && (
          <div className="role-notice">
            <i className="fas fa-info-circle"></i>
            <span>You are viewing as <strong>Inspector</strong>. Only admins can edit or delete defects.</span>
          </div>
        )}
        <div className="table-responsive">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#667eea', marginBottom: '16px' }}></i>
              <p style={{ color: '#64748b', margin: 0 }}>Loading defects...</p>
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
                  const inspection = inspections.find(i => i.id === defect.inspection_id);
                  const product = products.find(p => p.id === inspection?.product_id);
                  
                  return (
                    <tr key={defect.id}>
                      <td>{defect.id}</td>
                      <td>
                        <div>
                          <strong>{product?.name || `Inspection #${defect.inspection_id}`}</strong>
                          <br />
                          <small className="text-muted">
                            {inspection?.inspection_date && 
                              new Date(inspection.inspection_date).toLocaleDateString()}
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                    <p style={{ color: '#64748b', margin: 0 }}>
                      No defects found. {filterInspectionId ? 'Try selecting a different inspection.' : 'Start by reporting a defect!'}
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