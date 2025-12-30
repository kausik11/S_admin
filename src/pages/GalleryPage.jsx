import { useEffect } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { galleryApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { initialGalleryForm, useAdminState } from "../context/AdminState.jsx";

const TAG_OPTIONS = [
  "clicnic",
  "care",
  "kids",
  "events",
  "wellness",
  "nutrition",
];

const GalleryPage = () => {
  const { galleryState, setGalleryState } = useAdminState();
  const { items, form, filter, fileKey, showForm, loading } = galleryState;

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateState({ loading: true });

    try {
      const formData = new FormData();
      formData.append("description", form.description);
      formData.append("tags", form.tags);
      if (form.image) formData.append("image", form.image);

      await galleryApi.create(formData);
      setGalleryState((prev) => ({
        ...prev,
        form: initialGalleryForm,
        fileKey: prev.fileKey + 1,
        showForm: false,
      }));
      toast.success("Gallery item created.");
      loadGallery(filter || undefined);
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleDelete = async (id) => {
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
          {showForm && (
            <div className="card form inline-form">
              <h2>New gallery entry</h2>
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
                  <label>Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={(event) =>
                      setGalleryState((prev) => ({
                        ...prev,
                        form: { ...prev.form, tags: event.target.value },
                      }))
                    }
                    placeholder={TAG_OPTIONS.join(", ")}
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
                      setGalleryState((prev) => ({
                        ...prev,
                        form: { ...prev.form, image: event.target.files[0] || null },
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-actions">
                  <button className="primary" type="submit" disabled={loading}>
                    Upload image
                  </button>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => updateState({ showForm: false })}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card list">
            <div className="card-header">
              <div>
                <h2>Gallery items</h2>
                <p className="muted">Filter by tag</p>
              </div>
              <select
                value={filter}
                onChange={(event) => updateState({ filter: event.target.value })}
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
              {items.map((item) => (
                <article key={item._id} className="gallery-item">
                  <img
                    src={item.imageUrl}
                    alt={item.description}
                    className="gallery-cover"
                  />
                  <div className="gallery-body">
                    <p>{item.description}</p>
                    <small className="muted">{item.tags.join(", ")}</small>
                  </div>
                  <div className="gallery-actions">
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
                </article>
              ))}
              {!items.length && <p className="muted">No gallery items yet.</p>}
            </div>
          </div>
        </div>
        <LoadingOverlay active={loading} />
      </div>
    </section>
  );
};

export default GalleryPage;
