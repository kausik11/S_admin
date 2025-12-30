const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      payload && payload.message ? payload.message : "Request failed";
    throw new Error(message);
  }

  return payload;
};

const jsonRequest = (path, body) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const jsonUpdate = (path, body) =>
  request(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const formRequest = (path, method, body) =>
  request(path, {
    method,
    body,
  });

export const callbacksApi = {
  list: () => request("/api/callbacks"),
  create: (formData) => formRequest("/api/callbacks", "POST", formData),
  update: (id, body) => jsonUpdate(`/api/callbacks/${id}`, body),
};

export const galleryApi = {
  list: (tag) => request(tag ? `/api/gallery?tag=${encodeURIComponent(tag)}` : "/api/gallery"),
  create: (formData) => formRequest("/api/gallery", "POST", formData),
  update: (id, formData) => formRequest(`/api/gallery/${id}`, "PUT", formData),
  remove: (id) => request(`/api/gallery/${id}`, { method: "DELETE" }),
};

export const faqsApi = {
  list: (tag) => request(tag ? `/api/faqs?tag=${encodeURIComponent(tag)}` : "/api/faqs"),
  search: (query) => request(`/api/faqs/search?q=${encodeURIComponent(query)}`),
  create: (formData) => formRequest("/api/faqs", "POST", formData),
  update: (id, formData) => formRequest(`/api/faqs/${id}`, "PUT", formData),
  remove: (id) => request(`/api/faqs/${id}`, { method: "DELETE" }),
};

export const blogApi = {
  list: () => request("/api/blogs"),
};

export const servicesApi = {
  list: () => request("/api/services"),
  create: (formData) => formRequest("/api/services", "POST", formData),
  update: (id, formData) => formRequest(`/api/services/${id}`, "PUT", formData),
  remove: (id) => request(`/api/services/${id}`, { method: "DELETE" }),
};

export const testimonialsApi = {
  list: () => request("/api/testimonials"),
};

export const newsletterApi = {
  list: () => request("/api/newsletter"),
};
