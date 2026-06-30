import api from "./api";

export const dataSourceApi = {
    list: () => api.get("/datasources"),
    uploadCsv: (name, file) => {
        const form = new FormData();
        form.append("name", name);
        form.append("file", file);
        return api.post("/datasources/csv", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    addGoogleSheet: (name, url) =>
        api.post("/datasources/sheets", { name, url }),
    createWebhook: (name) =>
        api.post("/datasources/webhook", { name }),
    delete: (id) => api.delete(`/datasources/${id}`),
    getMetrics: (id) => api.get(`/datasources/${id}/metrics`),
};

export const embedApi = {
    generate: (allowedDomains, allowedMetrics, theme) =>
        api.post("/embed/generate", { allowedDomains, allowedMetrics, theme }),
    list: () => api.get("/embed/configs"),
    revoke: (id) => api.delete(`/embed/configs/${id}`),
};

export const anomalyApi = {
    list: (page = 0, size = 20) =>
        api.get(`/anomalies?page=${page}&size=${size}`),
    stats: () => api.get("/anomalies/stats"),
};
