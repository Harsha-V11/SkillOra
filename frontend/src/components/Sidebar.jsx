
import { Link, NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  // Get the currently logged-in user
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    user = {};
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <aside className="dashboard-sidebar">
      <Link to="/" className="dashboard-logo">
        <span className="dashboard-logo-icon">S</span>
        SkillSwap<span className="logo-dot">.</span>
      </Link>

      <nav className="dashboard-nav">
        <NavLink to="/dashboard" className={({ isActive }) =>
          `dashboard-nav-link ${isActive ? "active" : ""}`
        }>
          <span>⌂</span> Overview
        </NavLink>

        <NavLink to="/discover" className={({ isActive }) =>
          `dashboard-nav-link ${isActive ? "active" : ""}`
        }>
          <span>⌕</span> Discover People
        </NavLink>

        <NavLink to="/requests" className={({ isActive }) =>
          `dashboard-nav-link ${isActive ? "active" : ""}`
        }>
          <span>↗</span> My Requests
        </NavLink>

        <NavLink to="/sessions" className={({ isActive }) =>
          `dashboard-nav-link ${isActive ? "active" : ""}`
        }>
          <span>▦</span> My Sessions
        </NavLink>

        <NavLink to="/reviews" className={({ isActive }) =>
          `dashboard-nav-link ${isActive ? "active" : ""}`
        }>
          <span>★</span> Reviews & Ratings
        </NavLink>

        <NavLink to="/my-skills" className={({ isActive }) =>
          `dashboard-nav-link ${isActive ? "active" : ""}`
        }>
          <span>✦</span> My Skills
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) =>
          `dashboard-nav-link ${isActive ? "active" : ""}`
        }>
          <span>♟</span> My Profile
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) =>
          `dashboard-nav-link ${isActive ? "active" : ""}`
        }>
          <span>⚙</span> Settings
        </NavLink>
      </nav>

      <div className="dashboard-sidebar-bottom">
        <button
          type="button"
          className="dashboard-nav-link"
          onClick={handleLogout}
        >
          <span>⇥</span> Logout
        </button>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <strong>{user.name || "User"}</strong>
            <small>{user.email || "SkillSwap Member"}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
