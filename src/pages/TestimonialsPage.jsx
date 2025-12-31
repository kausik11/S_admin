import { useEffect } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiRefreshCcw, FiTrash2 } from "react-icons/fi";
import { testimonialsApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import Modal from "../components/Modal";
import { useAdminState } from "../context/AdminState.jsx";

const TestimonialsPage = () => {
  const { testimonialsState, setTestimonialsState } = useAdminState();
  const { testimonials, form, showForm, editingId, fileKey, page, pageSize, loading } =
    testimonialsState;

  const updateState = (updates) =>
    setTestimonialsState((prev) => ({ ...prev, ...updates }));

  const loadTestimonials = async () => {
    updateState({ loading: true });
    try {
      const data = await testimonialsApi.list();
      updateState({ testimonials: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(testimonials.length / pageSize));
    if (page > totalPages) {
      updateState({ page: totalPages });
    }
  }, [testimonials.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(testimonials.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedTestimonials = testimonials.slice(startIndex, startIndex + pageSize);

  const resetForm = () => {
    setTestimonialsState((prev) => ({
      ...prev,
      form: { fullName: "", rating: "5", message: "", image: null },
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
      formData.append("fullName", form.fullName);
      formData.append("rating", form.rating);
      formData.append("message", form.message);
      if (form.image) formData.append("image", form.image);

      if (editingId) {
        await testimonialsApi.update(editingId, formData);
        toast.success("Testimonial updated.");
      } else {
        await testimonialsApi.create(formData);
        toast.success("Testimonial created.");
      }

      resetForm();
      loadTestimonials();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleDelete = async (id) => {
    updateState({ loading: true });

    try {
      await testimonialsApi.remove(id);
      toast.success("Testimonial deleted.");
      loadTestimonials();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleEdit = (item) => {
    setTestimonialsState((prev) => ({
      ...prev,
      form: {
        fullName: item.fullName || "",
        rating: String(item.rating || "5"),
        message: item.message || "",
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
          <p className="eyebrow">Testimonials</p>
          <h1>Patient Testimonials</h1>
          <p className="subhead">Review and manage feedback highlights.</p>
        </div>
        <div className="form-actions">
          <button
            className="primary"
            type="button"
            onClick={() =>
              setTestimonialsState((prev) => ({
                ...prev,
                showForm: true,
                editingId: "",
                form: { fullName: "", rating: "5", message: "", image: null },
                fileKey: prev.fileKey + 1,
              }))
            }
            disabled={loading}
          >
            <span className="button-icon">
              <FiPlus aria-hidden />
            </span>
            Add testimonial
          </button>
          <button
            className="ghost"
            type="button"
            onClick={loadTestimonials}
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
            title={editingId ? "Edit testimonial" : "New testimonial"}
            onClose={resetForm}
          >
            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                  <label>Full name</label>
                  <input
                    value={form.fullName}
                    onChange={(event) =>
                      setTestimonialsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, fullName: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={form.rating}
                    onChange={(event) =>
                      setTestimonialsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, rating: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Message</label>
                  <textarea
                    rows="3"
                    value={form.message}
                    onChange={(event) =>
                      setTestimonialsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, message: event.target.value },
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
                      setTestimonialsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, image: event.target.files[0] || null },
                      }))
                    }
                    required={!editingId}
                  />
                </div>
                <div className="form-actions">
                  <button className="primary" type="submit" disabled={loading}>
                    {editingId ? "Update testimonial" : "Add testimonial"}
                  </button>
                  <button className="ghost" type="button" onClick={resetForm} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
          </Modal>
          <div className="card list">
            <div className="card-header">
              <h2>Testimonials</h2>
              <span className="muted">{testimonials.length} total</span>
            </div>
            <ul>
              {paginatedTestimonials.map((item) => (
                <li key={item._id} className="list-item">
                  <div>
                    <h3>{item.fullName}</h3>
                    <p className="muted">Rating: {item.rating}</p>
                    <p>{item.message}</p>
                  </div>
                  <div className="list-actions">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.fullName} />}
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
                  </div>
                </li>
              ))}
              {!testimonials.length && <li>No testimonials yet.</li>}
            </ul>
            {testimonials.length > pageSize && (
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

export default TestimonialsPage;
