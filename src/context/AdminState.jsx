import { createContext, useContext, useState } from "react";

export const initialCallbackForm = {
  fullName: "",
  phoneNumber: "",
  email: "",
  location: "kolkata",
  description: "",
  image: null,
};

export const initialServiceForm = {
  title: "",
  description: "",
  image: null,
};

export const initialGalleryForm = {
  description: "",
  tags: "",
  image: null,
};

export const initialFaqForm = {
  title: "",
  question: "",
  answer: "",
  tags: "",
  metadata: "",
  link: "",
  image: null,
};

export const initialBlogForm = {
  title: "",
  description: "",
  category: "cancer",
  writtenBy: "",
  quickClinicalTip: "",
  metadata: "",
  image: null,
};

export const initialTipForm = {
  title: "",
  text: "",
  image: null,
};

const AdminStateContext = createContext(null);

export const AdminStateProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem("adminToken");
    const storedUser = localStorage.getItem("adminUser");
    let user = null;
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch {
        user = null;
      }
    }
    return { token, user };
  });

  const [servicesState, setServicesState] = useState({
    services: [],
    form: initialServiceForm,
    fileKey: 0,
    editingId: "",
    showForm: false,
    page: 1,
    pageSize: 3,
    loading: false,
  });

  const [callbacksState, setCallbacksState] = useState({
    callbacks: [],
    form: initialCallbackForm,
    fileKey: 0,
    editStates: {},
    showForm: false,
    editingId: "",
    page: 1,
    pageSize: 3,
    loading: false,
  });

  const [galleryState, setGalleryState] = useState({
    items: [],
    form: initialGalleryForm,
    filter: "",
    fileKey: 0,
    showForm: false,
    editingId: "",
    page: 1,
    pageSize: 3,
    loading: false,
  });

  const [faqsState, setFaqsState] = useState({
    faqs: [],
    form: initialFaqForm,
    search: "",
    tagFilter: "",
    fileKey: 0,
    showForm: false,
    editingId: "",
    page: 1,
    pageSize: 3,
    loading: false,
  });

  const [blogsState, setBlogsState] = useState({
    blogs: [],
    form: initialBlogForm,
    showForm: false,
    editingId: "",
    fileKey: 0,
    page: 1,
    pageSize: 3,
    loading: false,
  });

  const [newsletterState, setNewsletterState] = useState({
    subscriptions: [],
    form: { email: "" },
    showForm: false,
    editingId: "",
    page: 1,
    pageSize: 3,
    loading: false,
  });

  const [testimonialsState, setTestimonialsState] = useState({
    testimonials: [],
    form: { fullName: "", rating: "5", message: "", image: null },
    showForm: false,
    editingId: "",
    fileKey: 0,
    page: 1,
    pageSize: 3,
    loading: false,
  });

  const [tipsState, setTipsState] = useState({
    tips: [],
    form: initialTipForm,
    showForm: false,
    editingId: "",
    fileKey: 0,
    page: 1,
    pageSize: 3,
    loading: false,
  });

  return (
    <AdminStateContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileNavOpen,
        setMobileNavOpen,
        theme,
        setTheme,
        authState,
        setAuthState,
        servicesState,
        setServicesState,
        callbacksState,
        setCallbacksState,
        galleryState,
        setGalleryState,
        faqsState,
        setFaqsState,
        blogsState,
        setBlogsState,
        newsletterState,
        setNewsletterState,
        testimonialsState,
        setTestimonialsState,
        tipsState,
        setTipsState,
      }}
    >
      {children}
    </AdminStateContext.Provider>
  );
};

export const useAdminState = () => {
  const context = useContext(AdminStateContext);
  if (!context) {
    throw new Error("useAdminState must be used within AdminStateProvider");
  }
  return context;
};
