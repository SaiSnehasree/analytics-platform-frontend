import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import WorkspacePage from "./pages/WorkspacePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import DataSourcesPage from "./pages/DataSourcesPage";
import DashboardBuilderPage from "./pages/DashboardBuilderPage";
import EmbedConfigPage from "./pages/EmbedConfigPage";
import AnomalyHistoryPage from "./pages/AnomalyHistoryPage";
import OnboardingWizardPage from "./pages/OnboardingWizardPage";
import MetricGoalsPage from "./pages/MetricGoalsPage";
import ComputedMetricsPage from "./pages/ComputedMetricsPage";
import ApiKeysPage from "./pages/ApiKeysPage";

import MainLayout from "./layouts/MainLayout";
import PrivateRoute from "./components/PrivateRoute";
import { ToastProvider } from "./context/ToastContext";

function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/onboarding" element={<PrivateRoute><OnboardingWizardPage /></PrivateRoute>} />

                    {/* Protected Layout Routes */}
                    <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                        <Route path="/dashboard"        element={<DashboardPage />} />
                        <Route path="/datasources"      element={<DataSourcesPage />} />
                        <Route path="/reports"          element={<ReportsPage />} />
                        <Route path="/builder"          element={<DashboardBuilderPage />} />
                        <Route path="/embed"            element={<EmbedConfigPage />} />
                        <Route path="/anomalies"        element={<AnomalyHistoryPage />} />
                        <Route path="/workspace"        element={<WorkspacePage />} />
                        <Route path="/settings"         element={<SettingsPage />} />
                        <Route path="/goals"            element={<MetricGoalsPage />} />
                        <Route path="/computed-metrics" element={<ComputedMetricsPage />} />
                        <Route path="/api-keys"         element={<ApiKeysPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;