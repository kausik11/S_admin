import { useEffect } from "react";
import { toast } from "react-toastify";
import { FiRefreshCcw } from "react-icons/fi";
import { newsletterApi } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { useAdminState } from "../context/AdminState.jsx";

const NewsletterPage = () => {
  const { newsletterState, setNewsletterState } = useAdminState();
  const { subscriptions, loading } = newsletterState;

  const updateState = (updates) =>
    setNewsletterState((prev) => ({ ...prev, ...updates }));

  const loadSubscriptions = async () => {
    updateState({ loading: true });
    try {
      const data = await newsletterApi.list();
      updateState({ subscriptions: data });
    } catch (err) {
      toast.error(err.message);
    } finally {
      updateState({ loading: false });
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
        </div>
        <LoadingOverlay active={loading} />
      </div>
    </section>
  );
};

export default NewsletterPage;
