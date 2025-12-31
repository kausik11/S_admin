import { useEffect } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiRefreshCcw, FiTrash2 } from "react-icons/fi";
import { tipsApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import Modal from "../components/Modal";
import { initialTipForm, useAdminState } from "../context/AdminState.jsx";

const TipsPage = () => {
  const { tipsState, setTipsState } = useAdminState();
  const { tips, form, editingId, showForm, loading, page, pageSize } = tipsState;

  const updateState = (updates) =>
    setTipsState((prev) => ({ ...prev, ...updates }));

  const loadTips = async () => {
    updateState({ loading: true });
    try {
      const data = await tipsApi.list();
      updateState({ tips: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadTips();
  }, []);

  useEffect(() => {
    const calculatedPages = Math.max(1, Math.ceil(tips.length / pageSize));
    if (page > calculatedPages) {
      updateState({ page: calculatedPages });
    }
  }, [tips.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(tips.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedTips = tips.slice(startIndex, startIndex + pageSize);

  const resetForm = () => {
    setTipsState((prev) => ({
      ...prev,
      form: initialTipForm,
      editingId: "",
      showForm: false,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateState({ loading: true });

    try {
      const payload = {
        title: form.title,
        text: form.text,
        imageUrl: form.imageUrl,
      };

      if (editingId) {
        await tipsApi.update(editingId, payload);
        toast.success("Tip updated.");
      } else {
        await tipsApi.create(payload);
        toast.success("Tip created.");
      }

      resetForm();
      loadTips();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleDelete = async (id) => {
    updateState({ loading: true });

    try {
      await tipsApi.remove(id);
      toast.success("Tip deleted.");
      loadTips();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleEdit = (tip) => {
    setTipsState((prev) => ({
      ...prev,
      form: {
        title: tip.title || "",
        text: tip.text || "",
        imageUrl: tip.imageUrl || "",
      },
      editingId: tip._id,
    }));
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Tips & Advice</p>
          <h1>Tips Library</h1>
          <p className="subhead">Curate short guidance snippets for parents.</p>
        </div>
        <button className="ghost" type="button" onClick={loadTips} disabled={loading}>
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
                  <h2>Tips</h2>
                  <span className="muted">{tips.length} total</span>
                </div>
                <button
                  className="primary"
                  type="button"
                  onClick={() => {
                    setTipsState((prev) => ({
                      ...prev,
                      showForm: true,
                      editingId: "",
                      form: initialTipForm,
                    }));
                  }}
                  disabled={loading}
                >
                  <span className="button-icon">
                    <FiPlus aria-hidden />
                  </span>
                  Add tip
                </button>
              </div>

              <Modal
                open={showForm}
                title={editingId ? "Edit tip" : "New tip"}
                onClose={resetForm}
              >
                <form className="form" onSubmit={handleSubmit}>
                  <div className="field">
                    <label>Title</label>
                    <input
                      value={form.title}
                      onChange={(event) =>
                        setTipsState((prev) => ({
                          ...prev,
                          form: { ...prev.form, title: event.target.value },
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Text</label>
                    <textarea
                      rows="4"
                      value={form.text}
                      onChange={(event) =>
                        setTipsState((prev) => ({
                          ...prev,
                          form: { ...prev.form, text: event.target.value },
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Image URL</label>
                    <input
                      value={form.imageUrl}
                      onChange={(event) =>
                        setTipsState((prev) => ({
                          ...prev,
                          form: { ...prev.form, imageUrl: event.target.value },
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-actions">
                    <button className="primary" type="submit" disabled={loading}>
                      <span className="button-icon">
                        {editingId ? <FiEdit2 aria-hidden /> : <FiPlus aria-hidden />}
                      </span>
                      {editingId ? "Update tip" : "Add tip"}
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
            </div>

            <div className="card list">
              <div className="card-header">
                <h2>Tips list</h2>
                <button className="ghost" type="button" onClick={loadTips} disabled={loading}>
                  <span className="button-icon">
                    <FiRefreshCcw aria-hidden />
                  </span>
                  Refresh
                </button>
              </div>
              <div className="service-list">
                {paginatedTips.map((tip) => (
                  <article key={tip._id} className="service-item">
                    {tip.imageUrl && (
                      <img src={tip.imageUrl} alt={tip.title} className="service-cover" />
                    )}
                    <div className="service-body">
                      <h3>
                        <span className="muted">Title: </span>
                        {tip.title}
                      </h3>
                      <p className="muted">
                        <span className="muted">Text: </span>
                        {tip.text}
                      </p>
                    </div>
                    <div className="service-actions">
                      <button
                        className="ghost"
                        type="button"
                        onClick={() => {
                          handleEdit(tip);
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
                        onClick={() => handleDelete(tip._id)}
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
                {!tips.length && <p className="muted">No tips yet.</p>}
              </div>
              {tips.length > pageSize && (
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

export default TipsPage;
