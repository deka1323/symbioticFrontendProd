import React, { useEffect, useState, useMemo } from "react";
import { Baby, Download } from "lucide-react";
import AdvancedTable from "../common/AdvancedTable";
import { getExpectedDeliveryReports } from "../../actions/reportActions";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const ExpectedDeliveryReport = ({ selectedFarm, selectedMonth, selectedYear }) => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [breedFilter, setBreedFilter] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch expected delivery reports
    useEffect(() => {
        if (!selectedFarm) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getExpectedDeliveryReports(selectedFarm, selectedMonth, selectedYear);
                setData(Array.isArray(res) ? res : []);
            } catch (err) {
                console.error("Error fetching expected delivery reports:", err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedFarm, selectedMonth, selectedYear]);

    // Extract unique breeds safely
    const breedOptions = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return [];
        const breeds = new Set(data.map((item) => item.sowBreed).filter(Boolean));
        return Array.from(breeds);
    }, [data]);

    // Apply filter
    useEffect(() => {
        if (!Array.isArray(data)) return setFilteredData([]);
        if (!breedFilter) {
            setFilteredData(data);
        } else {
            setFilteredData(data.filter((item) => item.sowBreed === breedFilter));
        }
    }, [data, breedFilter]);

    // CSV download function
    const downloadCSV = (rows, filename) => {
        if (!rows || rows.length === 0) return;

        const csvContent = [
            Object.keys(rows[0]).join(","), // headers
            ...rows.map((row) => Object.values(row).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const columns = [
        { key: "sowId", label: "Sow ID", sortable: true },
        { key: "boarId", label: "Boar ID", sortable: true },
        { key: "matingDate", label: "Mating Date", sortable: true },
        { key: "sowBreed", label: "Sow Breed", sortable: true },
        { key: "expectedDate", label: "Expected Delivery", sortable: true },
    ];

    // Handle farm loading
    if (!selectedFarm) {
        return (
            <div className="flex justify-center items-center p-6">
                <p className="text-gray-500 animate-pulse">Loading farm data...</p>
            </div>
        );
    }

    // Handle data loading
    if (loading) {
        return (
            <div className="flex justify-center items-center p-6">
                <p className="text-gray-500 animate-pulse">Fetching expected delivery reports...</p>
            </div>
        );
    }

    // Handle no data
    if (!loading && data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                <p>No expected deliveries found for {months[selectedMonth]} {selectedYear}.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Baby className="h-6 w-6 text-pink-600 mr-2" />
                    Expected Deliveries - {months[selectedMonth]} {selectedYear}
                </h3>
                <div className="flex space-x-2">
                    {/* Breed filter dropdown */}
                    {breedOptions.length > 0 && (
                        <select
                            value={breedFilter}
                            onChange={(e) => setBreedFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="">All Breeds</option>
                            {breedOptions.map((breed) => (
                                <option key={breed} value={breed}>
                                    {breed}
                                </option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={() => downloadCSV(filteredData, "expected-deliveries")}
                        className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors duration-200"
                    >
                        <Download className="h-4 w-4" />
                        <span>Download CSV</span>
                    </button>
                </div>
            </div>

            <AdvancedTable
                data={filteredData}
                columns={columns}
                searchPlaceholder="Search by Sow ID..."
                searchKey="sowId"
            />
        </div>
    );
};

export default ExpectedDeliveryReport;
