import { useEffect, useState } from "react";
import api from "../services/api";

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [search, setSearch] = useState("");

    const [editingTenant, setEditingTenant] = useState(null);

    const [editForm, setEditForm] = useState({
        workspaceName: "",
        ownerName: "",
        email: "",
    });

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const response = await api.get("/tenants");
            setTenants(response.data);
        } catch (error) {
            console.error("Failed to fetch tenants:", error);
        }
    };

    const deleteTenant = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this tenant?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/tenants/${id}`);
            fetchTenants();
        } catch (error) {
            console.error("Failed to delete tenant:", error);
        }
    };

    const startEdit = (tenant) => {
        setEditingTenant(tenant.id);

        setEditForm({
            workspaceName: tenant.workspaceName || "",
            ownerName: tenant.ownerName || "",
            email: tenant.email || "",
        });
    };

    const saveEdit = async (id) => {
        try {
            await api.put(`/tenants/${id}`, editForm);

            setEditingTenant(null);

            fetchTenants();
        } catch (error) {
            console.error("Failed to update tenant:", error);
        }
    };

    const filteredTenants = tenants.filter(
        (tenant) =>
            tenant.workspaceName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            tenant.ownerName
                ?.toLowerCase()
                .includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">

            <h1 className="text-5xl font-bold mb-8">
                Tenant Management
            </h1>

            <input
                type="text"
                placeholder="Search tenants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-8 w-full md:w-96"
            />

            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">

                <table className="w-full">

                    <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                        <th className="text-left p-4">Workspace</th>
                        <th className="text-left p-4">Owner</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Created</th>
                        <th className="text-left p-4">Actions</th>
                    </tr>
                    </thead>

                    <tbody>

                    {filteredTenants.map((tenant) => (
                        <tr
                            key={tenant.id}
                            className="border-b border-slate-800 hover:bg-slate-800/50"
                        >
                            <td className="p-4 font-medium">
                                {editingTenant === tenant.id ? (
                                    <input
                                        value={editForm.workspaceName}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                workspaceName: e.target.value,
                                            })
                                        }
                                        className="bg-slate-800 px-3 py-2 rounded w-full"
                                    />
                                ) : (
                                    tenant.workspaceName
                                )}
                            </td>

                            <td className="p-4">
                                {editingTenant === tenant.id ? (
                                    <input
                                        value={editForm.ownerName}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                ownerName: e.target.value,
                                            })
                                        }
                                        className="bg-slate-800 px-3 py-2 rounded w-full"
                                    />
                                ) : (
                                    tenant.ownerName
                                )}
                            </td>

                            <td className="p-4">
                                {editingTenant === tenant.id ? (
                                    <input
                                        value={editForm.email}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                email: e.target.value,
                                            })
                                        }
                                        className="bg-slate-800 px-3 py-2 rounded w-full"
                                    />
                                ) : (
                                    tenant.email
                                )}
                            </td>

                            <td className="p-4">
                                {tenant.createdAt
                                    ? tenant.createdAt.substring(0, 10)
                                    : "N/A"}
                            </td>

                            <td className="p-4 flex gap-2">

                                {editingTenant === tenant.id ? (
                                    <button
                                        onClick={() => saveEdit(tenant.id)}
                                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl"
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => startEdit(tenant)}
                                        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl"
                                    >
                                        Edit
                                    </button>
                                )}

                                <button
                                    onClick={() => deleteTenant(tenant.id)}
                                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
                                >
                                    Delete
                                </button>

                            </td>
                        </tr>
                    ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}