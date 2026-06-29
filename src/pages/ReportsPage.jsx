import { useEffect, useState } from "react";
import api from "../services/api";

export default function ReportsPage() {

    const [reports, setReports] = useState([]);

    const [formData, setFormData] = useState({
        reportName: "",
        reportType: "",
        createdBy: ""
    });

    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get("/reports");
            setReports(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const createReport = async (e) => {
        e.preventDefault();

        try {
            await api.post("/reports", formData);

            setFormData({
                reportName: "",
                reportType: "",
                createdBy: ""
            });

            fetchReports();

        } catch (error) {
            console.error(error);
        }
    };

    const deleteReport = async (id) => {

        const confirmDelete = window.confirm(
            "Delete this report?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/reports/${id}`);
            fetchReports();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredReports = reports.filter(
        (report) =>
            report.reportName
                ?.toLowerCase()
                .includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">

            <h1 className="text-5xl font-bold mb-8">
                Reports Management
            </h1>

            {/* Create Report */}

            <div className="bg-slate-900 rounded-3xl p-6 mb-8">

                <h2 className="text-2xl font-semibold mb-4">
                    Create Report
                </h2>

                <form
                    onSubmit={createReport}
                    className="grid md:grid-cols-3 gap-4"
                >

                    <input
                        type="text"
                        placeholder="Report Name"
                        value={formData.reportName}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                reportName: e.target.value
                            })
                        }
                        className="bg-slate-800 p-3 rounded-xl"
                        required
                    />

                    <input
                        type="text"
                        placeholder="Report Type"
                        value={formData.reportType}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                reportType: e.target.value
                            })
                        }
                        className="bg-slate-800 p-3 rounded-xl"
                        required
                    />

                    <input
                        type="text"
                        placeholder="Created By"
                        value={formData.createdBy}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                createdBy: e.target.value
                            })
                        }
                        className="bg-slate-800 p-3 rounded-xl"
                        required
                    />

                    <button
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-xl"
                    >
                        Create Report
                    </button>

                </form>

            </div>

            {/* Search */}

            <input
                type="text"
                placeholder="Search Reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-8 w-full md:w-96"
            />

            {/* Reports Table */}

            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">

                <table className="w-full">

                    <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                        <th className="text-left p-4">
                            Report Name
                        </th>

                        <th className="text-left p-4">
                            Type
                        </th>

                        <th className="text-left p-4">
                            Created By
                        </th>

                        <th className="text-left p-4">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody>

                    {filteredReports.map((report) => (
                        <tr
                            key={report.id}
                            className="border-b border-slate-800"
                        >
                            <td className="p-4">
                                {report.reportName}
                            </td>

                            <td className="p-4">
                                {report.reportType}
                            </td>

                            <td className="p-4">
                                {report.createdBy}
                            </td>

                            <td className="p-4">

                                <button
                                    onClick={() =>
                                        deleteReport(report.id)
                                    }
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