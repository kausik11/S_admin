import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { testimonialsApi } from "../api";
import LoadingBar from "../components/LoadingBar";

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const data = await testimonialsApi.list();
      setTestimonials(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
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
          Refresh
        </button>
      </div>

      <LoadingBar active={loading} />

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
    </section>
  );
};

export default TestimonialsPage;
