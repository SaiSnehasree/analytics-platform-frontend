import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import TenantsPage from "./pages/TenantsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import DataSourcesPage from "./pages/DataSourcesPage";
import DashboardBuilderPage from "./pages/DashboardBuilderPage";
import EmbedConfigPage from "./pages/EmbedConfigPage";
import AnomalyHistoryPage from "./pages/AnomalyHistoryPage";
import OnboardingWizardPage from "./pages/OnboardingWizardPage";

import MainLayout from "./layouts/MainLayout";
import PrivateRoute from "./components/PrivateRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/onboarding" element={<PrivateRoute><OnboardingWizardPage /></PrivateRoute>} />

                {/* Protected Layout Routes */}
                <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                    <Route path="/dashboard"   element={<DashboardPage />} />
                    <Route path="/datasources" element={<DataSourcesPage />} />
                    <Route path="/reports"     element={<ReportsPage />} />
                    <Route path="/builder"     element={<DashboardBuilderPage />} />
                    <Route path="/embed"       element={<EmbedConfigPage />} />
                    <Route path="/anomalies"   element={<AnomalyHistoryPage />} />
                    <Route path="/tenants"     element={<TenantsPage />} />
                    <Route path="/settings"    element={<SettingsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;