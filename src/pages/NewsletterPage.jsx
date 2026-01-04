import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiRefreshCcw, FiTrash2 } from "react-icons/fi";
import { newsletterApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import Modal from "../components/Modal";
import { useAdminState } from "../context/AdminState.jsx";

const NewsletterPage = () => {
  const { newsletterState, setNewsletterState, authState } = useAdminState();
  const { subscriptions, form, showForm, editingId, page, pageSize, loading } =
    newsletterState;
  const [selectedDate, setSelectedDate] = useState("");
  const adminRoles = ["admin", "superadmin"];
  const isAdmin = adminRoles.includes(authState?.user?.role);

  const updateState = (updates) =>
    setNewsletterState((prev) => ({ ...prev, ...updates }));

  const loadSubscriptions = async () => {
    updateState({ loading: true });
    try {
      const data = await newsletterApi.list();
      updateState({ subscriptions: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const filteredSubscriptions = useMemo(() => {
    if (!selectedDate) return subscriptions;
    return subscriptions.filter((subscription) => {
      if (!subscription.createdAt) return false;
      const createdDate = new Date(subscription.createdAt).toISOString().slice(0, 10);
      return createdDate === selectedDate;
    });
  }, [subscriptions, selectedDate]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / pageSize));
    if (page > totalPages) {
      updateState({ page: totalPages });
    }
  }, [filteredSubscriptions.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedSubscriptions = filteredSubscriptions.slice(
    startIndex,
    startIndex + pageSize
  );

  const exportToCsv = () => {
    if (!filteredSubscriptions.length) {
      toast.info("No subscriptions to export.");
      return;
    }

    const escapeValue = (value) => {
      const text = value === null || value === undefined ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = [
      ["Email", "Subscribed At"],
      ...filteredSubscriptions.map((subscription) => [
        subscription.email,
        subscription.createdAt
          ? new Date(subscription.createdAt).toLocaleString()
          : "",
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-report-${selectedDate || "all"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setNewsletterState((prev) => ({
      ...prev,
      form: { email: "" },
      showForm: false,
      editingId: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateState({ loading: true });
    try {
      if (editingId) {
        await newsletterApi.update(editingId, { email: form.email });
        toast.success("Subscriber updated.");
      } else {
        await newsletterApi.create({ email: form.email });
        toast.success("Subscriber added.");
      }
      resetForm();
      loadSubscriptions();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error("Only admins can delete subscribers.");
      return;
    }
    updateState({ loading: true });
    try {
      await newsletterApi.remove(id);
      toast.success("Subscriber removed.");
      loadSubscriptions();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleEdit = (subscription) => {
    setNewsletterState((prev) => ({
      ...prev,
      form: { email: subscription.email || "" },
      showForm: true,
      editingId: subscription._id,
    }));
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Newsletter</p>
          <h1>Subscriber List</h1>
          <p className="subhead">Monitor new newsletter signups.</p>
        </div>
        <div className="form-actions">
          <button
            className="primary"
            type="button"
            onClick={() =>
              setNewsletterState((prev) => ({
                ...prev,
                showForm: true,
                editingId: "",
                form: { email: "" },
              }))
            }
            disabled={loading}
          >
            <span className="button-icon">
              <FiPlus aria-hidden />
            </span>
            Add subscriber
          </button>
          <button
            className="ghost"
            type="button"
            onClick={loadSubscriptions}
            disabled={loading}
          >
            <span className="button-icon">
              <FiRefreshCcw aria-hidden />
            </span>
            Refresh
          </button>
        </div>
      </div>

      <div className={loading ? "page-body is-loading" : "page-body"}>
        <div className="page-content">
          <Modal
            open={showForm}
            title={editingId ? "Edit subscriber" : "Add subscriber"}
            onClose={resetForm}
          >
            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setNewsletterState((prev) => ({
                        ...prev,
                        form: { email: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-actions">
                  <button className="primary" type="submit" disabled={loading}>
                    {editingId ? "Update subscriber" : "Add subscriber"}
                  </button>
                  <button className="ghost" type="button" onClick={resetForm} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
          </Modal>
          <div className="card list">
            <div className="card-header">
              <div>
                <h2>Subscriptions</h2>
                <span className="muted">{filteredSubscriptions.length} total</span>
              </div>
              <div className="filters">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    updateState({ page: 1 });
                  }}
                  disabled={loading}
                />
                <button className="ghost" type="button" onClick={exportToCsv} disabled={loading}>
                  Export Excel
                </button>
              </div>
            </div>
            <ul>
              {paginatedSubscriptions.map((subscription) => (
                <li key={subscription._id} className="list-item">
                  <div>
                    <h3>
                      <span className="muted">Email: </span>
                      {subscription.email}
                    </h3>
                    <p className="muted">
                      <span className="muted">Subscribed: </span>
                      {subscription.createdAt
                        ? new Date(subscription.createdAt).toLocaleString()
                        : "Pending timestamp"}
                    </p>
                  </div>
                  <div className="list-actions">
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => handleEdit(subscription)}
                      disabled={loading}
                    >
                      <span className="button-icon">
                        <FiEdit2 aria-hidden />
                      </span>
                      Edit
                    </button>
                    {isAdmin && (
                      <button
                        className="danger ghost"
                        type="button"
                        onClick={() => handleDelete(subscription._id)}
                        disabled={loading}
                      >
                        <span className="button-icon">
                          <FiTrash2 aria-hidden />
                        </span>
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
              {!filteredSubscriptions.length && <li>No subscribers yet.</li>}
            </ul>
            {filteredSubscriptions.length > pageSize && (
              <div className="pagination">
                <span className="muted">
                  Page {page} of {totalPages}
                </span>
                <div className="pagination-actions">
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => updateState({ page: Math.max(1, page - 1) })}
                    disabled={loading || page === 1}
                  >
                    Prev
                  </button>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => updateState({ page: Math.min(totalPages, page + 1) })}
                    disabled={loading || page === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <LoadingOverlay active={loading} />
      </div>
    </section>
  );
};

export default NewsletterPage;
