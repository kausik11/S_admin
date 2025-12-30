import { useEffect } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { faqsApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { initialFaqForm, useAdminState } from "../context/AdminState.jsx";

const TAG_OPTIONS = [
  "clicnic",
  "care",
  "kids",
  "events",
  "wellness",
  "nutrition",
];

const FaqsPage = () => {
  const { faqsState, setFaqsState } = useAdminState();
  const { faqs, form, search, tagFilter, fileKey, showForm, editingId, loading } =
    faqsState;

  const updateState = (updates) => setFaqsState((prev) => ({ ...prev, ...updates }));

  const loadFaqs = async () => {
    updateState({ loading: true });
    try {
      const data = tagFilter ? await faqsApi.list(tagFilter) : await faqsApi.list();
      updateState({ faqs: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  useEffect(() => {
    loadFaqs();
  }, [tagFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateState({ loading: true });

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      if (editingId) {
        await faqsApi.update(editingId, formData);
        toast.success("FAQ updated.");
      } else {
        await faqsApi.create(formData);
        toast.success("FAQ created.");
      }

      setFaqsState((prev) => ({
        ...prev,
        form: initialFaqForm,
        fileKey: prev.fileKey + 1,
        showForm: false,
        editingId: "",
      }));
      loadFaqs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleDelete = async (id) => {
    updateState({ loading: true });

    try {
      await faqsApi.remove(id);
      toast.success("FAQ deleted.");
      loadFaqs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    updateState({ loading: true });

    if (!search.trim()) {
      loadFaqs();
      return;
    }

    try {
      const data = await faqsApi.search(search.trim());
      updateState({ faqs: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleEdit = (faq) => {
    setFaqsState((prev) => ({
      ...prev,
      form: {
        title: faq.title || "",
        question: faq.question || "",
        answer: faq.answer || "",
        tags: (faq.tags || []).join(", "),
        metadata: (faq.metadata || []).join(", "),
        link: faq.link || "",
        image: null,
      },
      showForm: true,
      editingId: faq._id,
      fileKey: prev.fileKey + 1,
    }));
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">FAQs</p>
          <h1>FAQ Knowledge Base</h1>
          <p className="subhead">
            Publish answers quickly and keep patients informed.
          </p>
        </div>
        <button
          className="primary"
          type="button"
          onClick={() =>
            setFaqsState((prev) => ({
              ...prev,
              showForm: true,
              editingId: "",
              form: initialFaqForm,
              fileKey: prev.fileKey + 1,
            }))
          }
          disabled={loading}
        >
          <span className="button-icon">
            <FiPlus aria-hidden />
          </span>
          Add FAQ
        </button>
      </div>

      <div className={loading ? "page-body is-loading" : "page-body"}>
        <div className="page-content">
          {showForm && (
            <div className="card form inline-form">
              <h2>{editingId ? "Edit FAQ" : "Create FAQ"}</h2>
              <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                  <label>Title</label>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setFaqsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, title: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Question</label>
                  <textarea
                    rows="2"
                    value={form.question}
                    onChange={(event) =>
                      setFaqsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, question: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Answer</label>
                  <textarea
                    rows="4"
                    value={form.answer}
                    onChange={(event) =>
                      setFaqsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, answer: event.target.value },
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
                      setFaqsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, tags: event.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Metadata (comma separated)</label>
                  <input
                    value={form.metadata}
                    onChange={(event) =>
                      setFaqsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, metadata: event.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Link</label>
                  <input
                    value={form.link}
                    onChange={(event) =>
                      setFaqsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, link: event.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Image</label>
                  <input
                    key={fileKey}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setFaqsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, image: event.target.files[0] || null },
                      }))
                    }
                    required={!editingId}
                  />
                </div>
                <div className="form-actions">
                  <button className="primary" type="submit" disabled={loading}>
                    {editingId ? "Save changes" : "Save FAQ"}
                  </button>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() =>
                      setFaqsState((prev) => ({
                        ...prev,
                        showForm: false,
                        editingId: "",
                        form: initialFaqForm,
                        fileKey: prev.fileKey + 1,
                      }))
                    }
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
                <h2>FAQ library</h2>
                <p className="muted">Search and filter knowledge base</p>
              </div>
              <div className="filters">
                <form onSubmit={handleSearch}>
                  <input
                    value={search}
                    onChange={(event) => updateState({ search: event.target.value })}
                    placeholder="Search FAQs..."
                    disabled={loading}
                  />
                </form>
                <select
                  value={tagFilter}
                  onChange={(event) => updateState({ tagFilter: event.target.value })}
                  disabled={loading}
                >
                  <option value="">All tags</option>
                  {TAG_OPTIONS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="faq-list">
              {faqs.map((faq) => (
                <article key={faq._id} className="faq-item">
                  {faq.imageUrl && (
                    <img src={faq.imageUrl} alt={faq.title} className="faq-cover" />
                  )}
                  <div className="faq-body">
                    <h3>{faq.title}</h3>
                    <p className="muted">{faq.question}</p>
                  </div>
                  <div className="faq-actions">
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => handleEdit(faq)}
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
                      onClick={() => handleDelete(faq._id)}
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
              {!faqs.length && <p className="muted">No FAQs yet.</p>}
            </div>
          </div>
        </div>
        <LoadingOverlay active={loading} />
      </div>
    </section>
  );
};

export default FaqsPage;
