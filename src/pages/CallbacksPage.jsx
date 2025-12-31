import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FiCheckCircle,
  FiDownload,
  FiEdit2,
  FiPlus,
  FiRefreshCcw,
  FiTrash2,
} from "react-icons/fi";
import { callbacksApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import Modal from "../components/Modal";
import { initialCallbackForm, useAdminState } from "../context/AdminState.jsx";

const LOCATION_OPTIONS = ["kolkata", "howrah", "bardhaman"];

const CallbackItem = ({ callback, onUpdate, onEdit, onDelete, disabled }) => {
  const { callbacksState, setCallbacksState } = useAdminState();
  const current = callbacksState.editStates[callback._id] || {
    status: callback.status,
    adminComment: callback.adminComment || "",
  };

  const updateEditState = (updates) => {
    setCallbacksState((prev) => ({
      ...prev,
      editStates: {
        ...prev.editStates,
        [callback._id]: { ...current, ...updates },
      },
    }));
  };

  return (
    <article className="callback-card">
      {callback.imageUrl && (
        <img src={callback.imageUrl} alt={callback.fullName} className="callback-cover" />
      )}
      <div className="callback-body">
        <h3>{callback.fullName}</h3>
        <p className="muted">
          {callback.phoneNumber} - {callback.email}
        </p>
        <p className="meta">
          {callback.location} - {callback.status}
        </p>
        {callback.description && <p>{callback.description}</p>}
      </div>
      <div className="callback-actions">
        <label>
          Status
          <select
            value={current.status}
            onChange={(event) => updateEditState({ status: event.target.value })}
            disabled={disabled}
          >
            <option value="pending">pending</option>
            <option value="not received">not received</option>
            <option value="done">done</option>
          </select>
        </label>
        <label>
          Admin comment
          <input
            value={current.adminComment}
            onChange={(event) => updateEditState({ adminComment: event.target.value })}
            disabled={disabled}
          />
        </label>
        <button
          className="primary"
          type="button"
          onClick={() => onUpdate(callback._id, current.status, current.adminComment)}
          disabled={disabled}
        >
          <span className="button-icon">
            <FiCheckCircle aria-hidden />
          </span>
          Update status
        </button>
        <div className="action-row">
          <button
            className="ghost"
            type="button"
            onClick={() => onEdit(callback)}
            disabled={disabled}
          >
            <span className="button-icon">
              <FiEdit2 aria-hidden />
            </span>
            Edit
          </button>
          <button
            className="danger ghost"
            type="button"
            onClick={() => onDelete(callback._id)}
            disabled={disabled}
          >
            <span className="button-icon">
              <FiTrash2 aria-hidden />
            </span>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

const CallbacksPage = () => {
  const { callbacksState, setCallbacksState } = useAdminState();
  const {
    callbacks,
    form,
    fileKey,
    page,
    pageSize,
    showForm,
    editingId,
    loading,
  } = callbacksState;

  const [locationFilter, setLocationFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const updateState = (updates) =>
    setCallbacksState((prev) => ({ ...prev, ...updates }));

  const loadCallbacks = async () => {
    updateState({ loading: true });
    try {
      const data = await callbacksApi.list();
      updateState({ callbacks: data, editStates: {} });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadCallbacks();
  }, []);

  const filteredCallbacks = callbacks.filter((callback) => {
    const matchesLocation = locationFilter
      ? callback.location === locationFilter
      : true;
    const matchesDate = selectedDate
      ? callback.createdAt &&
        new Date(callback.createdAt).toISOString().slice(0, 10) === selectedDate
      : true;
    return matchesLocation && matchesDate;
  });

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredCallbacks.length / pageSize));
    if (page > totalPages) {
      updateState({ page: totalPages });
    }
  }, [filteredCallbacks.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredCallbacks.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedCallbacks = filteredCallbacks.slice(startIndex, startIndex + pageSize);

  const resetForm = () => {
    setCallbacksState((prev) => ({
      ...prev,
      form: initialCallbackForm,
      fileKey: prev.fileKey + 1,
      showForm: false,
      editingId: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateState({ loading: true });

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      if (editingId) {
        await callbacksApi.update(editingId, formData);
        toast.success("Callback request updated.");
      } else {
        await callbacksApi.create(formData);
        toast.success("Callback request created.");
      }
      resetForm();
      loadCallbacks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleUpdate = async (id, status, adminComment) => {
    updateState({ loading: true });
    try {
      await callbacksApi.update(id, { status, adminComment });
      toast.success("Callback updated.");
      loadCallbacks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleEdit = (callback) => {
    setCallbacksState((prev) => ({
      ...prev,
      form: {
        fullName: callback.fullName || "",
        phoneNumber: callback.phoneNumber || "",
        email: callback.email || "",
        location: callback.location || LOCATION_OPTIONS[0],
        description: callback.description || "",
        image: null,
      },
      showForm: true,
      editingId: callback._id,
      fileKey: prev.fileKey + 1,
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this callback request?")) return;
    updateState({ loading: true });
    try {
      await callbacksApi.remove(id);
      toast.success("Callback deleted.");
      loadCallbacks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const exportToCsv = () => {
    if (!filteredCallbacks.length) {
      toast.info("No callbacks to export.");
      return;
    }

    const escapeValue = (value) => {
      const text = value === null || value === undefined ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = [
      [
        "Full Name",
        "Phone",
        "Email",
        "Location",
        "Status",
        "Admin Comment",
        "Description",
        "Created At",
      ],
      ...filteredCallbacks.map((callback) => [
        callback.fullName,
        callback.phoneNumber,
        callback.email,
        callback.location,
        callback.status,
        callback.adminComment || "",
        callback.description || "",
        callback.createdAt ? new Date(callback.createdAt).toLocaleString() : "",
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `callbacks-report-${selectedDate || "all"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Callbacks</p>
          <h1>Callback Requests</h1>
          <p className="subhead">
            Capture new requests and track status updates from the team.
          </p>
        </div>
        <div className="form-actions">
          <button
            className="primary"
            type="button"
            onClick={() =>
              setCallbacksState((prev) => ({
                ...prev,
                showForm: true,
                editingId: "",
                form: initialCallbackForm,
                fileKey: prev.fileKey + 1,
              }))
            }
            disabled={loading}
          >
            <span className="button-icon">
              <FiPlus aria-hidden />
            </span>
            Add callback
          </button>
          <button className="ghost" type="button" onClick={loadCallbacks} disabled={loading}>
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
            title={editingId ? "Edit callback request" : "New callback request"}
            onClose={resetForm}
          >
            <p className="subhead">
              {editingId ? "Update the request details." : "Capture a new patient request."}
            </p>
            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                  <label>Full name</label>
                  <input
                    value={form.fullName}
                    onChange={(event) =>
                      setCallbacksState((prev) => ({
                        ...prev,
                        form: { ...prev.form, fullName: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input
                    value={form.phoneNumber}
                    onChange={(event) =>
                      setCallbacksState((prev) => ({
                        ...prev,
                        form: { ...prev.form, phoneNumber: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setCallbacksState((prev) => ({
                        ...prev,
                        form: { ...prev.form, email: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Location</label>
                  <select
                    value={form.location}
                    onChange={(event) =>
                      setCallbacksState((prev) => ({
                        ...prev,
                        form: { ...prev.form, location: event.target.value },
                      }))
                    }
                  >
                    {LOCATION_OPTIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(event) =>
                      setCallbacksState((prev) => ({
                        ...prev,
                        form: { ...prev.form, description: event.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Prescription / affected image</label>
                  <input
                    key={fileKey}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setCallbacksState((prev) => ({
                        ...prev,
                        form: { ...prev.form, image: event.target.files[0] || null },
                      }))
                    }
                  />
                </div>
                <div className="form-actions">
                  <button className="primary" type="submit" disabled={loading}>
                    {editingId ? "Update request" : "Submit request"}
                  </button>
                  <button
                    className="ghost"
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
          </Modal>

          <div className="card list">
            <div className="card-header">
              <div>
                <h2>Open callback requests</h2>
                <span className="muted">{filteredCallbacks.length} total</span>
              </div>
              <div className="filters">
                <select
                  value={locationFilter}
                  onChange={(event) => {
                    setLocationFilter(event.target.value);
                    updateState({ page: 1 });
                  }}
                  disabled={loading}
                >
                  <option value="">All locations</option>
                  {LOCATION_OPTIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    updateState({ page: 1 });
                  }}
                  disabled={loading}
                />
                <button
                  className="ghost"
                  type="button"
                  onClick={exportToCsv}
                  disabled={loading}
                >
                  <span className="button-icon">
                    <FiDownload aria-hidden />
                  </span>
                  Export Excel
                </button>
                <button
                  className="ghost"
                  type="button"
                  onClick={loadCallbacks}
                  disabled={loading}
                >
                  <span className="button-icon">
                    <FiRefreshCcw aria-hidden />
                  </span>
                  Refresh
                </button>
              </div>
            </div>
            <div className="callback-list">
              {paginatedCallbacks.map((callback) => (
                <CallbackItem
                  key={callback._id}
                  callback={callback}
                  onUpdate={handleUpdate}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  disabled={loading}
                />
              ))}
              {!filteredCallbacks.length && (
                <p className="muted">No callback requests yet.</p>
              )}
            </div>
            {filteredCallbacks.length > pageSize && (
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

export default CallbacksPage;
