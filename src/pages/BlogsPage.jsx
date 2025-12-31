import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiRefreshCcw, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { blogApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import Modal from "../components/Modal";
import { initialBlogForm, useAdminState } from "../context/AdminState.jsx";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const CATEGORY_OPTIONS = ["cancer", "kidney", "heart", "nerve", "spinal", "other"];

const BlogsPage = () => {
  const { blogsState, setBlogsState } = useAdminState();
  const { blogs, form, showForm, editingId, fileKey, page, pageSize, loading } =
    blogsState;
  const [searchTitle, setSearchTitle] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const updateState = (updates) => setBlogsState((prev) => ({ ...prev, ...updates }));

  const loadBlogs = async () => {
    updateState({ loading: true });
    try {
      const data = await blogApi.list();
      updateState({ blogs: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const normalizedSearch = searchTitle.trim().toLowerCase();
    return blogs.filter((blog) => {
      const matchesTitle = normalizedSearch
        ? (blog.title || "").toLowerCase().includes(normalizedSearch)
        : true;
      const matchesCategory = categoryFilter ? blog.category === categoryFilter : true;
      return matchesTitle && matchesCategory;
    });
  }, [blogs, searchTitle, categoryFilter]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / pageSize));
    if (page > totalPages) {
      updateState({ page: totalPages });
    }
  }, [filteredBlogs.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + pageSize);

  const resetForm = () => {
    setBlogsState((prev) => ({
      ...prev,
      form: initialBlogForm,
      editingId: "",
      showForm: false,
      fileKey: prev.fileKey + 1,
    }));
  };

  const stripHtml = (value) =>
    value ? value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    updateState({ loading: true });

    try {
      if (!stripHtml(form.description)) {
        toast.error("Description is required.");
        updateState({ loading: false });
        return;
      }

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("writtenBy", form.writtenBy);
      formData.append("quickClinicalTip", form.quickClinicalTip);
      if (form.metadata) formData.append("metadata", form.metadata);
      if (form.image) formData.append("image", form.image);

      if (editingId) {
        await blogApi.update(editingId, formData);
        toast.success("Blog updated.");
      } else {
        await blogApi.create(formData);
        toast.success("Blog created.");
      }

      resetForm();
      loadBlogs();
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
    }
  };

  const handleEdit = (blog) => {
    setBlogsState((prev) => ({
      ...prev,
      form: {
        title: blog.title || "",
        description: blog.description || "",
        category: blog.category || CATEGORY_OPTIONS[0],
        writtenBy: blog.writtenBy || "",
        quickClinicalTip: blog.quickClinicalTip || "",
        metadata: (blog.metadata || []).join(", "),
        image: null,
      },
      editingId: blog._id,
      showForm: true,
      fileKey: prev.fileKey + 1,
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    updateState({ loading: true });
    try {
      await blogApi.remove(id);
      toast.success("Blog deleted.");
      loadBlogs();
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
          <p className="eyebrow">Content</p>
          <h1>Blogs</h1>
          <p className="subhead">Create, edit, and manage blog content.</p>
        </div>
        <button
          className="primary"
          type="button"
          onClick={() => {
            setBlogsState((prev) => ({
              ...prev,
              showForm: true,
              editingId: "",
              form: initialBlogForm,
              fileKey: prev.fileKey + 1,
            }));
          }}
          disabled={loading}
        >
          <span className="button-icon">
            <FiPlus aria-hidden />
          </span>
          New Blog
        </button>
      </div>

      <div className={loading ? "page-body is-loading" : "page-body"}>
        <div className="page-content">
          <Modal
            open={showForm}
            title={editingId ? "Edit Blog" : "Create Blog"}
            onClose={resetForm}
          >
            <p className="subhead">Use a clear headline and concise summary.</p>
            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                  <label>Title</label>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setBlogsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, title: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Description</label>
                  <ReactQuill
                    value={form.description}
                    onChange={(value) =>
                      setBlogsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, description: value },
                      }))
                    }
                    className="quill"
                    required
                  />
                </div>
                <div className="field">
                  <label>Category</label>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setBlogsState((prev) => ({
                      ...prev,
                      form: { ...prev.form, category: event.target.value },
                    }))
                  }
                >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Written By</label>
                  <input
                    value={form.writtenBy}
                    onChange={(event) =>
                      setBlogsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, writtenBy: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Quick Clinical Tip</label>
                  <input
                    value={form.quickClinicalTip}
                    onChange={(event) =>
                      setBlogsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, quickClinicalTip: event.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Metadata (comma separated)</label>
                  <input
                    value={form.metadata}
                    onChange={(event) =>
                      setBlogsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, metadata: event.target.value },
                      }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Cover Image</label>
                  <input
                    key={fileKey}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setBlogsState((prev) => ({
                        ...prev,
                        form: { ...prev.form, image: event.target.files[0] || null },
                      }))
                    }
                    required={!editingId}
                  />
                  {editingId && form.image === null && (
                    <small className="muted">
                      Current Image:{" "}
                      {blogs.find((blog) => blog._id === editingId)?.imageUrl || "N/A"}
                    </small>
                  )}
                </div>
                <div className="form-actions">
                  <button className="primary" type="submit" disabled={loading}>
                    {editingId ? "Save changes" : "Create blog"}
                  </button>
                  <button className="ghost" type="button" onClick={resetForm} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
          </Modal>

          <div className="blog-list">
            <div className="blog-list-header">
              <div>
                <h2>Blogs</h2>
                <p className="muted">Total {filteredBlogs.length}</p>
              </div>
              <div className="filters">
                <input
                  value={searchTitle}
                  onChange={(event) => {
                    setSearchTitle(event.target.value);
                    updateState({ page: 1 });
                  }}
                  placeholder="Search by title..."
                  disabled={loading}
                />
                <select
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(event.target.value);
                    updateState({ page: 1 });
                  }}
                  disabled={loading}
                >
                  <option value="">All categories</option>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button className="ghost" type="button" onClick={loadBlogs} disabled={loading}>
                  <span className="button-icon">
                    <FiRefreshCcw aria-hidden />
                  </span>
                  Refresh
                </button>
              </div>
            </div>
            {paginatedBlogs.map((blog) => (
              <article key={blog._id} className="blog-item">
                <img src={blog.imageUrl} alt={blog.title} className="blog-cover" />
                <div className="blog-body">
                  <div className="blog-title-row">
                    <h3>
                      <span className="muted">Title: </span>
                      {blog.title}
                    </h3>
                    <span className="blog-tag">{blog.category}</span>
                  </div>
                  <p className="muted blog-excerpt">
                    <span className="muted">Description: </span>
                    {stripHtml(blog.description)}
                  </p>
                  <div className="blog-meta">
                    <span>
                      <span className="muted">Author: </span>
                      {blog.writtenBy}
                    </span>
                    <span>
                      <span className="muted">Date: </span>
                      {blog.createdAt
                        ? new Date(blog.createdAt).toLocaleDateString()
                        : "No date"}
                    </span>
                    <span>
                      <span className="muted">Comments: </span>
                      {(blog.comments || []).length}
                    </span>
                  </div>
                  <p className="blog-tip">
                    <span className="muted">Tip: </span>
                    {blog.quickClinicalTip}
                  </p>
                </div>
                <div className="blog-actions">
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => handleEdit(blog)}
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
                    onClick={() => handleDelete(blog._id)}
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
            {!filteredBlogs.length && <p className="muted">No blog entries yet.</p>}
          </div>
          {filteredBlogs.length > pageSize && (
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
        <LoadingOverlay active={loading} />
      </div>
    </section>
  );
};

export default BlogsPage;
