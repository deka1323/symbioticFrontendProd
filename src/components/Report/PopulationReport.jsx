import React, { useState } from "react";
import { BarChart3, TrendingUp, Download, FileText } from "lucide-react";

const PopulationReport = ({ showDetails }) => {
    const [stats, setStats] = useState({
        total: 0,
        boar: 0,
        sow: 0,
        breeds: {
            Landrace: 0,
            Yorkshire: 0,
            Duroc: 0,
            Hampshire: 0,
        },
    });

    // CSV download function
    const downloadCSV = (data, filename) => {
        // Convert object into flat CSV rows
        const flattenObject = (obj) => {
            const flat = {};
            Object.keys(obj).forEach((key) => {
                if (typeof obj[key] === "object" && obj[key] !== null) {
                    Object.keys(obj[key]).forEach((subKey) => {
                        flat[`${key}_${subKey}`] = obj[key][subKey];
                    });
                } else {
                    flat[key] = obj[key];
                }
            });
            return flat;
        };

        const flattenedData = data.map(flattenObject);

        // Build CSV string
        const header = Object.keys(flattenedData[0]).join(",");
        const rows = flattenedData.map((row) =>
            Object.values(row)
                .map((val) => `"${val}"`) // wrap in quotes to avoid CSV break
                .join(",")
        );
        const csvContent = [header, ...rows].join("\n");

        // Download logic
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
                    Pig Population Report
                </h3>

                {/* Download */}
                <button
                    onClick={() => downloadCSV([stats], "population-report")}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    <Download className="h-4 w-4" />
                    <span>Download CSV</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total */}
                <div
                    className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                    onClick={() => showDetails("total", "Total Pigs")}
                >
                    <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <div className="text-sm font-medium text-blue-600">Total Pigs</div>
                            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                        </div>
                    </div>
                </div>

                {/* Boars */}
                <div
                    className="bg-green-50 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors duration-200"
                    onClick={() => showDetails("boar", "Boars")}
                >
                    <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <div className="text-sm font-medium text-green-600">Boars</div>
                            <div className="text-2xl font-bold text-green-900">{stats.boar}</div>
                        </div>
                    </div>
                </div>

                {/* Sows */}
                <div
                    className="bg-purple-50 rounded-lg p-4 cursor-pointer hover:bg-purple-100 transition-colors duration-200"
                    onClick={() => showDetails("sow", "Sows")}
                >
                    <div className="flex items-center">
                        <FileText className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                            <div className="text-sm font-medium text-purple-600">Sows</div>
                            <div className="text-2xl font-bold text-purple-900">{stats.sow}</div>
                        </div>
                    </div>
                </div>

                {/* Dead */}
                {/* <div
                    className="bg-red-50 rounded-lg p-4 cursor-pointer hover:bg-red-100 transition-colors duration-200"
                    onClick={() => showDetails("dead", "Dead Pigs")}
                >
                    <div className="flex items-center">
                        <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">×</span>
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-red-600">Dead</div>
                            <div className="text-2xl font-bold text-red-900">{stats.dead}</div>
                        </div>
                    </div>
                </div> */}

                {/* Sold */}
                {/* <div
                    className="bg-orange-50 rounded-lg p-4 cursor-pointer hover:bg-orange-100 transition-colors duration-200"
                    onClick={() => showDetails("sold", "Sold Pigs")}
                >
                    <div className="flex items-center">
                        <FileText className="h-8 w-8 text-orange-600" />
                        <div className="ml-4">
                            <div className="text-sm font-medium text-orange-600">Sold</div>
                            <div className="text-2xl font-bold text-orange-900">{stats.sold}</div>
                        </div>
                    </div>
                </div> */}

                {/* In-House */}
                {/* <div
                    className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => showDetails("inhouse", "In-House")}
                >
                    <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-gray-600" />
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-600">In-House</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.inhouse}</div>
                        </div>
                    </div>
                </div> */}

                {/* Dynamic Breeds */}
                {Object.entries(stats.breeds).map(([breed, count]) => (
                    <div
                        key={breed}
                        className="bg-yellow-50 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors duration-200"
                        onClick={() => showDetails(breed.toLowerCase(), `${breed} Breed`)}
                    >
                        <div className="flex items-center">
                            <BarChart3 className="h-8 w-8 text-yellow-600" />
                            <div className="ml-4">
                                <div className="text-sm font-medium text-yellow-600">{breed}</div>
                                <div className="text-2xl font-bold text-yellow-900">{count}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PopulationReport;