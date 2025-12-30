import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
  update: (id, body) =>
    api.put(`/api/callbacks/${id}`, body).then((res) => res.data),
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
};

export const newsletterApi = {
  list: () => api.get("/api/newsletter").then((res) => res.data),
};
