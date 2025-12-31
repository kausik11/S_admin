import { useNavigate } from "react-router-dom";
import { useAdminState } from "../context/AdminState.jsx";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { authState } = useAdminState();
  const adminRoles = ["admin", "superadmin"];
  const isAdmin = adminRoles.includes(authState?.user?.role);

  return (
    <section className="page dashboard">
      <div className="page-header dashboard-hero">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Admin Dashboard</h1>
          <p className="subhead">
            Track platform health, content output, and service performance.
          </p>
          {isAdmin && (
            <div className="hero-actions">
              <button
                className="primary"
                type="button"
                onClick={() => navigate("/users", { state: { openCreate: true } })}
              >
                Create user
              </button>
              <button className="ghost" type="button" onClick={() => navigate("/users")}>
                Manage users
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
