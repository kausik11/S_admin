import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { blogApi } from "../api";
import LoadingBar from "../components/LoadingBar";

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogApi.list();
      setBlogs(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Blogs</p>
          <h1>Clinical Insights</h1>
          <p className="subhead">Track blog entries and editorial highlights.</p>
        </div>
        <button className="ghost" type="button" onClick={loadBlogs} disabled={loading}>
          Refresh
        </button>
      </div>

      <LoadingBar active={loading} />

      <div className="card list">
        <div className="card-header">
          <h2>Latest posts</h2>
          <span className="muted">{blogs.length} total</span>
        </div>
        <ul>
          {blogs.map((blog) => (
            <li key={blog._id} className="list-item">
              <div>
                <h3>{blog.title}</h3>
                <p className="muted">
                  {blog.category} - {blog.writtenBy}
                </p>
                <p>{blog.description}</p>
                <p className="meta">Quick tip: {blog.quickClinicalTip}</p>
              </div>
              <div className="list-actions">
                {blog.imageUrl && <img src={blog.imageUrl} alt={blog.title} />}
              </div>
            </li>
          ))}
          {!blogs.length && <li>No blog entries yet.</li>}
        </ul>
      </div>
    </section>
  );
};

export default BlogsPage;
