import { useEffect } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiRefreshCcw, FiTrash2 } from "react-icons/fi";
import { videoGalleryApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import Modal from "../components/Modal";
import { initialVideoGalleryForm, useAdminState } from "../context/AdminState.jsx";

const VideoGalleryPage = () => {
  const { videoGalleryState, setVideoGalleryState, authState } = useAdminState();
  const { videos, form, showForm, editingId, page, pageSize, loading } =
    videoGalleryState;
  const adminRoles = ["admin", "superadmin"];
  const isAdmin = adminRoles.includes(authState?.user?.role);

  const updateState = (updates) =>
    setVideoGalleryState((prev) => ({ ...prev, ...updates }));

  const loadVideos = async () => {
    updateState({ loading: true });
    try {
      const data = await videoGalleryApi.list();
      updateState({ videos: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(videos.length / pageSize));
    if (page > totalPages) {
      updateState({ page: totalPages });
    }
  }, [videos.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(videos.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedVideos = videos.slice(startIndex, startIndex + pageSize);

  const resetForm = () => {
    setVideoGalleryState((prev) => ({
      ...prev,
      form: initialVideoGalleryForm,
      showForm: false,
      editingId: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateState({ loading: true });

    try {
      const payload = {
        videoLink: form.videoLink,
        title: form.title,
        description: form.description,
      };

      if (editingId) {
        await videoGalleryApi.update(editingId, payload);
        toast.success("Video updated.");
      } else {
        await videoGalleryApi.create(payload);
        toast.success("Video created.");
      }

      resetForm();
      loadVideos();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error("Only admins can delete videos.");
      return;
    }
    updateState({ loading: true });

    try {
      await videoGalleryApi.remove(id);
      toast.success("Video deleted.");
      loadVideos();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleEdit = (item) => {
    setVideoGalleryState((prev) => ({
      ...prev,
      form: {
        videoLink: item.videoLink || "",
        title: item.title || "",
        description: item.description || "",
      },
      showForm: true,
      editingId: item._id,
    }));
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Video Gallery</p>
          <h1>Video Library</h1>
          <p className="subhead">Add and manage educational videos.</p>
        </div>
        <div className="form-actions">
          <button
            className="primary"
            type="button"
            onClick={() =>
              setVideoGalleryState((prev) => ({
                ...prev,
                showForm: true,
                editingId: "",
                form: initialVideoGalleryForm,
              }))
            }
            disabled={loading}
          >
            <span className="button-icon">
              <FiPlus aria-hidden />
            </span>
            Add video
          </button>
          <button className="ghost" type="button" onClick={loadVideos} disabled={loading}>
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
            title={editingId ? "Edit video" : "New video"}
            onClose={resetForm}
          >
            <form className="form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Video link</label>
                <input
                  value={form.videoLink}
                  onChange={(event) =>
                    setVideoGalleryState((prev) => ({
                      ...prev,
                      form: { ...prev.form, videoLink: event.target.value },
                    }))
                  }
                  required
                />
              </div>
              <div className="field">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setVideoGalleryState((prev) => ({
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
                    setVideoGalleryState((prev) => ({
                      ...prev,
                      form: { ...prev.form, description: event.target.value },
                    }))
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button className="primary" type="submit" disabled={loading}>
                  {editingId ? "Update video" : "Add video"}
                </button>
                <button className="ghost" type="button" onClick={resetForm} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
          <div className="card list">
            <div className="card-header">
              <h2>Videos</h2>
              <span className="muted">{videos.length} total</span>
            </div>
            <ul>
              {paginatedVideos.map((item) => (
                <li key={item._id} className="list-item">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="muted">{item.videoLink}</p>
                    <p>{item.description}</p>
                  </div>
                  <div className="list-actions">
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
              {!videos.length && <li>No videos yet.</li>}
            </ul>
            {videos.length > pageSize && (
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

export default VideoGalleryPage;
