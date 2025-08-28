import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { entryBreedingRecord } from "../actions/dataEntryActions";

// Configuration for stage-specific fields
const stageConfigs = {
    breeding: [
        { name: "sowId", label: "Sow ID", type: "text" },
        { name: "boarId", label: "Boar ID", type: "text" },
        { name: "matingDate", label: "Service Date", type: "date" },
        { name: "inDate", label: "In Date", type: "date" },
        { name: "boarBreed", label: "Boar Breed", type: "text" },
        { name: "sowBreed", label: "Sow Breed", type: "text" },
    ],
    gestation: [
        { name: "daysPregnant", label: "Days Pregnant", type: "number" },
        { name: "expectedDate", label: "Expected Date", type: "date" },
    ],
    farrowing: [
        { name: "pigletsBorn", label: "Piglets Born", type: "number" },
        { name: "notes", label: "Farrowing Notes", type: "text" },
    ],
    nursery: [{ name: "weight", label: "Nursery Weight", type: "number" }],
    fattening: [
        { name: "weight", label: "Current Weight", type: "number" },
        { name: "weighDate", label: "Weigh Date", type: "date" },
    ],
    dried: [{ name: "reason", label: "Reason for Drying", type: "text" }],
    "in-house": [{ name: "notes", label: "In-house Notes", type: "text" }],
};

const DataEntry = ({ isOpen, onClose }) => {
    const [stage, setStage] = useState("");
    const [formData, setFormData] = useState({});

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stage) {
            toast.error("Please select a stage before submitting");
            return;
        }
        try {
            console.log("formData ->", formData)
            const data = await entryBreedingRecord(formData);
            if (!data.success) {
                toast.error("Error Submitting Data !");
                return;
            }
            toast.success("Data submitted successfully!");
            setFormData({});
            setStage("");
            onClose();
        } catch (err) {
            toast.error("Failed to submit data, please try again.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Data Entry</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Stage Select */}
                    <div className="grid grid-cols-3 gap-4 items-center">
                        <label className="text-gray-700 font-medium">Stage</label>
                        <select
                            className="col-span-2 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={stage}
                            onChange={(e) => {
                                setStage(e.target.value);
                                setFormData({});
                            }}
                        >
                            <option value="">-- Select Stage --</option>
                            {Object.keys(stageConfigs).map((s) => (
                                <option key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stage Fields */}
                    {stage && (
                        <div className="space-y-4">
                            {stageConfigs[stage]?.map((field) => (
                                <div
                                    key={field.name}
                                    className="grid grid-cols-3 gap-4 items-center"
                                >
                                    <label className="text-gray-700 font-medium">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        placeholder={field.label}
                                        className="col-span-2 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData[field.name] || ""}
                                        onChange={(e) =>
                                            handleInputChange(field.name, e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-md"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DataEntry;
