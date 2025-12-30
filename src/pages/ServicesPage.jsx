import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { servicesApi } from "../api";
import LoadingBar from "../components/LoadingBar";

const initialService = {
  title: "",
  description: "",
  image: null,
};

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialService);
  const [fileKey, setFileKey] = useState(0);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await servicesApi.list();
      setServices(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const resetForm = () => {
    setForm(initialService);
    setEditingId("");
    setFileKey((key) => key + 1);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      if (form.image) formData.append("image", form.image);

      if (editingId) {
        await servicesApi.update(editingId, formData);
        toast.success("Service updated.");
      } else {
        await servicesApi.create(formData);
        toast.success("Service created.");
      }

      resetForm();
      loadServices();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);

    try {
      await servicesApi.remove(id);
      toast.success("Service deleted.");
      loadServices();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setForm({
      title: service.title || "",
      description: service.description || "",
      image: null,
    });
    setEditingId(service._id);
    setFileKey((key) => key + 1);
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Services</p>
          <h1>Service Catalogue</h1>
          <p className="subhead">Add, edit, and remove service offerings.</p>
        </div>
        <button className="ghost" type="button" onClick={loadServices} disabled={loading}>
          Refresh
        </button>
      </div>

      <LoadingBar active={loading} />

      <div className="panel-stack">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Services</h2>
              <span className="muted">{services.length} total</span>
            </div>
            <button
              className="primary"
              type="button"
              onClick={() => {
                setShowForm(true);
                setEditingId("");
                setForm(initialService);
                setFileKey((key) => key + 1);
              }}
              disabled={loading}
            >
              Add service
            </button>
          </div>

          {showForm && (
            <form className="form inline-form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="field">
                <label>Image</label>
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
                  required={!editingId}
                />
              </div>
              <div className="form-actions">
                <button className="primary" type="submit" disabled={loading}>
                  {editingId ? "Update service" : "Add service"}
                </button>
                <button className="ghost" type="button" onClick={resetForm} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="card list">
          <div className="card-header">
            <h2>Service list</h2>
            <button className="ghost" type="button" onClick={loadServices} disabled={loading}>
              Refresh
            </button>
          </div>
          <ul>
            {services.map((service) => (
              <li key={service._id} className="list-item">
                <div>
                  <h3>{service.title}</h3>
                  <p className="muted">{service.description}</p>
                </div>
                <div className="list-actions">
                  {service.imageUrl && (
                    <img src={service.imageUrl} alt={service.title} />
                  )}
                  <div className="action-row">
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => {
                        setShowForm(true);
                        handleEdit(service);
                      }}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="danger"
                      type="button"
                      onClick={() => handleDelete(service._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {!services.length && <li>No services yet.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ServicesPage;
