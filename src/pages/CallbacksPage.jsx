import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { callbacksApi } from "../api";
import LoadingBar from "../components/LoadingBar";

const LOCATION_OPTIONS = ["kolkata", "howrah", "bardhaman"];

const initialCallback = {
  fullName: "",
  phoneNumber: "",
  email: "",
  location: LOCATION_OPTIONS[0],
  description: "",
  image: null,
};

const CallbackItem = ({ callback, onUpdate, disabled }) => {
  const [status, setStatus] = useState(callback.status);
  const [adminComment, setAdminComment] = useState(callback.adminComment || "");

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
            value={status}
            onChange={(event) => setStatus(event.target.value)}
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
            value={adminComment}
            onChange={(event) => setAdminComment(event.target.value)}
            disabled={disabled}
          />
        </label>
        <button
          className="ghost"
          type="button"
          onClick={() => onUpdate(callback._id, status, adminComment)}
          disabled={disabled}
        >
          Update
        </button>
      </div>
    </li>
  );
};

const CallbacksPage = () => {
  const [callbacks, setCallbacks] = useState([]);
  const [form, setForm] = useState(initialCallback);
  const [fileKey, setFileKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCallbacks = async () => {
    setLoading(true);
    try {
      const data = await callbacksApi.list();
      setCallbacks(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCallbacks();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      await callbacksApi.create(formData);
      setForm(initialCallback);
      setFileKey((key) => key + 1);
      toast.success("Callback request created.");
      loadCallbacks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, status, adminComment) => {
    setLoading(true);
    try {
      await callbacksApi.update(id, { status, adminComment });
      toast.success("Callback updated.");
      loadCallbacks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
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

      <LoadingBar active={loading} />

      <div className="panel-grid">
        <form className="card form" onSubmit={handleSubmit}>
          <h2>New callback request</h2>
          <div className="field">
            <label>Full name</label>
            <input
              value={form.fullName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, fullName: event.target.value }))
              }
              required
            />
          </div>
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
          <div className="field">
            <label>Location</label>
            <select
              value={form.location}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, location: event.target.value }))
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
                setForm((prev) => ({ ...prev, description: event.target.value }))
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
                setForm((prev) => ({
                  ...prev,
                  image: event.target.files[0] || null,
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
    </section>
  );
};

export default CallbacksPage;
