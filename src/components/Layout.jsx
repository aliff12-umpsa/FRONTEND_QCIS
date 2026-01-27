import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Layout.css";

export default function Layout({ userRole, onLogout }) {
  return (
    <div className="layout-container">
      <Sidebar userRole={userRole} onLogout={onLogout} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}