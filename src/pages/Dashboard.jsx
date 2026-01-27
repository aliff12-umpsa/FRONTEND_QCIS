import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import LineChartComp from "./LineChartComp";
import "./Dashboard.css";

// Use environment variable for API URL
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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

  // Process inspections into chart data
  const processChartData = useCallback((inspections, filter) => {
    const now = new Date();
    let filteredInspections = inspections;

    if (filter === '7') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredInspections = inspections.filter(i => new Date(i.inspection_date) >= sevenDaysAgo);
    } else if (filter === '30') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredInspections = inspections.filter(i => new Date(i.inspection_date) >= thirtyDaysAgo);
    }

    const grouped = filteredInspections.reduce((acc, inspection) => {
      const date = new Date(inspection.inspection_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!acc[date]) acc[date] = { date, pass: 0, fail: 0 };
      inspection.result === 'pass' ? acc[date].pass++ : acc[date].fail++;
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const inspectionsRes = await axios.get(`${BASE_URL}/inspections`);
      const inspections = inspectionsRes.data || [];

      // Products and Users for activity display
      const [productsRes, usersRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/products`),
        axios.get(`${BASE_URL}/users`)
      ]);
      const products = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
      const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];

      // Fetch defects per inspection
      let allDefects = [];
      for (const insp of inspections) {
        try {
          const defectsRes = await axios.get(`${BASE_URL}/defects/${insp.id}`);
          if (Array.isArray(defectsRes.data)) allDefects.push(...defectsRes.data);
        } catch { /* skip */ }
      }

      setAllInspections(inspections);

      // Stats
      const passCount = inspections.filter(i => i.result === 'pass').length;
      const failCount = inspections.filter(i => i.result === 'fail').length;
      setStats({
        totalInspections: inspections.length,
        passCount,
        failCount,
        defectCount: allDefects.length
      });

      // Recent Activity
      const activities = [];
      const recentInspections = [...inspections]
        .sort((a,b) => new Date(b.inspection_date) - new Date(a.inspection_date))
        .slice(0,5);

      recentInspections.forEach(inspection => {
        const product = products.find(p => p.id === inspection.product_id);
        const inspector = users.find(u => u.id === inspection.inspector_id);
        const timeAgo = getTimeAgo(inspection.inspection_date);
        activities.push({
          icon: inspection.result==='pass' ? 'fa-check-circle' : 'fa-times-circle',
          iconColor: inspection.result==='pass' ? 'success' : 'danger',
          text: `${inspection.result==='pass' ? 'Inspection passed' : 'Inspection failed'} for ${product?.name || 'Product #' + inspection.product_id}`,
          subtext: `By ${inspector?.name || 'Inspector'}`,
          time: timeAgo
        });
      });

      // Add recent defects
      if (allDefects.length > 0) {
        [...allDefects].sort((a,b)=>b.id - a.id).slice(0,2).forEach(defect=>{
          activities.push({
            icon: 'fa-bug',
            iconColor: 'warning',
            text: `Defect reported: ${defect.defect_type}`,
            subtext: `Severity: ${defect.severity}`,
            time: getTimeAgo(new Date())
          });
        });
      }

      setRecentActivity(activities.slice(0,5));
      setDefectData(processChartData(inspections, timeFilter));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [timeFilter, processChartData]);

  const getTimeAgo = (date) => {
    const now = new Date(), past = new Date(date);
    const diffMs = now - past, diffMins = Math.floor(diffMs/60000), diffHours = Math.floor(diffMs/3600000), diffDays = Math.floor(diffMs/86400000);
    if(diffMins<1) return 'Just now';
    if(diffMins<60) return `${diffMins} minute${diffMins>1?'s':''} ago`;
    if(diffHours<24) return `${diffHours} hour${diffHours>1?'s':''} ago`;
    if(diffDays===1) return 'Yesterday';
    if(diffDays<7) return `${diffDays} days ago`;
    return past.toLocaleDateString();
  };

  useEffect(()=>{ fetchDashboardData(); },[fetchDashboardData]);
  useEffect(()=>{
    if(allInspections.length>0){
      setDefectData(processChartData(allInspections,timeFilter));
    }
  },[timeFilter,allInspections,processChartData]);

  useEffect(()=>{
    const onFocus = ()=>fetchDashboardData();
    window.addEventListener('focus',onFocus);
    return ()=>window.removeEventListener('focus',onFocus);
  },[fetchDashboardData]);

  const passRate = stats.totalInspections>0 ? ((stats.passCount/stats.totalInspections)*100).toFixed(1) : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header-row">
        <h2>Quality Control Dashboard</h2>
        <button className="refresh-btn" onClick={fetchDashboardData} disabled={loading}>
          <i className={`fas fa-sync-alt ${loading?'fa-spin':''}`}></i> {loading?'Refreshing...':'Refresh Data'}
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-header"><div className="stat-content"><h3>Total Inspections</h3><p className="stat-value">{stats.totalInspections}</p></div><div className="stat-icon"><i className="fas fa-clipboard-list"></i></div></div><div className="stat-change positive"><i className="fas fa-arrow-up"></i><span>All time</span></div></div>
        <div className="stat-card success"><div className="stat-header"><div className="stat-content"><h3>Passed</h3><p className="stat-value">{stats.passCount}</p></div><div className="stat-icon"><i className="fas fa-check-circle"></i></div></div><div className="stat-change positive"><i className="fas fa-percentage"></i><span>{passRate}% pass rate</span></div></div>
        <div className="stat-card danger"><div className="stat-header"><div className="stat-content"><h3>Failed</h3><p className="stat-value">{stats.failCount}</p></div><div className="stat-icon"><i className="fas fa-times-circle"></i></div></div><div className="stat-change negative"><i className="fas fa-exclamation-triangle"></i><span>Requires attention</span></div></div>
        <div className="stat-card warning"><div className="stat-header"><div className="stat-content"><h3>Total Defects</h3><p className="stat-value">{stats.defectCount}</p></div><div className="stat-icon"><i className="fas fa-bug"></i></div></div><div className="stat-change"><i className="fas fa-chart-line"></i><span>Tracked issues</span></div></div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h3><i className="fas fa-chart-line"></i> Inspection Trends</h3>
          <div className="chart-filters">
            <button className={`filter-btn ${timeFilter==='7'?'active':''}`} onClick={()=>setTimeFilter('7')}>7 Days</button>
            <button className={`filter-btn ${timeFilter==='30'?'active':''}`} onClick={()=>setTimeFilter('30')}>30 Days</button>
            <button className={`filter-btn ${timeFilter==='all'?'active':''}`} onClick={()=>setTimeFilter('all')}>All Time</button>
          </div>
        </div>
        <div className="chart-wrapper">
          {defectData.length>0 ? <LineChartComp data={defectData}/> : <div className="no-data"><i className="fas fa-chart-line"></i><p>No inspection data available for this period</p></div>}
        </div>
      </div>

      <div className="recent-activity">
        <h3><i className="fas fa-history"></i> Recent Activity</h3>
        {recentActivity.length>0 ? (
          <ul className="activity-list">
            {recentActivity.map((act,i)=>(
              <li key={i} className="activity-item">
                <div className={`activity-icon icon-${act.iconColor}`}><i className={`fas ${act.icon}`}></i></div>
                <div className="activity-content"><p>{act.text}</p>{act.subtext && <span className="activity-subtext">{act.subtext}</span>}<span className="activity-time">{act.time}</span></div>
              </li>
            ))}
          </ul>
        ) : <div className="no-data"><i className="fas fa-inbox"></i><p>No recent activity. Start by adding inspections!</p></div>}
      </div>
    </div>
  );
};

export default Dashboard;
