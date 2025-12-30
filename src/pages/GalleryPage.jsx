import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { galleryApi } from "../api";
import LoadingBar from "../components/LoadingBar";

const TAG_OPTIONS = [
  "clicnic",
  "care",
  "kids",
  "events",
  "wellness",
  "nutrition",
];

const initialGallery = { description: "", tags: "", image: null };

const GalleryPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialGallery);
  const [filter, setFilter] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadGallery = async (tag) => {
    setLoading(true);
    try {
      const data = await galleryApi.list(tag);
      setItems(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
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
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("description", form.description);
      formData.append("tags", form.tags);
      if (form.image) formData.append("image", form.image);

      await galleryApi.create(formData);
      setForm(initialGallery);
      setFileKey((key) => key + 1);
      toast.success("Gallery item created.");
      loadGallery(filter || undefined);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);

    try {
      await galleryApi.remove(id);
      toast.success("Gallery item deleted.");
      loadGallery(filter || undefined);
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
          <p className="eyebrow">Gallery</p>
          <h1>Gallery Library</h1>
          <p className="subhead">Upload patient moments and curated visuals.</p>
        </div>
      </div>

      <LoadingBar active={loading} />

      <div className="panel-grid">
        <form className="card form" onSubmit={handleSubmit}>
          <h2>New gallery entry</h2>
          <div className="field">
            <label>Description</label>
            <input
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              required
            />
          </div>
          <div className="field">
            <label>Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
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
                setForm((prev) => ({
                  ...prev,
                  image: event.target.files[0] || null,
                }))
              }
              required
            />
          </div>
          <button className="primary" type="submit" disabled={loading}>
            Upload image
          </button>
        </form>

        <div className="card list">
          <div className="card-header">
            <div>
              <h2>Gallery items</h2>
              <p className="muted">Filter by tag</p>
            </div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
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
          <div className="gallery-grid">
            {items.map((item) => (
              <article key={item._id}>
                <img src={item.imageUrl} alt={item.description} />
                <div>
                  <p>{item.description}</p>
                  <small>{item.tags.join(", ")}</small>
                </div>
                  <button
                    className="danger"
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
              </article>
            ))}
            {!items.length && <p>No gallery items yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GalleryPage;
