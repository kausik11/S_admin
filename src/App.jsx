import { useEffect, useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BlogsPage from "./pages/BlogsPage";
import CallbacksPage from "./pages/CallbacksPage";
import DashboardPage from "./pages/DashboardPage";
import FaqsPage from "./pages/FaqsPage";
import GalleryPage from "./pages/GalleryPage";
import NewsletterPage from "./pages/NewsletterPage";
import ServicesPage from "./pages/ServicesPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { authApi } from "./api";
import UsersPage from "./pages/UsersPage";
import {
  FiBookOpen,
  FiGrid,
  FiHelpCircle,
  FiImage,
  FiUsers,
  FiMail,
  FiMessageCircle,
  FiPhoneCall,
  FiTool,
} from "react-icons/fi";
import { useAdminState } from "./context/AdminState.jsx";

const App = () => {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileNavOpen,
    setMobileNavOpen,
    theme,
    setTheme,
    authState,
    setAuthState,
  } =
    useAdminState();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors to ensure local sign-out happens.
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      setAuthState({ token: null, user: null });
    }
  };

  const routes = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        icon: FiGrid,
        component: DashboardPage,
      },
      {
        id: "blogs",
        label: "Blogs",
        path: "/blogs",
        icon: FiBookOpen,
        component: BlogsPage,
      },
      {
        id: "services",
        label: "Services",
        path: "/services",
        icon: FiTool,
        component: ServicesPage,
      },
      {
        id: "users",
        label: "Users",
        path: "/users",
        icon: FiUsers,
        component: UsersPage,
      },
      {
        id: "gallery",
        label: "Gallery",
        path: "/gallery",
        icon: FiImage,
        component: GalleryPage,
      },
      {
        id: "faqs",
        label: "FAQs",
        path: "/faqs",
        icon: FiHelpCircle,
        component: FaqsPage,
      },
      {
        id: "newsletter",
        label: "Newsletter",
        path: "/newsletter",
        icon: FiMail,
        component: NewsletterPage,
      },
      {
        id: "testimonials",
        label: "Testimonials",
        path: "/testimonials",
        icon: FiMessageCircle,
        component: TestimonialsPage,
      },
      {
        id: "callbacks",
        label: "Callbacks",
        path: "/callbacks",
        icon: FiPhoneCall,
        component: CallbacksPage,
      },
    ],
    []
  );
  const adminRoles = ["admin", "superadmin", "administrator"];
  const isAdmin = adminRoles.includes(authState?.user?.role);
  const visibleRoutes = isAdmin
    ? routes
    : routes.filter((route) => route.id !== "users");

  if (!authState?.token) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    );
  }

  return (
    <div
      className={
        sidebarCollapsed
          ? "layout layout-collapsed"
          : mobileNavOpen
            ? "layout layout-mobile-open"
            : "layout"
      }
    >
      <Sidebar
        items={routes}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <main className="content">
        <Topbar
          onMenuClick={() => setMobileNavOpen(true)}
          theme={theme}
          onThemeToggle={() =>
            setTheme((prev) => (prev === "light" ? "dark" : "light"))
          }
          user={authState?.user}
          onLogout={handleLogout}
        />
        <div className="content-inner">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/dashboard" replace />} />
            {visibleRoutes.map((route) => (
              <Route key={route.id} path={route.path} element={<route.component />} />
            ))}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;
