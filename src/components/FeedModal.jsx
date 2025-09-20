import React, { useEffect, useState, useMemo } from "react";
import {
    X,
    Download,
    ChevronDown,
    ChevronUp,
    BarChart2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
    getFeedingDataByMonth,
    updateFeedingData,
} from "../actions/dashboardActions";
import AdvancedTable from "./common/AdvancedTable";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const FeedModal = ({ selectedFarm, onClose }) => {
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = String(now.getFullYear());

    const [feedingDate, setFeedingDate] = useState("");
    const [feedingAmount, setFeedingAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [showChangeSection, setShowChangeSection] = useState(false);
    const [showGraph, setShowGraph] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const formatedDate = feedingDate
        ? new Date(feedingDate).toISOString().split("T")[0]
        : "";

    const fetchTable = async (month, year) => {
        try {
            const res = await getFeedingDataByMonth(selectedFarm, month, year);
            setTableData(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching Feed Data:", err);
            setTableData([]);
        }
    };

    useEffect(() => {
        fetchTable(selectedMonth, selectedYear);
    }, [selectedFarm, selectedMonth, selectedYear]);

    const handleSubmit = async () => {
        if (!feedingDate || !feedingAmount) {
            toast.error("Please fill both Date and Feed Amount!");
            return;
        }
        try {
            setLoading(true);
            const payload = {
                selectedFarm,
                feedingDate: formatedDate,
                feedingAmount,
            };
            const response = await updateFeedingData(payload);

            if (response.success) {
                toast.success(`Feeding Data updated for ${formatedDate}`);
                fetchTable(currentMonth, currentYear);
                setFeedingDate("");
                setFeedingAmount("");
                setShowChangeSection(false);
            } else {
                toast.error("Failed to update Feeding Data");
            }
        } catch (err) {
            console.error("Error Adding feeding Data", err);
            toast.error("Failed to Add Feeding Data");
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!tableData || tableData.length === 0) return;
        const csvContent = [
            Object.keys(tableData[0]).join(","),
            ...tableData.map((row) => Object.values(row).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `feeding-data-${selectedYear}-${selectedMonth}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const columns = [
        { key: "feedingDate", label: "Date", sortable: true },
        { key: "amount", label: "Amount (kg)", sortable: true },
        { key: "updatedAt", label: "Updated At", sortable: true },
    ];

    // Calculate Stats
    const { totalAmount, averageConsumption } = useMemo(() => {
        if (!tableData.length) return { totalAmount: 0, averageConsumption: 0 };
        const total = tableData.reduce(
            (sum, row) => sum + Number(row.amount || 0),
            0
        );
        const days = tableData.length;
        return {
            totalAmount: total,
            averageConsumption: (total / days).toFixed(2),
        };
    }, [tableData]);

    // Graph Data (day -> amount)
    const graphData = useMemo(() => {
        return tableData.map((row) => ({
            day: new Date(row.feedingDate).getDate(),
            amount: Number(row.amount || 0),
        }));
    }, [tableData]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[95%] max-w-6xl h-[90vh] flex flex-col relative">
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-800">Feed Management</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowChangeSection(!showChangeSection)}
                            className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
                        >
                            {showChangeSection ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                            <span>Add Feed</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
                    {/* Add Feed Section */}
                    {showChangeSection && (
                        <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                Add Feed
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="date"
                                    value={feedingDate}
                                    onChange={(e) => setFeedingDate(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Amount in Kg"
                                    value={feedingAmount}
                                    onChange={(e) => setFeedingAmount(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
                            >
                                {loading ? "Processing..." : "Submit"}
                            </button>
                        </div>
                    )}

                    {/* Stats Section */}
                    <div className="flex gap-4 mb-4">
                        <div className="bg-pink-50 border border-pink-200 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                            <span className="text-gray-600">Total Feed:</span>
                            <span className="font-semibold text-gray-900">{totalAmount} kg</span>
                        </div>
                        <div className="bg-pink-50 border border-pink-200 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                            <span className="text-gray-600">Avg/Day:</span>
                            <span className="font-semibold text-gray-900">{averageConsumption} kg</span>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Monthly Feed Data
                                </h3>
                                <input
                                    type="month"
                                    value={`${selectedYear}-${selectedMonth}`}
                                    onChange={(e) => {
                                        const [year, month] = e.target.value.split("-");
                                        setSelectedYear(year);
                                        setSelectedMonth(month);
                                    }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowGraph(true)}
                                    className="flex items-center space-x-1 bg-pink-100 text-pink-700 
                                        px-3 py-1.5 text-sm rounded-md hover:bg-pink-200 transition-colors"
                                >
                                    <BarChart2 className="h-4 w-4" />
                                    <span>Graph</span>
                                </button>
                                <button
                                    onClick={downloadCSV}
                                    className="flex items-center space-x-1 bg-gray-200 text-gray-800 
                                        px-3 py-1.5 text-sm rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>CSV</span>
                                </button>
                            </div>
                        </div>
                        <AdvancedTable
                            data={tableData}
                            columns={columns}
                            searchPlaceholder="Search by Date..."
                            searchKey="feedingDate"
                        />
                    </div>
                </div>
            </div>

            {/* Graph Modal */}
            {showGraph && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-4xl p-6 relative">
                        <button
                            onClick={() => setShowGraph(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Feed Consumption Graph
                        </h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" label={{ value: "Day", position: "insideBottom", dy: 10 }} />
                                <YAxis label={{ value: "Kg", angle: -90, position: "insideLeft" }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="amount" stroke="#ec4899" strokeWidth={2} dot />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedModal;
