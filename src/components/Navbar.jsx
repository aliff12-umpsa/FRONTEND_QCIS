import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ padding: 10, background: "#eee" }}>
      <Link to="/dashboard">Dashboard</Link>{" | "}
      <Link to="/users">Users</Link>{" | "}
      <Link to="/products">Products</Link>{" | "}
      <Link to="/inspections">Inspections</Link>{" | "}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
