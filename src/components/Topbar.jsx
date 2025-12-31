import { FiBell, FiLogOut, FiMenu, FiMoon, FiSearch, FiSun } from "react-icons/fi";

const Topbar = ({ onMenuClick, onThemeToggle, theme, user, onLogout }) => (
  <header className="topbar">
    <button className="icon-button menu-button" type="button" onClick={onMenuClick}>
      <FiMenu aria-hidden />
    </button>
    <div className="topbar-search">
      <FiSearch aria-hidden />
      <input placeholder="Search content, services, users" />
    </div>
    <div className="topbar-actions">
      <button className="icon-button" type="button" aria-label="Theme" onClick={onThemeToggle}>
        {theme === "dark" ? <FiSun aria-hidden /> : <FiMoon aria-hidden />}
      </button>
      <button className="icon-button" type="button" aria-label="Notifications">
        <FiBell aria-hidden />
      </button>
      <div className="user-chip">
        <span className="user-avatar">
          {(user?.firstName || "A").slice(0, 1).toUpperCase()}
        </span>
        <div>
          <p>{user ? `${user.firstName} ${user.lastName}` : "Admin"}</p>
          <small>{user?.role || "admin"}</small>
        </div>
      </div>
      <button className="icon-button" type="button" aria-label="Logout" onClick={onLogout}>
        <FiLogOut aria-hidden />
      </button>
    </div>
  </header>
);

export default Topbar;
