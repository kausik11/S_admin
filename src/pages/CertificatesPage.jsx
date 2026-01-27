import { useEffect } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiRefreshCcw, FiTrash2 } from "react-icons/fi";
import { certificatesApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import Modal from "../components/Modal";
import { initialCertificateForm, useAdminState } from "../context/AdminState.jsx";

const CertificatesPage = () => {
  const { certificatesState, setCertificatesState, authState } = useAdminState();
  const {
    certificates,
    form,
    showForm,
    editingId,
    fileKey,
    page,
    pageSize,
    loading,
  } = certificatesState;
  const adminRoles = ["admin", "superadmin"];
  const isAdmin = adminRoles.includes(authState?.user?.role);

  const updateState = (updates) =>
    setCertificatesState((prev) => ({ ...prev, ...updates }));

  const loadCertificates = async () => {
    updateState({ loading: true });
    try {
      const data = await certificatesApi.list();
      updateState({ certificates: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(certificates.length / pageSize));
    if (page > totalPages) {
      updateState({ page: totalPages });
    }
  }, [certificates.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(certificates.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedCertificates = certificates.slice(startIndex, startIndex + pageSize);

  const resetForm = () => {
    setCertificatesState((prev) => ({
      ...prev,
      form: initialCertificateForm,
      showForm: false,
      editingId: "",
      fileKey: prev.fileKey + 1,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateState({ loading: true });

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("year", form.year);
      formData.append("description", form.description);
      if (form.image) formData.append("image", form.image);

      if (editingId) {
        await certificatesApi.update(editingId, formData);
        toast.success("Certificate updated.");
      } else {
        await certificatesApi.create(formData);
        toast.success("Certificate created.");
      }

      resetForm();
      loadCertificates();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error("Only admins can delete certificates.");
      return;
    }
    updateState({ loading: true });

    try {
      await certificatesApi.remove(id);
      toast.success("Certificate deleted.");
      loadCertificates();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleEdit = (item) => {
    setCertificatesState((prev) => ({
      ...prev,
      form: {
        title: item.title || "",
        year: item.year ? String(item.year) : "",
        description: item.description || "",
        image: null,
      },
      showForm: true,
      editingId: item._id,
      fileKey: prev.fileKey + 1,
    }));
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Certificates</p>
          <h1>Certificates & Awards</h1>
          <p className="subhead">Manage professional certifications and recognitions.</p>
        </div>
        <div className="form-actions">
          <button
            className="primary"
            type="button"
            onClick={() =>
              setCertificatesState((prev) => ({
                ...prev,
                showForm: true,
                editingId: "",
                form: initialCertificateForm,
                fileKey: prev.fileKey + 1,
              }))
            }
            disabled={loading}
          >
            <span className="button-icon">
              <FiPlus aria-hidden />
            </span>
            Add certificate
          </button>
          <button
            className="ghost"
            type="button"
            onClick={loadCertificates}
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
            title={editingId ? "Edit certificate" : "New certificate"}
            onClose={resetForm}
          >
            <form className="form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setCertificatesState((prev) => ({
                      ...prev,
                      form: { ...prev.form, title: event.target.value },
                    }))
                  }
                  required
                />
              </div>
              <div className="field">
                <label>Year</label>
                <input
                  type="number"
                  value={form.year}
                  onChange={(event) =>
                    setCertificatesState((prev) => ({
                      ...prev,
                      form: { ...prev.form, year: event.target.value },
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
                    setCertificatesState((prev) => ({
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
                    setCertificatesState((prev) => ({
                      ...prev,
                      form: { ...prev.form, image: event.target.files[0] || null },
                    }))
                  }
                  required={!editingId}
                />
              </div>
              <div className="form-actions">
                <button className="primary" type="submit" disabled={loading}>
                  {editingId ? "Update certificate" : "Add certificate"}
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
              <h2>Certificates</h2>
              <span className="muted">{certificates.length} total</span>
            </div>
            <ul>
              {paginatedCertificates.map((item) => (
                <li key={item._id} className="list-item">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="muted">Year: {item.year}</p>
                    <p>{item.description}</p>
                  </div>
                  <div className="list-actions">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.title} />}
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => handleEdit(item)}
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
                        onClick={() => handleDelete(item._id)}
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
              {!certificates.length && <li>No certificates yet.</li>}
            </ul>
            {certificates.length > pageSize && (
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

export default CertificatesPage;
