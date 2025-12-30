import { useEffect } from "react";
import { toast } from "react-toastify";
import { FiRefreshCcw } from "react-icons/fi";
import { testimonialsApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { useAdminState } from "../context/AdminState.jsx";

const TestimonialsPage = () => {
  const { testimonialsState, setTestimonialsState } = useAdminState();
  const { testimonials, loading } = testimonialsState;

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

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Testimonials</p>
          <h1>Patient Testimonials</h1>
          <p className="subhead">Review and manage feedback highlights.</p>
        </div>
        <button className="ghost" type="button" onClick={loadTestimonials} disabled={loading}>
          <span className="button-icon">
            <FiRefreshCcw aria-hidden />
          </span>
          Refresh
        </button>
      </div>

      <div className={loading ? "page-body is-loading" : "page-body"}>
        <div className="page-content">
          <div className="card list">
            <div className="card-header">
              <h2>Testimonials</h2>
              <span className="muted">{testimonials.length} total</span>
            </div>
            <ul>
              {testimonials.map((item) => (
                <li key={item._id} className="list-item">
                  <div>
                    <h3>{item.fullName}</h3>
                    <p className="muted">Rating: {item.rating}</p>
                    <p>{item.message}</p>
                  </div>
                  <div className="list-actions">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.fullName} />}
                  </div>
                </li>
              ))}
              {!testimonials.length && <li>No testimonials yet.</li>}
            </ul>
          </div>
        </div>
        <LoadingOverlay active={loading} />
      </div>
    </section>
  );
};

export default TestimonialsPage;
