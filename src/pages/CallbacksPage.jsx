import { useEffect } from "react";
import { toast } from "react-toastify";
import { FiCheckCircle, FiRefreshCcw } from "react-icons/fi";
import { callbacksApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { initialCallbackForm, useAdminState } from "../context/AdminState.jsx";

const LOCATION_OPTIONS = ["kolkata", "howrah", "bardhaman"];

const CallbackItem = ({ callback, onUpdate, disabled }) => {
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
    <li className="list-item">
      <div>
        <h3>{callback.fullName}</h3>
        <p>
          {callback.phoneNumber} - {callback.email}
        </p>
        <p className="muted">
          {callback.location} - {callback.status}
        </p>
      </div>
      <div className="list-actions">
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
          className="ghost"
          type="button"
          onClick={() => onUpdate(callback._id, current.status, current.adminComment)}
          disabled={disabled}
        >
          <span className="button-icon">
            <FiCheckCircle aria-hidden />
          </span>
          Update
        </button>
      </div>
    </li>
  );
};

const CallbacksPage = () => {
  const { callbacksState, setCallbacksState } = useAdminState();
  const { callbacks, form, fileKey, loading } = callbacksState;

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

      await callbacksApi.create(formData);
      setCallbacksState((prev) => ({
        ...prev,
        form: initialCallbackForm,
        fileKey: prev.fileKey + 1,
      }));
      toast.success("Callback request created.");
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
      </div>

      <div className={loading ? "page-body is-loading" : "page-body"}>
        <div className="page-content">
          <div className="panel-grid">
          <form className="card form" onSubmit={handleSubmit}>
            <h2>New callback request</h2>
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
                required
              />
            </div>
            <button className="primary" type="submit" disabled={loading}>
              Submit request
            </button>
          </form>

          <div className="card list">
            <div className="card-header">
              <h2>Open callback requests</h2>
              <button className="ghost" type="button" onClick={loadCallbacks} disabled={loading}>
                <span className="button-icon">
                  <FiRefreshCcw aria-hidden />
                </span>
                Refresh
              </button>
            </div>
            <ul>
              {callbacks.map((callback) => (
                <CallbackItem
                  key={callback._id}
                  callback={callback}
                  onUpdate={handleUpdate}
                  disabled={loading}
                />
              ))}
              {!callbacks.length && <li>No callback requests yet.</li>}
            </ul>
          </div>
        </div>
          </div>
        </div>
        <LoadingOverlay active={loading} />
    </section>
  );
};

export default CallbacksPage;
