import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

// Configuration for stage-specific fields
const stageConfigs = {
    breeding: [
        { name: "partnerId", label: "Breeding Partner ID", type: "text" },
        { name: "breedingDate", label: "Breeding Date", type: "date" },
    ],
    gestation: [
        { name: "daysPregnant", label: "Days Pregnant", type: "number" },
        { name: "expectedDate", label: "Expected Date", type: "date" },
    ],
    farrowing: [
        { name: "pigletsBorn", label: "Piglets Born", type: "number" },
        { name: "notes", label: "Farrowing Notes", type: "text" },
    ],
    nursery: [
        { name: "weight", label: "Nursery Weight", type: "number" },
    ],
    fattening: [
        { name: "weight", label: "Current Weight", type: "number" },
        { name: "weighDate", label: "Weigh Date", type: "date" },
    ],
    dried: [
        { name: "reason", label: "Reason for Drying", type: "text" },
    ],
    "in-house": [
        { name: "notes", label: "In-house Notes", type: "text" },
    ],
};

const DataEntry = ({ isOpen, onClose }) => {
    const [stage, setStage] = useState("");
    const [formData, setFormData] = useState({});

    // Dummy backend submission
    const submitToBackend = async (payload) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.2 ? resolve("success") : reject("error");
            }, 1200);
        });
    };

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
            await submitToBackend({ stage, ...formData });
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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Data Entry</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Stage Select */}
                    <select
                        className="border rounded-lg w-full p-2"
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

                    {/* Stage Fields */}
                    <div className="space-y-3">
                        {stage &&
                            stageConfigs[stage]?.map((field) => (
                                <input
                                    key={field.name}
                                    type={field.type}
                                    placeholder={field.label}
                                    className="border rounded-lg w-full p-2"
                                    value={formData[field.name] || ""}
                                    onChange={(e) =>
                                        handleInputChange(field.name, e.target.value)
                                    }
                                />
                            ))}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DataEntry;
