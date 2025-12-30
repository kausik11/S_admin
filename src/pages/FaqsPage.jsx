import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { faqsApi } from "../api";
import LoadingBar from "../components/LoadingBar";

const TAG_OPTIONS = [
  "clicnic",
  "care",
  "kids",
  "events",
  "wellness",
  "nutrition",
];

const initialFaq = {
  title: "",
  question: "",
  answer: "",
  tags: "",
  metadata: "",
  link: "",
  image: null,
};

const FaqsPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState(initialFaq);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const data = tagFilter ? await faqsApi.list(tagFilter) : await faqsApi.list();
      setFaqs(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
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
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      await faqsApi.create(formData);
      setForm(initialFaq);
      setFileKey((key) => key + 1);
      toast.success("FAQ created.");
      loadFaqs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);

    try {
      await faqsApi.remove(id);
      toast.success("FAQ deleted.");
      loadFaqs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!search.trim()) {
      loadFaqs();
      return;
    }

    try {
      const data = await faqsApi.search(search.trim());
      setFaqs(data);
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
          <p className="eyebrow">FAQs</p>
          <h1>FAQ Knowledge Base</h1>
          <p className="subhead">
            Publish answers quickly and keep patients informed.
          </p>
        </div>
      </div>

      <LoadingBar active={loading} />

      <div className="panel-grid">
        <form className="card form" onSubmit={handleSubmit}>
          <h2>Create FAQ</h2>
          <div className="field">
            <label>Title</label>
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label>Question</label>
            <textarea
              rows="2"
              value={form.question}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, question: event.target.value }))
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
                setForm((prev) => ({ ...prev, answer: event.target.value }))
              }
              required
            />
          </div>
          <div className="field">
            <label>Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
            />
          </div>
          <div className="field">
            <label>Metadata (comma separated)</label>
            <input
              value={form.metadata}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, metadata: event.target.value }))
              }
            />
          </div>
          <div className="field">
            <label>Link</label>
            <input
              value={form.link}
              onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
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
            Save FAQ
          </button>
        </form>

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
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search FAQs..."
                  disabled={loading}
                />
              </form>
              <select
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
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
          <ul>
            {faqs.map((faq) => (
              <li key={faq._id} className="list-item">
                <div>
                  <h3>{faq.title}</h3>
                  <p className="muted">{faq.question}</p>
                  <p>{faq.answer}</p>
                  <p className="meta">
                    {(faq.tags || []).join(", ")} - {(faq.metadata || []).join(", ")}
                  </p>
                </div>
                <div className="list-actions">
                  {faq.imageUrl && <img src={faq.imageUrl} alt={faq.title} />}
                  <button
                    className="danger"
                    type="button"
                    onClick={() => handleDelete(faq._id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {!faqs.length && <li>No FAQs yet.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FaqsPage;
