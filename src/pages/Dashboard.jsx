// src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import LineChartComp from "./LineChartComp";
import "./Dashboard.css";

const BASE_URL = "http://localhost:5000/api";

const Dashboard = () => {
  const [defectData, setDefectData] = useState([]);
  const [allInspections, setAllInspections] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalInspections: 0,
    passCount: 0,
    failCount: 0,
    defectCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  // Process inspections into chart data with time filter
  const processChartData = useCallback((inspections, filter) => {
    const now = new Date();
    let filteredInspections = inspections;

    // Filter by time period
    if (filter === '7') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredInspections = inspections.filter(i => 
        new Date(i.inspection_date) >= sevenDaysAgo
      );
    } else if (filter === '30') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredInspections = inspections.filter(i => 
        new Date(i.inspection_date) >= thirtyDaysAgo
      );
    }

    // Group inspections by date
    const grouped = filteredInspections.reduce((acc, inspection) => {
      const date = new Date(inspection.inspection_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      if (!acc[date]) {
        acc[date] = { date, pass: 0, fail: 0 };
      }
      
      if (inspection.result === 'pass') {
        acc[date].pass += 1;
      } else {
        acc[date].fail += 1;
      }
      
      return acc;
    }, {});

    // Convert to array and sort by date
    const dataArray = Object.values(grouped).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Limit to last 10 data points for better readability
    return dataArray.slice(-10);
  }, []);

  // Fetch dashboard data function - defined with useCallback
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📊 Fetching dashboard data...");

      // Fetch inspections
      const inspectionsRes = await axios.get(`${BASE_URL}/inspections`);
      const inspections = inspectionsRes.data || [];
      console.log("✅ Inspections fetched:", inspections.length);

      // Fetch products for activity names
      let products = [];
      try {
        const productsRes = await axios.get(`${BASE_URL}/products`);
        products = productsRes.data || [];
      } catch (err) {
        console.log("⚠️ Could not fetch products");
      }

      // Fetch users for inspector names
      let users = [];
      try {
        const usersRes = await axios.get(`${BASE_URL}/users`);
        users = usersRes.data || [];
      } catch (err) {
        console.log("⚠️ Could not fetch users");
      }

      // Fetch all defects by looping through inspections
      let allDefects = [];
      console.log("🔍 Fetching defects for all inspections...");
      
      for (const inspection of inspections) {
        try {
          const defectsRes = await axios.get(`${BASE_URL}/defects/${inspection.id}`);
          if (defectsRes.data && Array.isArray(defectsRes.data)) {
            allDefects = [...allDefects, ...defectsRes.data];
          }
        } catch (err) {
          // No defects for this inspection, continue
        }
      }
      
      console.log("✅ Total defects found:", allDefects.length);

      // Store all inspections for filtering
      setAllInspections(inspections);

      // Calculate stats
      const passCount = inspections.filter(i => i.result === 'pass').length;
      const failCount = inspections.filter(i => i.result === 'fail').length;

      const newStats = {
        totalInspections: inspections.length,
        passCount: passCount,
        failCount: failCount,
        defectCount: allDefects.length
      };

      console.log("📊 Stats calculated:", newStats);
      setStats(newStats);

      // Generate Recent Activity from real data
      const activities = [];
      
      // Get last 5 inspections sorted by date
      const recentInspections = [...inspections]
        .sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date))
        .slice(0, 5);

      recentInspections.forEach(inspection => {
        const product = products.find(p => p.id === inspection.product_id);
        const inspector = users.find(u => u.id === inspection.inspector_id);
        const timeAgo = getTimeAgo(inspection.inspection_date);

        if (inspection.result === 'pass') {
          activities.push({
            icon: 'fa-check-circle',
            iconColor: 'success',
            text: `Inspection passed for ${product?.name || 'Product #' + inspection.product_id}`,
            subtext: `By ${inspector?.name || 'Inspector'}`,
            time: timeAgo
          });
        } else {
          activities.push({
            icon: 'fa-times-circle',
            iconColor: 'danger',
            text: `Inspection failed for ${product?.name || 'Product #' + inspection.product_id}`,
            subtext: `By ${inspector?.name || 'Inspector'}`,
            time: timeAgo
          });
        }
      });

      // Add defect activities if available
      if (allDefects.length > 0) {
        const recentDefects = [...allDefects]
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 2);

        recentDefects.forEach(defect => {
          const timeAgo = getTimeAgo(new Date());
          activities.push({
            icon: 'fa-bug',
            iconColor: 'warning',
            text: `Defect reported: ${defect.defect_type}`,
            subtext: `Severity: ${defect.severity}`,
            time: timeAgo
          });
        });
      }

      // Sort all activities by most recent
      setRecentActivity(activities.slice(0, 5));

      // Initial chart data
      const formattedData = processChartData(inspections, timeFilter);
      setDefectData(formattedData);

    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      if (error.response) {
        console.error("Error response:", error.response.status, error.response.data);
      }
    } finally {
      setLoading(false);
    }
  }, [timeFilter, processChartData]);

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return past.toLocaleDateString();
  };

  // Fetch on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Update chart when filter changes
  useEffect(() => {
    if (allInspections.length > 0) {
      const formattedData = processChartData(allInspections, timeFilter);
      setDefectData(formattedData);
    }
  }, [timeFilter, allInspections, processChartData]);

  // Re-fetch when window gets focus
  useEffect(() => {
    const handleFocus = () => {
      console.log("👀 Window focused - refreshing data...");
      fetchDashboardData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchDashboardData]);

  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
  };

  const passRate = stats.totalInspections > 0 
    ? ((stats.passCount / stats.totalInspections) * 100).toFixed(1)
    : 0;

  if (loading && stats.totalInspections === 0) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header-row">
        <h2>Quality Control Dashboard</h2>
        <button 
          className="refresh-btn" 
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Total Inspections</h3>
              <p className="stat-value">{stats.totalInspections}</p>
            </div>
            <div className="stat-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
          </div>
          <div className="stat-change positive">
            <i className="fas fa-arrow-up"></i>
            <span>All time</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Passed</h3>
              <p className="stat-value">{stats.passCount}</p>
            </div>
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <div className="stat-change positive">
            <i className="fas fa-percentage"></i>
            <span>{passRate}% pass rate</span>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Failed</h3>
              <p className="stat-value">{stats.failCount}</p>
            </div>
            <div className="stat-icon">
              <i className="fas fa-times-circle"></i>
            </div>
          </div>
          <div className="stat-change negative">
            <i className="fas fa-exclamation-triangle"></i>
            <span>Requires attention</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Total Defects</h3>
              <p className="stat-value">{stats.defectCount}</p>
            </div>
            <div className="stat-icon">
              <i className="fas fa-bug"></i>
            </div>
          </div>
          <div className="stat-change">
            <i className="fas fa-chart-line"></i>
            <span>Tracked issues</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-container">
        <div className="chart-header">
          <h3>
            <i className="fas fa-chart-line"></i>
            Inspection Trends
          </h3>
          <div className="chart-filters">
            <button 
              className={`filter-btn ${timeFilter === '7' ? 'active' : ''}`}
              onClick={() => handleFilterChange('7')}
            >
              7 Days
            </button>
            <button 
              className={`filter-btn ${timeFilter === '30' ? 'active' : ''}`}
              onClick={() => handleFilterChange('30')}
            >
              30 Days
            </button>
            <button 
              className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All Time
            </button>
          </div>
        </div>
        
        <div className="chart-wrapper">
          {defectData.length > 0 ? (
            <LineChartComp data={defectData} />
          ) : (
            <div className="no-data">
              <i className="fas fa-chart-line"></i>
              <p>No inspection data available for this period</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>
          <i className="fas fa-history"></i>
          Recent Activity
        </h3>
        {recentActivity.length > 0 ? (
          <ul className="activity-list">
            {recentActivity.map((activity, index) => (
              <li key={index} className="activity-item">
                <div className={`activity-icon icon-${activity.iconColor}`}>
                  <i className={`fas ${activity.icon}`}></i>
                </div>
                <div className="activity-content">
                  <p>{activity.text}</p>
                  {activity.subtext && (
                    <span className="activity-subtext">{activity.subtext}</span>
                  )}
                  <span className="activity-time">{activity.time}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-data">
            <i className="fas fa-inbox"></i>
            <p>No recent activity. Start by adding inspections!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <a href="/app/inspections" className="quick-action-btn">
          <i className="fas fa-plus-circle"></i>
          <span>New Inspection</span>
        </a>
        <a href="/app/defects" className="quick-action-btn">
          <i className="fas fa-bug"></i>
          <span>Report Defect</span>
        </a>
        <a href="/app/products" className="quick-action-btn">
          <i className="fas fa-box"></i>
          <span>View Products</span>
        </a>
        <button onClick={fetchDashboardData} className="quick-action-btn">
          <i className="fas fa-sync-alt"></i>
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;