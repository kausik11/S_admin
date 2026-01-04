import { useEffect } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { galleryApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import Modal from "../components/Modal";
import { initialGalleryForm, useAdminState } from "../context/AdminState.jsx";

const TAG_OPTIONS = [
  "clinic",
  "care",
  "kids",
  "events",
  "wellness",
  "nutrition",
];

const GalleryPage = () => {
  const { galleryState, setGalleryState, authState } = useAdminState();
  const { items, form, filter, fileKey, showForm, editingId, page, pageSize, loading } =
    galleryState;
  const adminRoles = ["admin", "superadmin"];
  const isAdmin = adminRoles.includes(authState?.user?.role);

  const updateState = (updates) =>
    setGalleryState((prev) => ({ ...prev, ...updates }));

  const loadGallery = async (tag) => {
    updateState({ loading: true });
    try {
      const data = await galleryApi.list(tag);
      updateState({ items: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  useEffect(() => {
    if (filter) {
      loadGallery(filter);
    } else {
      loadGallery();
    }
  }, [filter]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    if (page > totalPages) {
      updateState({ page: totalPages });
    }
  }, [items.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  const resetForm = () => {
    setGalleryState((prev) => ({
      ...prev,
      form: initialGalleryForm,
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
      formData.append("description", form.description);
      formData.append("tags", form.tags);
      if (form.image) formData.append("image", form.image);

      if (editingId) {
        await galleryApi.update(editingId, formData);
        toast.success("Gallery item updated.");
      } else {
        await galleryApi.create(formData);
        toast.success("Gallery item created.");
      }
      resetForm();
      loadGallery(filter || undefined);
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error("Only admins can delete gallery items.");
      return;
    }
    updateState({ loading: true });

    try {
      await galleryApi.remove(id);
      toast.success("Gallery item deleted.");
      loadGallery(filter || undefined);
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleEdit = (item) => {
    setGalleryState((prev) => ({
      ...prev,
      form: {
        description: item.description || "",
        tags: Array.isArray(item.tags) ? item.tags[0] || "" : item.tags || "",
        image: null,
      },
      fileKey: prev.fileKey + 1,
      showForm: true,
      editingId: item._id,
    }));
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gallery</p>
          <h1>Gallery Library</h1>
          <p className="subhead">Upload patient moments and curated visuals.</p>
        </div>
        <button
          className="primary"
          type="button"
          onClick={() => {
            setGalleryState((prev) => ({
              ...prev,
              showForm: true,
              form: initialGalleryForm,
              fileKey: prev.fileKey + 1,
              editingId: "",
            }));
          }}
          disabled={loading}
        >
          <span className="button-icon">
            <FiPlus aria-hidden />
          </span>
          Add new
        </button>
      </div>

      <div className={loading ? "page-body is-loading" : "page-body"}>
        <div className="page-content">
          <Modal
            open={showForm}
            title={editingId ? "Edit gallery entry" : "New gallery entry"}
            onClose={resetForm}
          >
            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                  <label>Description</label>
                  <input
                    value={form.description}
                    onChange={(event) =>
                      setGalleryState((prev) => ({
                        ...prev,
                        form: { ...prev.form, description: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Tag</label>
                  <select
                    value={form.tags}
                    onChange={(event) =>
                      setGalleryState((prev) => ({
                        ...prev,
                        form: { ...prev.form, tags: event.target.value },
                      }))
                    }
                    required
                  >
                    <option value="" disabled>
                      Select a tag
                    </option>
                    {TAG_OPTIONS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Image</label>
                  <input
                    key={fileKey}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setGalleryState((prev) => ({
                        ...prev,
                        form: { ...prev.form, image: event.target.files[0] || null },
                      }))
                    }
                    required={!editingId}
                  />
                </div>
                <div className="form-actions">
                  <button className="primary" type="submit" disabled={loading}>
                    {editingId ? "Update entry" : "Upload image"}
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
                <h2>Gallery items</h2>
                <p className="muted">Filter by tag</p>
              </div>
              <select
                value={filter}
                onChange={(event) =>
                  updateState({ filter: event.target.value, page: 1 })
                }
                disabled={loading}
              >
                <option value="">All</option>
                {TAG_OPTIONS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
            <div className="gallery-list">
              {paginatedItems.map((item) => (
                <article key={item._id} className="gallery-item">
                  <img
                    src={item.imageUrl}
                    alt={item.description}
                    className="gallery-cover"
                  />
                  <div className="gallery-body">
                    <p>
                      <span className="muted">Description: </span>
                      {item.description}
                    </p>
                    <small className="muted">
                      <span className="muted">Tags: </span>
                      {item.tags.join(", ")}
                    </small>
                  </div>
                  <div className="gallery-actions">
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
                </article>
              ))}
              {!items.length && <p className="muted">No gallery items yet.</p>}
            </div>
            {items.length > pageSize && (
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

export default GalleryPage;
