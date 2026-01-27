import React, { useEffect, useState } from "react";
import api from "../api"; // use centralized API
import "./DataPages.css";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("inspector");

  // Edit state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [editingPassword, setEditingPassword] = useState("");
  const [editingRole, setEditingRole] = useState("");

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    }
  };

  // Add user
  const addUser = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", { name, email, password, role });
      setName(""); setEmail(""); setPassword(""); setRole("inspector");
      fetchUsers();
    } catch (err) {
      console.error("❌ Error adding user:", err);
      alert("Error adding user. Please try again.");
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      alert("Error deleting user. Please try again.");
    }
  };

  // Start edit
  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditingName(user.name);
    setEditingEmail(user.email);
    setEditingPassword("");
    setEditingRole(user.role || "inspector");
  };

  // Update user
  const updateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editingUserId}`, {
        name: editingName,
        email: editingEmail,
        password: editingPassword,
        role: editingRole,
      });
      cancelEdit();
      fetchUsers();
    } catch (err) {
      console.error("❌ Error updating user:", err);
      alert("Error updating user. Please try again.");
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingUserId(null);
    setEditingName(""); setEditingEmail(""); setEditingPassword(""); setEditingRole("");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1><i className="fas fa-users"></i> User Management</h1>
          <p>Manage system users and their roles</p>
        </div>
      </div>

      {/* Add User Form */}
      <div className="form-card">
        <h3><i className="fas fa-user-plus"></i> Add New User</h3>
        <form onSubmit={addUser} className="data-form">
          <div className="form-row">
            <div className="form-field">
              <label>Name *</label>
              <input
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Email *</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Password *</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Role *</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="inspector">Inspector</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-plus-circle"></i> Add User
          </button>
        </form>
      </div>

      {/* Edit User Form */}
      {editingUserId && (
        <div className="form-card edit-card">
          <h3><i className="fas fa-edit"></i> Edit User</h3>
          <form onSubmit={updateUser} className="data-form">
            <div className="form-row">
              <div className="form-field">
                <label>Name *</label>
                <input
                  placeholder="Name"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={editingEmail}
                  onChange={(e) => setEditingEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Password (leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="New password"
                  value={editingPassword}
                  onChange={(e) => setEditingPassword(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Role *</label>
                <select value={editingRole} onChange={(e) => setEditingRole(e.target.value)} required>
                  <option value="inspector">Inspector</option>
                  <option value="admin">Admin</option>
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

      {/* User Table */}
      <div className="table-card">
        <h3><i className="fas fa-list"></i> All Users ({users.length})</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role === 'admin' ? 'danger' : 'info'}`}>
                      {u.role || 'inspector'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => startEdit(u)} className="btn btn-sm btn-warning">
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="btn btn-sm btn-danger">
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
