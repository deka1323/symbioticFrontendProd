// ChangePigIdModal.jsx
import React, { useEffect, useState } from "react";
import { X, Download, ChevronDown } from "lucide-react";
import { getAllActiveLivingMales } from "../actions/dashboardActions";
import AdvancedTable from "./common/AdvancedTable";

const BoarModal = ({ selectedFarm, onClose }) => {
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [stageFilter, setStageFilter] = useState("all");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchTable = async () => {
            try {
                const res = await getAllActiveLivingMales();
                let data = Array.isArray(res.data) ? res.data : [];

                // filter only male boars
                data = data.filter(
                    (item) => item.sex?.toLowerCase() === "male" && item.isBoar === true
                );

                setTableData(data);
                setFilteredData(data);
            } catch (err) {
                console.error("Error fetching boar data:", err);
                setTableData([]);
                setFilteredData([]);
            }
        };
        fetchTable();
    }, []);

    // handle stage filtering
    useEffect(() => {
        if (stageFilter === "all") {
            setFilteredData(tableData);
        } else {
            setFilteredData(
                tableData.filter(
                    (item) => item.currentStage?.toLowerCase() === stageFilter
                )
            );
        }
    }, [stageFilter, tableData]);

    const downloadCSV = () => {
        if (!filteredData || filteredData.length === 0) return;
        const csvContent = [
            Object.keys(filteredData[0]).join(","),
            ...filteredData.map((row) => Object.values(row).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `boar_data.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const columns = [
        { key: "pigId", label: "Boar ID", sortable: true },
        { key: "breed", label: "Breed", sortable: true },
        { key: "dob", label: "Date Of Birth", sortable: true },
        { key: "sex", label: "Sex", sortable: true },
        { key: "currentStage", label: "Current Stage", sortable: true },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-6xl h-[90vh] flex flex-col relative">
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4 bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-800">Boar Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Boar Data
                            </h3>

                            <div className="flex flex-wrap gap-3 items-center">
                                {/* Stage filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 transition"
                                    >
                                        <span className="capitalize">
                                            {stageFilter === "all" ? "All Stages" : stageFilter}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            {["all", "breeding", "fattening", "nursery"].map(
                                                (stage) => (
                                                    <button
                                                        key={stage}
                                                        onClick={() => {
                                                            setStageFilter(stage);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 capitalize"
                                                    >
                                                        {stage === "all"
                                                            ? "All Stages"
                                                            : stage}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Download */}
                                <button
                                    onClick={downloadCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 transition"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Download CSV</span>
                                </button>
                            </div>
                        </div>

                        <AdvancedTable
                            data={filteredData}
                            columns={columns}
                            searchPlaceholder="Search by Boar ID..."
                            searchKey="pigId"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoarModal;
