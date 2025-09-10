import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
    entryBreedingRecord,
    entryGestationRecord,
    entryFarrowingRecord, // add this handler
} from "../actions/dataEntryActions";

const stageConfigs = {
    servicing: [
        { name: "sowId", label: "Sow ID", type: "text" },
        { name: "boarId", label: "Boar ID", type: "text" },
        { name: "matingDate", label: "Service Date", type: "date" },
        { name: "inDate", label: "In Date", type: "date" },
        { name: "boarBreed", label: "Boar Breed", type: "text" },
        { name: "sowBreed", label: "Sow Breed", type: "text" },
    ],
    gestation: [
        { name: "sowId", label: "Sow ID", type: "text" },
        { name: "boarId", label: "Boar ID", type: "text" },
        { name: "boarBreed", label: "Boar Breed", type: "text" },
        { name: "sowBreed", label: "Sow Breed", type: "text" },
        { name: "inDate", label: "In Date", type: "date" },
        { name: "notes", label: "Notes", type: "text" },
    ],
    farrowing: [
        { name: "sowId", label: "Sow ID", type: "text" },
        { name: "boarId", label: "Boar ID", type: "text" },
        { name: "inDate", label: "In Date", type: "date" },
        { name: "farrowingDate", label: "Farrowing Date", type: "date" },
        { name: "boarBreed", label: "Boar Breed", type: "text" },
        { name: "sowBreed", label: "Sow Breed", type: "text" },
        { name: "stillBorn", label: "Still Born", type: "number" },
        { name: "mummyBorn", label: "Mummy Born", type: "number" },
        { name: "liveBorn", label: "Live Born", type: "number" },
        { name: "deathDuringFarrowing", label: "Death During Farrowing", type: "number" },
        // totalBorn & weaningCount will be displayed as computed values
        { name: "atw", label: "Average Weight (ATW)", type: "number" },
        { name: "remark", label: "Remark", type: "text" },
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

    // Computed values for farrowing
    const computed = useMemo(() => {
        if (stage !== "farrowing") return {};
        const stillBorn = Number(formData.stillBorn || 0);
        const mummyBorn = Number(formData.mummyBorn || 0);
        const liveBorn = Number(formData.liveBorn || 0);
        const deathDuringFarrowing = Number(formData.deathDuringFarrowing || 0);

        return {
            totalBorn: stillBorn + mummyBorn + liveBorn,
            weaningCount: liveBorn - deathDuringFarrowing,
        };
    }, [stage, formData]);

    const stageHandlers = {
        servicing: entryBreedingRecord,
        gestation: entryGestationRecord,
        farrowing: entryFarrowingRecord,
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stage) {
            toast.error("Please select a stage before submitting");
            return;
        }

        const handler = stageHandlers[stage];
        if (!handler) {
            toast.error(`No handler implemented for stage: ${stage}`);
            return;
        }

        try {
            let payload = { ...formData };

            if (stage === "farrowing") {
                payload = {
                    sowId: formData.sowId,
                    boarId: formData.boarId,
                    inDate: formData.inDate,
                    boarBreed: formData.boarBreed,
                    sowBreed: formData.sowBreed,
                    farrowingDate: formData.farrowingDate,
                    remark: formData.remark,
                    farrowingData: {
                        mummyBorn: Number(formData.mummyBorn || 0),
                        liveBorn: Number(formData.liveBorn || 0),
                        stillBorn: Number(formData.stillBorn || 0),
                        deathDuringFarrowing: Number(formData.deathDuringFarrowing || 0),
                        atw: Number(formData.atw || 0),
                        weaningCount: computed.weaningCount,
                    },
                };
            }

            const data = await handler(payload);
            if (!data.success) {
                toast.error("Error Submitting Data!");
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col relative">
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                        Data Entry
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Scrollable Form */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Stage Select */}
                        <div className="space-y-2">
                            <label className="text-gray-700 font-medium">Stage</label>
                            <select
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
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

                        {/* Dynamic Fields */}
                        {stage && (
                            <div className="space-y-4">
                                {stageConfigs[stage]?.map((field) => (
                                    <div key={field.name} className="space-y-2">
                                        <label className="block text-gray-700 font-medium">
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            placeholder={field.label}
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData[field.name] || ""}
                                            onChange={(e) =>
                                                handleInputChange(field.name, e.target.value)
                                            }
                                        />
                                    </div>
                                ))}

                                {/* Computed Fields for Farrowing */}
                                {stage === "farrowing" && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-gray-700 font-medium">
                                                Total Born
                                            </label>
                                            <input
                                                type="number"
                                                value={computed.totalBorn}
                                                readOnly
                                                className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-gray-700 font-medium">
                                                Weaning Count
                                            </label>
                                            <input
                                                type="number"
                                                value={computed.weaningCount}
                                                readOnly
                                                className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                                            />
                                        </div>
                                    </>
                                )}
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
        </div>
    );
};

export default DataEntry;
