import React, { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { getAllActiveLivingMales } from "../actions/dashboardActions";
import AdvancedTable from "./common/AdvancedTable";
import { motion } from "framer-motion";

const BoarModal = ({ selectedFarm, onClose }) => {
    const [rawData, setRawData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [stageFilter, setStageFilter] = useState("all");
    const [animalType, setAnimalType] = useState("boar");

    // Stage options
    const boarStages = ["all", "breeding", "fattening", "nursery"];
    const sowStages = [
        "all",
        "gestation",
        "breeding",
        "farrowing",
        "nursery",
        "fattening",
        "dried",
    ];

    useEffect(() => {
        const fetchTable = async () => {
            try {
                const res = await getAllActiveLivingMales(selectedFarm);
                let data = Array.isArray(res.data) ? res.data : [];
                setRawData(data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setRawData([]);
            }
        };
        fetchTable();
    }, [selectedFarm]);

    // filter boar/sow from rawData
    useEffect(() => {
        let data = [];
        if (animalType === "boar") {
            data = rawData.filter(
                (item) => item.sex?.toLowerCase() === "male" && item.isBoar === true
            );
        } else if (animalType === "sow") {
            data = rawData.filter(
                (item) => item.sex?.toLowerCase() === "female" && item.isSow === true
            );
        }
        setTableData(data);
        setFilteredData(data);
        setStageFilter("all"); // reset stage filter on switch
    }, [animalType, rawData]);

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
        a.download = `${animalType}_data.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Dynamic columns
    const columns = [
        { key: "pigId", label: animalType === "boar" ? "Boar ID" : "Sow ID", sortable: true },
        { key: "breed", label: "Breed", sortable: true },
        { key: "dob", label: "DOB", sortable: true },
        { key: "currentStage", label: "Stage", sortable: true },
    ];

    // Stage labels (map breeding → Service)
    const stageOptions = animalType === "boar" ? boarStages : sowStages;
    const getStageLabel = (stage) =>
        stage === "all" ? "All" : stage === "breeding" ? "Service" : stage;

    const getStageCount = (stage) => {
        if (stage === "all") return tableData.length;
        return tableData.filter(
            (item) => item.currentStage?.toLowerCase() === stage
        ).length;
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-6xl h-[90vh] flex flex-col relative"
            >
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-gray-800">
                        {animalType === "boar" ? "Boars" : "Sows"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                            {/* Animal Type Buttons */}
                            <div className="flex gap-2">
                                {["boar", "sow"].map((type) => (
                                    <motion.button
                                        key={type}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setAnimalType(type)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${animalType === type
                                                ? "bg-blue-600 text-white shadow"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {type === "boar" ? "Boars" : "Sows"}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Stage Buttons */}
                            <div className="flex flex-wrap gap-2">
                                {stageOptions.map((stage) => (
                                    <motion.button
                                        key={stage}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setStageFilter(stage)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${stageFilter === stage
                                                ? "bg-indigo-600 text-white shadow"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {getStageLabel(stage)}
                                        <span
                                            className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${stageFilter === stage
                                                    ? "bg-white/20"
                                                    : "bg-gray-300 text-gray-700"
                                                }`}
                                        >
                                            {getStageCount(stage)}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Download */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={downloadCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs rounded-lg shadow hover:bg-blue-700 transition"
                            >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                            </motion.button>
                        </div>

                        {/* Data Table */}
                        <AdvancedTable
                            data={filteredData}
                            columns={columns}
                            searchPlaceholder={`Search by ID...`}
                            searchKey="pigId"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BoarModal;
