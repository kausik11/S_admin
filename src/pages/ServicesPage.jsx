import { useEffect } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiRefreshCcw, FiTrash2 } from "react-icons/fi";
import { servicesApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { initialServiceForm, useAdminState } from "../context/AdminState.jsx";

const ServicesPage = () => {
  const { servicesState, setServicesState } = useAdminState();
  const {
    services,
    form,
    fileKey,
    editingId,
    showForm,
    loading,
    page,
    pageSize,
  } = servicesState;

  const updateState = (updates) =>
    setServicesState((prev) => ({ ...prev, ...updates }));

  const loadServices = async () => {
    updateState({ loading: true });
    try {
      const data = await servicesApi.list();
      updateState({ services: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    const calculatedPages = Math.max(1, Math.ceil(services.length / pageSize));
    if (page > calculatedPages) {
      updateState({ page: calculatedPages });
    }
  }, [services.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(services.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedServices = services.slice(startIndex, startIndex + pageSize);

  const resetForm = () => {
    setServicesState((prev) => ({
      ...prev,
      form: initialServiceForm,
      editingId: "",
      fileKey: prev.fileKey + 1,
      showForm: false,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateState({ loading: true });

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
      updateState({ loading: false });
    }
  };

  const handleDelete = async (id) => {
    updateState({ loading: true });

    try {
      await servicesApi.remove(id);
      toast.success("Service deleted.");
      loadServices();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleEdit = (service) => {
    setServicesState((prev) => ({
      ...prev,
      form: {
        title: service.title || "",
        description: service.description || "",
        image: null,
      },
      editingId: service._id,
      fileKey: prev.fileKey + 1,
    }));
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
                  <h2>Services</h2>
                  <span className="muted">{services.length} total</span>
                </div>
                <button
                  className="primary"
                  type="button"
                  onClick={() => {
                    setServicesState((prev) => ({
                      ...prev,
                      showForm: true,
                      editingId: "",
                      form: initialServiceForm,
                      fileKey: prev.fileKey + 1,
                    }));
                  }}
                  disabled={loading}
                >
                  <span className="button-icon">
                    <FiPlus aria-hidden />
                  </span>
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
                        setServicesState((prev) => ({
                          ...prev,
                          form: { ...prev.form, title: event.target.value },
                        }))
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
                        setServicesState((prev) => ({
                          ...prev,
                          form: { ...prev.form, description: event.target.value },
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
                        setServicesState((prev) => ({
                          ...prev,
                          form: { ...prev.form, image: event.target.files[0] || null },
                        }))
                      }
                      required={!editingId}
                    />
                  </div>
                  <div className="form-actions">
                    <button className="primary" type="submit" disabled={loading}>
                      <span className="button-icon">
                        {editingId ? <FiEdit2 aria-hidden /> : <FiPlus aria-hidden />}
                      </span>
                      {editingId ? "Update service" : "Add service"}
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
              )}
            </div>

            <div className="card list">
              <div className="card-header">
                <h2>Service list</h2>
                <button className="ghost" type="button" onClick={loadServices} disabled={loading}>
                  <span className="button-icon">
                    <FiRefreshCcw aria-hidden />
                  </span>
                  Refresh
                </button>
              </div>
              <div className="service-list">
                {paginatedServices.map((service) => (
                  <article key={service._id} className="service-item">
                    {service.imageUrl && (
                      <img src={service.imageUrl} alt={service.title} className="service-cover" />
                    )}
                    <div className="service-body">
                      <h3>{service.title}</h3>
                      <p className="muted">{service.description}</p>
                    </div>
                    <div className="service-actions">
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => {
                          handleEdit(service);
                          updateState({ showForm: true });
                        }}
                        disabled={loading}
                      >
                        <span className="button-icon">
                          <FiEdit2 aria-hidden />
                        </span>
                        Edit
                      </button>
                      <button
                        className="danger ghost"
                        type="button"
                        onClick={() => handleDelete(service._id)}
                        disabled={loading}
                      >
                        <span className="button-icon">
                          <FiTrash2 aria-hidden />
                        </span>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
                {!services.length && <p className="muted">No services yet.</p>}
              </div>
              {services.length > pageSize && (
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

export default ServicesPage;
