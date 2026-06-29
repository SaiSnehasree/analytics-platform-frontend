import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import TenantsPage from "./pages/TenantsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

import MainLayout from "./layouts/MainLayout";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Public Routes */}
                <Route path="/" element={<LoginPage />} />

                <Route path="/signup" element={<SignupPage />} />

                {/* Layout Routes */}
                <Route element={<MainLayout />}>

                    <Route
                        path="/dashboard"
                        element={<DashboardPage />}
                    />

                    <Route
                        path="/tenants"
                        element={<TenantsPage />}
                    />

                    <Route
                        path="/reports"
                        element={<ReportsPage />}
                    />

                    <Route
                        path="/settings"
                        element={<SettingsPage />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;