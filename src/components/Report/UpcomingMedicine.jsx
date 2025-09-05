// UpcomingMedicine.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Syringe, Download, Loader2 } from "lucide-react";
import AdvancedTable from "../common/AdvancedTable";
import { getPigMedicineReports } from "../../actions/reportActions";
// import { getPigMedicineReports } from "../api/medicines";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const UpcomingMedicine = ({ selectedFarm, selectedMonth, selectedYear }) => {
    const [data, setData] = useState([]);
    const [medicineFilter, setMedicineFilter] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch medicine report whenever farm/month/year changes
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedFarm) return; // skip if farm not ready
            setLoading(true);
            try {
                const res = await getPigMedicineReports(
                    selectedFarm,
                    selectedMonth,
                    selectedYear
                );
                setData(Array.isArray(res) ? res : []); // ensure always array
            } catch (error) {
                console.error("Error fetching medicine reports:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedFarm, selectedMonth, selectedYear]);

    // Extract unique medicine types safely
    const medicineTypes = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return [];
        const types = new Set(
            data
                .filter((item) => item && item.medicineType) // avoid null/undefined
                .map((item) => item.medicineType)
        );
        return Array.from(types);
    }, [data]);

    // Apply filter safely
    const filteredData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        if (!medicineFilter) return data;
        return data.filter((item) => item?.medicineType === medicineFilter);
    }, [data, medicineFilter]);

    // CSV Download function with safety checks
    const downloadCSV = (rows, filename) => {
        if (!Array.isArray(rows) || rows.length === 0) {
            alert("No data available to download.");
            return;
        }
        try {
            const header = Object.keys(rows[0]).join(",");
            const csvRows = rows.map((row) =>
                Object.values(row)
                    .map((val) => `"${val ?? ""}"`)
                    .join(",")
            );
            const csvContent = [header, ...csvRows].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("CSV download failed:", err);
            alert("Error while generating CSV.");
        }
    };

    const columns = [
        { key: "pigId", label: "Pig ID", sortable: true },
        { key: "medicineType", label: "Medicine Type", sortable: true },
        { key: "nextDueDate", label: "Due Date", sortable: true },
    ];

    // 🌀 If farm not ready
    if (!selectedFarm) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center">
                <Loader2 className="h-6 w-6 text-green-600 animate-spin mr-2" />
                <span className="text-gray-600">Loading farm data...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Syringe className="h-6 w-6 text-green-600 mr-2" />
                    Upcoming Vaccinations - {months[selectedMonth]} {selectedYear}
                </h3>

                <div className="flex space-x-2">
                    {/* Medicine Filter Dropdown */}
                    <select
                        value={medicineFilter}
                        onChange={(e) => setMedicineFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={loading || data.length === 0}
                    >
                        <option value="">All Medicines</option>
                        {medicineTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>

                    {/* Download CSV */}
                    <button
                        onClick={() => downloadCSV(filteredData, "upcoming-Medicine")}
                        disabled={loading || filteredData.length === 0}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${loading || filteredData.length === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                    >
                        <Download className="h-4 w-4" />
                        <span>Download CSV</span>
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center py-10 text-gray-600">
                    <Loader2 className="h-6 w-6 text-green-600 animate-spin mr-2" />
                    Fetching upcoming medicines...
                </div>
            ) : filteredData.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    No upcoming medicines found for this period.
                </div>
            ) : (
                <AdvancedTable
                    data={filteredData}
                    columns={columns}
                    searchPlaceholder="Search by Pig ID..."
                    searchKey="pigId"
                />
            )}
        </div>
    );
};

export default UpcomingMedicine;
