import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminState } from "../context/AdminState.jsx";
import { FiEdit2, FiKey, FiPlus, FiRefreshCcw, FiSave, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import LoadingOverlay from "../components/LoadingOverlay";
import Modal from "../components/Modal";
import { usersApi } from "../api";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  address: "",
  designation: "",
  role: "administrator",
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [passwordState, setPasswordState] = useState({ userId: "", password: "" });
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const location = useLocation();
  const navigate = useNavigate();
  const { authState } = useAdminState();
  const adminRoles = ["admin", "superadmin"];
  const isAdmin = adminRoles.includes(authState?.user?.role);
  const createInitRef = useRef(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [users.length, page]);

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedUsers = users.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    if (createInitRef.current) return;
    if (location.state?.openCreate) {
      setEditingId("");
      setShowCreate(true);
      setForm({ ...emptyForm, password: "" });
    }
    createInitRef.current = true;
  }, [location.state]);

  const startEdit = (user) => {
    setShowCreate(false);
    setEditingId(user._id);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      designation: user.designation || "",
      role: user.role || "administrator",
    });
  };

  const resetEdit = () => {
    setEditingId("");
    setForm(emptyForm);
  };

  const openCreate = () => {
    resetEdit();
    setShowCreate(true);
    setForm({ ...emptyForm, password: "" });
  };

  const closeCreate = () => {
    setShowCreate(false);
    setForm(emptyForm);
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!editingId) return;

    setLoading(true);
    try {
      await usersApi.update(editingId, form);
      toast.success("User updated");
      resetEdit();
      loadUsers();
    } catch (error) {
      toast.error(error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await usersApi.create(form);
      toast.success("User created");
      closeCreate();
      loadUsers();
    } catch (error) {
      toast.error(error.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const openPassword = (user) => {
    setPasswordState({ userId: user._id, password: "" });
  };

  const resetPassword = () => setPasswordState({ userId: "", password: "" });

  const submitPassword = async (event) => {
    event.preventDefault();
    if (!passwordState.userId) return;

    setLoading(true);
    try {
      await usersApi.updatePassword(passwordState.userId, {
        password: passwordState.password,
      });
      toast.success("Password updated");
      resetPassword();
    } catch (error) {
      toast.error(error.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Users</p>
          <h1>Team access</h1>
          <p className="subhead">Review admin accounts and manage access details.</p>
        </div>
        <button className="ghost" type="button" onClick={loadUsers} disabled={loading}>
          <span className="button-icon">
            <FiRefreshCcw aria-hidden />
          </span>
          Refresh
        </button>
      </div>

      <div className={loading ? "page-body is-loading" : "page-body"}>
        <div className="page-content">
          <div className="panel-stack">
            <div className="card">
              <div className="card-header">
                <div>
                  <h2>User list</h2>
                  <span className="muted">{users.length} total</span>
                </div>
                <button className="primary" type="button" onClick={openCreate} disabled={loading}>
                  <span className="button-icon">
                    <FiPlus aria-hidden />
                  </span>
                  Create user
                </button>
              </div>
              <div className="user-list">
                {paginatedUsers.map((user) => (
                  <article key={user._id} className="user-item">
                    <div>
                      <h3>
                        <span className="muted">Name: </span>
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="muted">
                        <span className="muted">Email: </span>
                        {user.email}
                      </p>
                      <p className="meta">
                        <span className="muted">Phone: </span>
                        {user.phoneNumber || "No phone"} ·{" "}
                        <span className="muted">Role: </span>
                        {user.role}
                      </p>
                    </div>
                    <div className="user-actions">
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => startEdit(user)}
                        disabled={loading}
                      >
                        <span className="button-icon">
                          <FiEdit2 aria-hidden />
                        </span>
                        Edit
                      </button>
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => openPassword(user)}
                        disabled={loading}
                      >
                        <span className="button-icon">
                          <FiKey aria-hidden />
                        </span>
                        Update password
                      </button>
                    </div>
                  </article>
                ))}
                {!users.length && <p className="muted">No users found.</p>}
              </div>
              {users.length > pageSize && (
                <div className="pagination">
                  <span className="muted">
                    Page {page} of {totalPages}
                  </span>
                  <div className="pagination-actions">
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={loading || page === 1}
                    >
                      Prev
                    </button>
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={loading || page === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Modal open={showCreate} title="Create user" onClose={closeCreate}>
              <span className="muted">Add a new admin account</span>
              <form className="form" onSubmit={submitCreate}>
                  <div className="user-form-grid">
                    <div className="field">
                      <label>First name</label>
                      <input
                        value={form.firstName}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, firstName: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Last name</label>
                      <input
                        value={form.lastName}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, lastName: event.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="user-form-grid">
                    <div className="field">
                      <label>Phone</label>
                      <input
                        value={form.phoneNumber}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Role</label>
                      <select
                        value={form.role}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, role: event.target.value }))
                        }
                      >
                        <option value="administrator">administrator</option>
                        <option value="admin">admin</option>
                        <option value="superadmin">superadmin</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      value={form.password || ""}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button className="primary" type="submit" disabled={loading}>
                      <span className="button-icon">
                        <FiPlus aria-hidden />
                      </span>
                      Create user
                    </button>
                    <button
                      className="ghost"
                      type="button"
                      onClick={closeCreate}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
              </form>
            </Modal>

            <Modal open={Boolean(editingId)} title="Edit user" onClose={resetEdit}>
              <span className="muted">Update profile details</span>
              <form className="form" onSubmit={submitEdit}>
                  <div className="user-form-grid">
                    <div className="field">
                      <label>First name</label>
                      <input
                        value={form.firstName}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, firstName: event.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Last name</label>
                      <input
                        value={form.lastName}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, lastName: event.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="user-form-grid">
                    <div className="field">
                      <label>Phone</label>
                      <input
                        value={form.phoneNumber}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
                        }
                      />
                    </div>
                    <div className="field">
                      <label>Role</label>
                      <select
                        value={form.role}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, role: event.target.value }))
                        }
                      >
                        <option value="administrator">administrator</option>
                        <option value="admin">admin</option>
                        <option value="superadmin">superadmin</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label>Designation</label>
                    <input
                      value={form.designation}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, designation: event.target.value }))
                      }
                    />
                  </div>
                  <div className="field">
                    <label>Address</label>
                    <input
                      value={form.address}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, address: event.target.value }))
                      }
                    />
                  </div>
                  <div className="form-actions">
                    <button className="primary" type="submit" disabled={loading}>
                      <span className="button-icon">
                        <FiSave aria-hidden />
                      </span>
                      Save changes
                    </button>
                    <button className="ghost" type="button" onClick={resetEdit} disabled={loading}>
                      Cancel
                    </button>
                  </div>
              </form>
            </Modal>

            <Modal open={Boolean(passwordState.userId)} title="Update password" onClose={resetPassword}>
              <span className="muted">Set a new password for this user</span>
              <form className="form" onSubmit={submitPassword}>
                  <div className="field">
                    <label>New password</label>
                    <input
                      type="password"
                      value={passwordState.password}
                      onChange={(event) =>
                        setPasswordState((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button className="primary" type="submit" disabled={loading}>
                      <span className="button-icon">
                        <FiKey aria-hidden />
                      </span>
                      Update password
                    </button>
                    <button className="ghost" type="button" onClick={resetPassword} disabled={loading}>
                      Cancel
                    </button>
                  </div>
              </form>
            </Modal>
          </div>
        </div>
        <LoadingOverlay active={loading} />
      </div>
    </section>
  );
};

export default UsersPage;
