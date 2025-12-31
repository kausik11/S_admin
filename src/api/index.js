import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    }
    const message =
      error?.response?.data?.message || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

const formConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const callbacksApi = {
  list: () => api.get("/api/callbacks").then((res) => res.data),
  create: (formData) =>
    api.post("/api/callbacks", formData, formConfig).then((res) => res.data),
  update: (id, body) => {
    const config = body instanceof FormData ? formConfig : undefined;
    return api.put(`/api/callbacks/${id}`, body, config).then((res) => res.data);
  },
  remove: (id) => api.delete(`/api/callbacks/${id}`).then((res) => res.data),
};

export const galleryApi = {
  list: (tag) =>
    api
      .get("/api/gallery", { params: tag ? { tag } : undefined })
      .then((res) => res.data),
  create: (formData) =>
    api.post("/api/gallery", formData, formConfig).then((res) => res.data),
  update: (id, formData) =>
    api.put(`/api/gallery/${id}`, formData, formConfig).then((res) => res.data),
  remove: (id) => api.delete(`/api/gallery/${id}`).then((res) => res.data),
};

export const faqsApi = {
  list: (tag) =>
    api
      .get("/api/faqs", { params: tag ? { tag } : undefined })
      .then((res) => res.data),
  search: (query) =>
    api.get("/api/faqs/search", { params: { q: query } }).then((res) => res.data),
  create: (formData) =>
    api.post("/api/faqs", formData, formConfig).then((res) => res.data),
  update: (id, formData) =>
    api.put(`/api/faqs/${id}`, formData, formConfig).then((res) => res.data),
  remove: (id) => api.delete(`/api/faqs/${id}`).then((res) => res.data),
};

export const blogApi = {
  list: () => api.get("/api/blogs").then((res) => res.data),
  create: (formData) =>
    api.post("/api/blogs", formData, formConfig).then((res) => res.data),
  update: (id, formData) =>
    api.put(`/api/blogs/${id}`, formData, formConfig).then((res) => res.data),
  remove: (id) => api.delete(`/api/blogs/${id}`).then((res) => res.data),
};

export const servicesApi = {
  list: () => api.get("/api/services").then((res) => res.data),
  create: (formData) =>
    api.post("/api/services", formData, formConfig).then((res) => res.data),
  update: (id, formData) =>
    api.put(`/api/services/${id}`, formData, formConfig).then((res) => res.data),
  remove: (id) => api.delete(`/api/services/${id}`).then((res) => res.data),
};

export const testimonialsApi = {
  list: () => api.get("/api/testimonials").then((res) => res.data),
  create: (formData) =>
    api.post("/api/testimonials", formData, formConfig).then((res) => res.data),
  update: (id, formData) =>
    api.put(`/api/testimonials/${id}`, formData, formConfig).then((res) => res.data),
  remove: (id) => api.delete(`/api/testimonials/${id}`).then((res) => res.data),
};

export const newsletterApi = {
  list: () => api.get("/api/newsletter").then((res) => res.data),
  create: (body) => api.post("/api/newsletter", body).then((res) => res.data),
  update: (id, body) =>
    api.put(`/api/newsletter/${id}`, body).then((res) => res.data),
  remove: (id) => api.delete(`/api/newsletter/${id}`).then((res) => res.data),
};

export const authApi = {
  register: (body) => api.post("/api/auth/register", body).then((res) => res.data),
  login: (body) => api.post("/api/auth/login", body).then((res) => res.data),
  logout: () => api.post("/api/auth/logout").then((res) => res.data),
};

export const usersApi = {
  list: () => api.get("/api/users").then((res) => res.data),
  create: (body) => api.post("/api/users", body).then((res) => res.data),
  update: (id, body) => api.put(`/api/users/${id}`, body).then((res) => res.data),
  updatePassword: (id, body) =>
    api.put(`/api/users/${id}/password`, body).then((res) => res.data),
};
