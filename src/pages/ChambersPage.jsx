import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiRefreshCcw, FiTrash2 } from "react-icons/fi";
import { chambersApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import Modal from "../components/Modal";
import { initialChamberForm, useAdminState } from "../context/AdminState.jsx";

const normalizeTimings = (value) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const ChambersPage = () => {
  const { chambersState, setChambersState, authState } = useAdminState();
  const { chambers, form, editingId, showForm, loading, page, pageSize } =
    chambersState;
  const [availability, setAvailability] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    startDate: "",
    endDate: "",
    message: "",
    note: "",
  });
  const adminRoles = ["admin", "superadmin"];
  const isAdmin = adminRoles.includes(authState?.user?.role);

  const updateState = (updates) =>
    setChambersState((prev) => ({ ...prev, ...updates }));

  const loadChambers = async () => {
    updateState({ loading: true });
    try {
      const data = await chambersApi.list();
      updateState({ chambers: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const loadAvailability = async () => {
    updateState({ loading: true });
    try {
      const data = await chambersApi.getAvailability();
      setAvailability(data);
      setAvailabilityForm({
        startDate: toDateInputValue(data?.startDate),
        endDate: toDateInputValue(data?.endDate),
        message: data?.message || "",
        note: data?.note || "",
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadChambers();
    loadAvailability();
  }, []);

  useEffect(() => {
    const calculatedPages = Math.max(1, Math.ceil(chambers.length / pageSize));
    if (page > calculatedPages) {
      updateState({ page: calculatedPages });
    }
  }, [chambers.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(chambers.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedChambers = chambers.slice(startIndex, startIndex + pageSize);

  const resetForm = () => {
    setChambersState((prev) => ({
      ...prev,
      form: initialChamberForm,
      editingId: "",
      showForm: false,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateState({ loading: true });

    try {
      const payload = {
        name: form.name,
        contact: form.contact,
        timings: normalizeTimings(form.timings),
      };

      if (editingId) {
        await chambersApi.update(editingId, payload);
        toast.success("Chamber updated.");
      } else {
        await chambersApi.create(payload);
        toast.success("Chamber created.");
      }

      resetForm();
      loadChambers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleAvailabilitySubmit = async (event) => {
    event.preventDefault();
    updateState({ loading: true });
    try {
      const payload = {
        startDate: availabilityForm.startDate,
        endDate: availabilityForm.endDate,
        message: availabilityForm.message,
        note: availabilityForm.note,
      };

      if (availability?._id) {
        const data = await chambersApi.updateAvailability(availability._id, payload);
        setAvailability(data);
        toast.success("Availability updated.");
      } else {
        const data = await chambersApi.createAvailability(payload);
        setAvailability(data);
        toast.success("Availability created.");
      }

      loadAvailability();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleAvailabilityDelete = async () => {
    if (!availability?._id) return;
    updateState({ loading: true });
    try {
      await chambersApi.removeAvailability(availability._id);
      setAvailability(null);
      setAvailabilityForm({
        startDate: "",
        endDate: "",
        message: "",
        note: "",
      });
      toast.success("Availability deleted.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error("Only admins can delete chambers.");
      return;
    }
    updateState({ loading: true });

    try {
      await chambersApi.remove(id);
      toast.success("Chamber deleted.");
      loadChambers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleEdit = (chamber) => {
    setChambersState((prev) => ({
      ...prev,
      form: {
        name: chamber.name || "",
        contact: chamber.contact || "",
        timings: Array.isArray(chamber.timings)
          ? chamber.timings.join("\n")
          : chamber.timings || "",
      },
      editingId: chamber._id,
    }));
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Chambers</p>
          <h1>Doctor Chamber Timings</h1>
          <p className="subhead">Manage chamber schedules and contact info.</p>
        </div>
        <button className="ghost" type="button" onClick={loadChambers} disabled={loading}>
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
                  <h2>Availability Notice</h2>
                  <span className="muted">
                    {availability?.isClosed ? "Currently closed" : "Currently open"}
                  </span>
                </div>
                <button
                  className="ghost"
                  type="button"
                  onClick={loadAvailability}
                  disabled={loading}
                >
                  <span className="button-icon">
                    <FiRefreshCcw aria-hidden />
                  </span>
                  Refresh
                </button>
              </div>

              <form className="form" onSubmit={handleAvailabilitySubmit}>
                <div className="field">
                  <label>Start date</label>
                  <input
                    type="date"
                    value={availabilityForm.startDate}
                    onChange={(event) =>
                      setAvailabilityForm((prev) => ({
                        ...prev,
                        startDate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>End date</label>
                  <input
                    type="date"
                    value={availabilityForm.endDate}
                    onChange={(event) =>
                      setAvailabilityForm((prev) => ({
                        ...prev,
                        endDate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Message</label>
                  <input
                    value={availabilityForm.message}
                    onChange={(event) =>
                      setAvailabilityForm((prev) => ({
                        ...prev,
                        message: event.target.value,
                      }))
                    }
                    placeholder="e.g., Due to traveling all chambers will be closed."
                    required
                  />
                </div>
                <div className="field">
                  <label>Important note</label>
                  <textarea
                    rows="3"
                    value={availabilityForm.note}
                    onChange={(event) =>
                      setAvailabilityForm((prev) => ({
                        ...prev,
                        note: event.target.value,
                      }))
                    }
                    placeholder="Optional note shown to visitors."
                  />
                </div>
                <div className="form-actions">
                  <button className="primary" type="submit" disabled={loading}>
                    {availability?._id ? "Update notice" : "Create notice"}
                  </button>
                  {availability?._id && (
                    <button
                      className="danger ghost"
                      type="button"
                      onClick={handleAvailabilityDelete}
                      disabled={loading}
                    >
                      Delete notice
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2>Chambers</h2>
                  <span className="muted">{chambers.length} total</span>
                </div>
                <button
                  className="primary"
                  type="button"
                  onClick={() => {
                    setChambersState((prev) => ({
                      ...prev,
                      showForm: true,
                      editingId: "",
                      form: initialChamberForm,
                    }));
                  }}
                  disabled={loading}
                >
                  <span className="button-icon">
                    <FiPlus aria-hidden />
                  </span>
                  Add chamber
                </button>
              </div>

              <Modal
                open={showForm}
                title={editingId ? "Edit chamber" : "New chamber"}
                onClose={resetForm}
              >
                <form className="form" onSubmit={handleSubmit}>
                  <div className="field">
                    <label>Name</label>
                    <input
                      value={form.name}
                      onChange={(event) =>
                        setChambersState((prev) => ({
                          ...prev,
                          form: { ...prev.form, name: event.target.value },
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Timings (one per line)</label>
                    <textarea
                      rows="4"
                      value={form.timings}
                      onChange={(event) =>
                        setChambersState((prev) => ({
                          ...prev,
                          form: { ...prev.form, timings: event.target.value },
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Contact</label>
                    <input
                      value={form.contact}
                      onChange={(event) =>
                        setChambersState((prev) => ({
                          ...prev,
                          form: { ...prev.form, contact: event.target.value },
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button className="primary" type="submit" disabled={loading}>
                      <span className="button-icon">
                        {editingId ? <FiEdit2 aria-hidden /> : <FiPlus aria-hidden />}
                      </span>
                      {editingId ? "Update chamber" : "Add chamber"}
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
            </div>

            <div className="card list">
              <div className="card-header">
                <h2>Chamber list</h2>
                <button className="ghost" type="button" onClick={loadChambers} disabled={loading}>
                  <span className="button-icon">
                    <FiRefreshCcw aria-hidden />
                  </span>
                  Refresh
                </button>
              </div>
              <div className="service-list">
                {paginatedChambers.map((chamber) => (
                  <article key={chamber._id} className="service-item">
                    <div className="service-body">
                      <h3>
                        <span className="muted">Name: </span>
                        {chamber.name}
                      </h3>
                      <div className="muted">
                        <span className="muted">Timings: </span>
                        <ul className="muted">
                          {(chamber.timings || []).map((timing, index) => (
                            <li key={`${chamber._id}-time-${index}`}>{timing}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="muted">
                        <span className="muted">Contact: </span>
                        {chamber.contact}
                      </p>
                    </div>
                    <div className="service-actions">
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => {
                          handleEdit(chamber);
                          updateState({ showForm: true });
                        }}
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
                          onClick={() => handleDelete(chamber._id)}
                          disabled={loading}
                        >
                          <span className="button-icon">
                            <FiTrash2 aria-hidden />
                          </span>
                          Delete
                        </button>
                      )}
                    </div>
                  </article>
                ))}
                {!chambers.length && <p className="muted">No chambers yet.</p>}
              </div>
              {chambers.length > pageSize && (
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
        </div>
        <LoadingOverlay active={loading} />
      </div>
    </section>
  );
};

export default ChambersPage;
