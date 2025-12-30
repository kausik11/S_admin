const Sidebar = ({ items, activeId, onSelect }) => (
  <aside className="sidebar">
    <div className="sidebar-brand">
      <span className="brand-pill">NIT</span>
      <div>
        <p>Admin Panel</p>
        <small>Operations</small>
      </div>
    </div>
    <nav className="sidebar-nav">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={activeId === item.id ? "nav-item active" : "nav-item"}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
