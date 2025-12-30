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

const AdminStateContext = createContext(null);

export const AdminStateProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState("light");

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
    loading: false,
  });

  const [galleryState, setGalleryState] = useState({
    items: [],
    form: initialGalleryForm,
    filter: "",
    fileKey: 0,
    showForm: false,
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
    loading: false,
  });

  const [blogsState, setBlogsState] = useState({
    blogs: [],
    form: initialBlogForm,
    showForm: false,
    editingId: "",
    fileKey: 0,
    loading: false,
  });

  const [newsletterState, setNewsletterState] = useState({
    subscriptions: [],
    loading: false,
  });

  const [testimonialsState, setTestimonialsState] = useState({
    testimonials: [],
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
