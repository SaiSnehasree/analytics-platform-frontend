import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <div className="flex min-h-screen bg-slate-950">

            <Sidebar />

            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>

        </div>
    );
}