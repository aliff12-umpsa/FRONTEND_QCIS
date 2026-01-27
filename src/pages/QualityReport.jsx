// src/pages/QualityReport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataPages.css';

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const QualityReport = ({ userRole }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  
  const isAdmin = userRole === 'admin';
  
  const [formData, setFormData] = useState({
    report_date: '',
    total_inspections: 0,
    pass_count: 0,
    fail_count: 0,
    defect_summary: ''
  });

  // Fetch all reports
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/reports`);
      setReports(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching quality reports", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_inspections' || name === 'pass_count' || name === 'fail_count' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  // Create new report
  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/reports`, formData);
      setFormData({
        report_date: '',
        total_inspections: 0,
        pass_count: 0,
        fail_count: 0,
        defect_summary: ''
      });
      fetchReports();
    } catch (err) {
      setError(err.message);
      alert("Error creating report. Please try again.");
    }
  };

  // Edit report
  const handleEditClick = (report) => {
    if (!isAdmin) {
      alert("Only admins can edit reports!");
      return;
    }
    
    setEditingReport(report);
    setFormData({
      report_date: report.report_date.split('T')[0],
      total_inspections: report.total_inspections,
      pass_count: report.pass_count,
      fail_count: report.fail_count,
      defect_summary: report.defect_summary || ''
    });
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/reports/${editingReport.id}`, formData);
      setEditingReport(null);
      setFormData({
        report_date: '',
        total_inspections: 0,
        pass_count: 0,
        fail_count: 0,
        defect_summary: ''
      });
      fetchReports();
    } catch (err) {
      setError(err.message);
      alert("Error updating report. Please try again.");
    }
  };

  const handleDeleteReport = async (id) => {
    if (!isAdmin) {
      alert("Only admins can delete reports!");
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await axios.delete(`${BASE_URL}/reports/${id}`);
      fetchReports();
    } catch (err) {
      setError(err.message);
      alert("Error deleting report. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditingReport(null);
    setFormData({
      report_date: '',
      total_inspections: 0,
      pass_count: 0,
      fail_count: 0,
      defect_summary: ''
    });
  };

  const calculatePassRate = (pass, total) => {
    if (total === 0) return 0;
    return ((pass / total) * 100).toFixed(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading quality reports...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-file-alt"></i>
            Quality Reports
          </h1>
          <p>Overview of inspection results and quality metrics</p>
        </div>
      </div>

      {error && (
        <div style={{ 
          background: '#fee2e2', 
          border: '1px solid #fc8181',
          color: '#991b1b', 
          padding: '16px', 
          borderRadius: '10px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Create / Edit Form */}
      <div className="form-card">
        <h3>
          <i className={`fas fa-${editingReport ? 'edit' : 'plus-circle'}`}></i>
          {editingReport ? 'Edit Report' : 'Generate New Report'}
        </h3>
        
        <form onSubmit={editingReport ? handleUpdateReport : handleCreateReport} className="data-form">
          <div className="form-row">
            <div className="form-field">
              <label>Report Date *</label>
              <input
                type="date"
                name="report_date"
                value={formData.report_date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-field">
              <label>Total Inspections *</label>
              <input
                type="number"
                name="total_inspections"
                value={formData.total_inspections}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Pass Count *</label>
              <input
                type="number"
                name="pass_count"
                value={formData.pass_count}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Fail Count *</label>
              <input
                type="number"
                name="fail_count"
                value={formData.fail_count}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Defect Summary</label>
            <textarea
              name="defect_summary"
              value={formData.defect_summary}
              onChange={handleInputChange}
              rows="3"
              placeholder="Key defects observed, trends, recommendations..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <i className={`fas fa-${editingReport ? 'check' : 'plus-circle'}`}></i>
              {editingReport ? 'Update Report' : 'Create Report'}
            </button>
            
            {editingReport && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={cancelEdit}
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Reports Table */}
      <div className="table-card">
        <h3>
          <i className="fas fa-list"></i>
          Quality Report History ({reports.length})
        </h3>

        {!isAdmin && (
          <div className="role-notice">
            <i className="fas fa-info-circle"></i>
            <span>You are viewing as <strong>Inspector</strong>. Only admins can edit or delete reports.</span>
          </div>
        )}
        
        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <i className="fas fa-chart-bar" style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '16px' }}></i>
            <p style={{ marginTop: '16px', color: '#64748b', margin: 0 }}>
              No quality reports found yet.
              {isAdmin ? ' Create your first report above.' : ''}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Total Inspections</th>
                  <th>Pass</th>
                  <th>Fail</th>
                  <th>Pass Rate</th>
                  <th>Defect Summary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>{formatDate(report.report_date)}</td>
                    <td>{report.total_inspections}</td>
                    <td>
                      <span className="badge badge-success">
                        {report.pass_count}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-danger">
                        {report.fail_count}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: '#667eea' }}>
                      {calculatePassRate(report.pass_count, report.total_inspections)}%
                    </td>
                    <td className="notes-cell">{report.defect_summary || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => handleEditClick(report)}
                              className="btn btn-sm btn-warning"
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report.id)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityReport;