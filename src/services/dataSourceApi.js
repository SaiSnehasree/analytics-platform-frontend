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
    addGoogleSheet: (name, url) => api.post("/datasources/sheets", { name, url }),
    createWebhook: (name) => api.post("/datasources/webhook", { name }),
    delete: (id) => api.delete(`/datasources/${id}`),
    getMetrics: (id) => api.get(`/datasources/${id}/metrics`),
    getAllMetrics: () => api.get("/metrics"),
};

export const embedApi = {
    generate: (allowedDomains, allowedMetrics, theme, customColor, logoUrl, fontFamily) =>
        api.post("/embed/generate", { allowedDomains, allowedMetrics, theme, customColor, logoUrl, fontFamily }),
    list: () => api.get("/embed/configs"),
    revoke: (id) => api.delete(`/embed/configs/${id}`),
};

export const anomalyApi = {
    list: (page = 0, size = 20) => api.get(`/anomalies?page=${page}&size=${size}`),
    stats: () => api.get("/anomalies/stats"),
};

export const goalsApi = {
    list: () => api.get("/goals"),
    save: (metricName, targetValue) => api.post("/goals", { metricName, targetValue }),
    delete: (id) => api.delete(`/goals/${id}`),
};

export const computedMetricsApi = {
    list: () => api.get("/computed-metrics"),
    save: (metricName, formula) => api.post("/computed-metrics", { metricName, formula }),
    delete: (id) => api.delete(`/computed-metrics/${id}`),
};

export const apiKeysApi = {
    getMyKey: () => api.get("/tenant/apikey"),
    regenerate: () => api.post("/tenant/apikey/regenerate"),
};

export const reportsApi = {
    list: () => api.get("/reports"),
    create: (reportName, reportType) => api.post("/reports", { reportName, reportType }),
    delete: (id) => api.delete(`/reports/${id}`),
};
