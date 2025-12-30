import { useMemo, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BlogsPage from "./pages/BlogsPage";
import CallbacksPage from "./pages/CallbacksPage";
import FaqsPage from "./pages/FaqsPage";
import GalleryPage from "./pages/GalleryPage";
import NewsletterPage from "./pages/NewsletterPage";
import ServicesPage from "./pages/ServicesPage";
import TestimonialsPage from "./pages/TestimonialsPage";

const App = () => {
  const [activeRoute, setActiveRoute] = useState("services");

  const routes = useMemo(
    () => [
      { id: "services", label: "Services", component: ServicesPage },
      { id: "testimonials", label: "Testimonials", component: TestimonialsPage },
      { id: "blogs", label: "Blogs", component: BlogsPage },
      { id: "newsletter", label: "Newsletter", component: NewsletterPage },
      { id: "gallery", label: "Gallery", component: GalleryPage },
      { id: "faqs", label: "FAQs", component: FaqsPage },
      { id: "callbacks", label: "Callbacks", component: CallbacksPage },
    ],
    []
  );

  const activeEntry = routes.find((route) => route.id === activeRoute) || routes[0];
  const ActivePage = activeEntry.component;

  return (
    <div className="layout">
      <Sidebar items={routes} activeId={activeEntry.id} onSelect={setActiveRoute} />
      <main className="content">
        <div className="content-inner">
          <ActivePage />
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;
