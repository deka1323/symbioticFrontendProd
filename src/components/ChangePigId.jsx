// ChangePigIdModal.jsx
import React, { useEffect, useState } from "react";
import {
    X,
    AlertTriangle,
    Download,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
    getAllUpdatedPigIds,
    getPigDetailsByPigId,
    updatePigId,
} from "../actions/dashboardActions";
import AdvancedTable from "./common/AdvancedTable";

const ChangePigId = ({ selectedFarm, onClose }) => {
    const [oldPigId, setOldPigId] = useState("");
    const [newPigId, setNewPigId] = useState("");
    const [pigDetails, setPigDetails] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [showChangeSection, setShowChangeSection] = useState(false);

    useEffect(() => {
        const fetchTable = async () => {
            try {
                const res = await getAllUpdatedPigIds();
                setTableData(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error fetching changed Pig IDs:", err);
                setTableData([]);
            }
        };
        fetchTable();
    }, []);

    const handleSubmit = async () => {
        if (!oldPigId || !newPigId) {
            toast.error("Please fill both Old and New Pig IDs.");
            return;
        }
        try {
            setLoading(true);
            const details = await getPigDetailsByPigId(selectedFarm, oldPigId);

            if (!details || !details.data) {
                toast.error("No pig found with this ID. Please enter correct Pig ID.");
                return;
            }

            setPigDetails(details.data);
            setConfirmModalOpen(true);
        } catch (err) {
            console.error("Error fetching pig details:", err);
            toast.error("Failed to fetch pig details.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await updatePigId(selectedFarm, oldPigId, newPigId);
            toast.success("Pig ID changed successfully.");
            setConfirmModalOpen(false);
            setOldPigId("");
            setNewPigId("");

            const updated = await getAllUpdatedPigIds();
            setTableData(Array.isArray(updated.data) ? updated.data : []);
        } catch (err) {
            console.error("Error changing Pig ID:", err);
            toast.error("Failed to change Pig ID.");
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = (rows, filename) => {
        if (!rows || rows.length === 0) return;
        const csvContent = [
            Object.keys(rows[0]).join(","),
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
        { key: "oldPigId", label: "Old Pig ID", sortable: true },
        { key: "newPigId", label: "New Pig ID", sortable: true },
        { key: "createdAt", label: "Changed Date", sortable: true },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[95%] max-w-6xl h-[90vh] flex flex-col relative">
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-800">Manage Pig IDs</h2>
                    <div className="flex items-center gap-3">
                        {/* Change Pig ID button */}
                        <button
                            onClick={() => setShowChangeSection(!showChangeSection)}
                            className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
                        >
                            {showChangeSection ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                            <span>Change Pig ID</span>
                        </button>

                        {/* Close button */}
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
                    {/* Change Pig ID Section (collapsible) */}
                    {showChangeSection && (
                        <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                Change Pig ID
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Old Pig ID"
                                    value={oldPigId}
                                    onChange={(e) => setOldPigId(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                                <input
                                    type="text"
                                    placeholder="New Pig ID"
                                    value={newPigId}
                                    onChange={(e) => setNewPigId(e.target.value)}
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

                    {/* Table Section */}
                    <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Changed Pig IDs
                            </h3>
                            <button
                                onClick={downloadCSV}
                                className="flex items-center space-x-1 bg-gray-200 text-gray-800 
                 px-3 py-1.5 text-sm rounded-md hover:bg-gray-300 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                <span>CSV</span>
                            </button>
                        </div>
                        <AdvancedTable
                            data={tableData}
                            columns={columns}
                            searchPlaceholder="Search by Pig ID..."
                            searchKey="oldPigId"
                        />
                    </div>

                </div>
            </div>

            {/* Confirm Modal */}
            {confirmModalOpen && pigDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                    <div className="bg-white rounded-xl shadow-lg w-[95%] max-w-md p-6 relative">
                        <button
                            onClick={() => setConfirmModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center space-x-2 mb-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            <h3 className="text-lg font-semibold text-gray-800">
                                Confirm Pig ID Change
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to change this Pig ID? Please double-check
                            the details below.
                        </p>

                        <div className="bg-gray-100 rounded-lg p-4 mb-4 text-sm">
                            <p>
                                <strong>Old Pig ID:</strong> {oldPigId}
                            </p>
                            <p>
                                <strong>New Pig ID:</strong> {newPigId}
                            </p>
                            <p>
                                <strong>Sex:</strong> {pigDetails.sex}
                            </p>
                            <p>
                                <strong>Breed:</strong> {pigDetails.breed}
                            </p>
                            <p>
                                <strong>Date of Birth:</strong> {pigDetails.dateOfBirth}
                            </p>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setConfirmModalOpen(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50"
                            >
                                {loading ? "Changing..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangePigId;
