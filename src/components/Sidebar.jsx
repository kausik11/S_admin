import { NavLink } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

const Sidebar = ({ items, collapsed, onToggle, mobileOpen, onMobileClose }) => (
  <>
    <aside className={collapsed ? "sidebar is-collapsed" : "sidebar"}>
      <div className="sidebar-brand">
        <span className="brand-pill">NIT</span>
        <div className="brand-text">
          <p>Admin Panel</p>
          <small>Operations</small>
        </div>
        <button className="sidebar-toggle" type="button" onClick={onToggle}>
          {collapsed ? <FiChevronRight aria-hidden /> : <FiChevronLeft aria-hidden />}
        </button>
        <button className="sidebar-close" type="button" onClick={onMobileClose}>
          <FiX aria-hidden />
        </button>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              end
              onClick={onMobileClose}
            >
              {Icon && (
                <span className="nav-icon">
                  <Icon aria-hidden />
                </span>
              )}
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
    {mobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}
  </>
);

export default Sidebar;
