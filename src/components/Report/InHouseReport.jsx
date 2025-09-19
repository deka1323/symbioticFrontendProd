import React, { useEffect, useState, useMemo } from "react";
import { Baby, Download, Filter } from "lucide-react";
import AdvancedTable from "../common/AdvancedTable";
import { getAllActiveInHouseRecords } from "../../actions/reportActions";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const InHouseReport = ({ selectedFarm, selectedMonth, selectedYear }) => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);

    // Fetch active in-house records
    useEffect(() => {
        if (!selectedFarm) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getAllActiveInHouseRecords(selectedFarm);
                const validData = Array.isArray(res.data) ? res.data : [];

                console.log("res ->", res)


                setData(validData);
            } catch (err) {
                console.error("Error fetching InHouse reports:", err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedFarm]);



    // Filtering logic
    useEffect(() => {
        if (!Array.isArray(data)) return setFilteredData([]);

        let result = [...data];

        if (!showAll) {
            // Step 2: Month-Year filter on GSI1SK
            if (selectedMonth != null && selectedYear) {
                const paddedMonth = String(selectedMonth + 1).padStart(2, "0"); // if month is 0–11
                const formatedDate = `${selectedYear}-${paddedMonth}`;

                result = result.filter((item) =>
                    item.GSI1SK?.startsWith(`DATE#${formatedDate}`)
                );
            }
        }

        console.log("changing data ->", result)
        setFilteredData(result);
    }, [data, selectedMonth, selectedYear, showAll]);


    // CSV download
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
        { key: "pigId", label: "Pig ID", sortable: true },
        { key: "breed", label: "Boar ID", sortable: true },
        { key: "sex", label: "Sex", sortable: true },
        { key: "weight", label: "Weight", sortable: true },
        { key: "inDate", label: "In Date", sortable: true },
    ];

    // UI states
    if (!selectedFarm) {
        return (
            <div className="flex justify-center items-center p-6">
                <p className="text-gray-500 animate-pulse">Loading farm data...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6">
                <p className="text-gray-500 animate-pulse">Fetching expected InHouse reports...</p>
            </div>
        );
    }

    if (!loading && data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                <p>No InHouse Data for {months[selectedMonth]} {selectedYear}.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Baby className="h-6 w-6 text-pink-600 mr-2" />
                    In-House Report - {months[selectedMonth]} {selectedYear}
                </h3>
                <div className="flex space-x-2">

                    {/* Show all data button */}
                    <button
                        onClick={() => setShowAll((prev) => !prev)}
                        className="flex items-center space-x-1 border border-gray-300 px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 transition"
                    >
                        <Filter className="h-3 w-3" />
                        <span>{showAll ? "Show Filtered" : "Show All"}</span>
                    </button>

                    {/* Download CSV */}
                    <button
                        onClick={() => downloadCSV(filteredData, "expected-deliveries")}
                        className="flex items-center space-x-1 bg-pink-600 text-white px-3 py-1 rounded text-sm hover:bg-pink-700 transition"
                    >
                        <Download className="h-4 w-4" />
                        <span>CSV</span>
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

export default InHouseReport;
