import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { newsletterApi } from "../api";
import LoadingBar from "../components/LoadingBar";

const NewsletterPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await newsletterApi.list();
      setSubscriptions(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Newsletter</p>
          <h1>Subscriber List</h1>
          <p className="subhead">Monitor new newsletter signups.</p>
        </div>
        <button className="ghost" type="button" onClick={loadSubscriptions} disabled={loading}>
          Refresh
        </button>
      </div>

      <LoadingBar active={loading} />

      <div className="card list">
        <div className="card-header">
          <h2>Subscriptions</h2>
          <span className="muted">{subscriptions.length} total</span>
        </div>
        <ul>
          {subscriptions.map((subscription) => (
            <li key={subscription._id} className="list-item">
              <div>
                <h3>{subscription.email}</h3>
                <p className="muted">
                  {subscription.createdAt
                    ? new Date(subscription.createdAt).toLocaleString()
                    : "Pending timestamp"}
                </p>
              </div>
            </li>
          ))}
          {!subscriptions.length && <li>No subscribers yet.</li>}
        </ul>
      </div>
    </section>
  );
};

export default NewsletterPage;
