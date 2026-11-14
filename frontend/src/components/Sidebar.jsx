
import { Link, NavLink } from "react-router-dom";

function Sidebar() {
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
        <Link to="/login" className="dashboard-nav-link">
          <span>⇥</span> Logout
        </Link>

        <div className="sidebar-user">
          <div className="sidebar-avatar">U</div>
          <div>
            <strong>Demo User</strong>
            <small>SkillSwap Member</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
