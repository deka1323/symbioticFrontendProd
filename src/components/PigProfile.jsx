
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Syringe, AlertCircle, X } from "lucide-react";

const PigProfile = ({ isOpen, onClose, pig, medicalHistory, stageHistory }) => {
    if (!isOpen || !pig) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const formatValue = (value) => {
        if (value === null || value === undefined || value === "") return "N/A";
        return value;
    };

    const groupMedicalRecordsByType = (records) => {
        const grouped = { vaccinations: [], deworming: [], medicines: [] };
        records.forEach((record) => {
            if (record.recordType === "vaccination") {
                grouped.vaccinations.push(record);
            } else if (record.recordType === "deworming") {
                grouped.deworming.push(record);
            } else {
                grouped.medicines.push(record);
            }
        });
        return grouped;
    };

    const calculateDaysInStage = (inDate, outDate) => {
        if (!inDate) return "N/A";
        const startDate = new Date(inDate);
        const endDate = outDate ? new Date(outDate) : new Date();
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-y-auto max-h-[90vh] p-6 relative"
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 200 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            onClick={onClose}
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Header */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Pig Profile – {formatValue(pig.pigId)}
                        </h2>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <h3 className="font-semibold text-gray-800 mb-2">Basic Information</h3>
                                <div className="flex justify-between"><span>Sex:</span><span>{formatValue(pig.sex)}</span></div>
                                <div className="flex justify-between"><span>Breed:</span><span>{formatValue(pig.breed)}</span></div>
                                <div className="flex justify-between"><span>Date of Birth:</span><span>{formatDate(pig.dateOfBirth)}</span></div>
                                <div className="flex justify-between"><span>Weight:</span><span>{pig.weight ? `${pig.weight} kg` : "N/A"}</span></div>
                                <div className="flex justify-between"><span>Mother ID:</span><span>{formatValue(pig.motherPigId)}</span></div>
                                <div className="flex justify-between"><span>Father ID:</span><span>{formatValue(pig.fatherPigId)}</span></div>
                            </div>

                            {/* Stage Info */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <h3 className="font-semibold text-gray-800 mb-2">Stage Information</h3>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${pig.currentStatus === "living"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {formatValue(pig.currentStatus)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Stage:</span>
                                    <span className="capitalize">{formatValue(pig.currentStage)}</span>
                                </div>
                                {pig.pregnancyCount !== undefined && pig.sex === "female" && (
                                    <div className="flex justify-between">
                                        <span>Pregnancy Count:</span>
                                        <span>{formatValue(pig.pregnancyCount)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stage History */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold flex items-center text-gray-800 mb-3">
                                <Calendar className="h-5 w-5 mr-2" /> Stage History
                            </h3>
                            {stageHistory?.length > 0 ? (
                                <div className="bg-blue-50 rounded-xl p-4 border space-y-2">
                                    {stageHistory.map((s, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="capitalize font-medium">{s.stageName}</span>
                                            <span>
                                                {formatDate(s.inDate)} – {s.outDate ? formatDate(s.outDate) : "Present"} (
                                                {calculateDaysInStage(s.inDate, s.outDate)} days)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No stage history available</p>
                            )}
                        </div>

                        {/* Medical Records */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold flex items-center text-gray-800 mb-3">
                                <Syringe className="h-5 w-5 mr-2" /> Medical Records
                            </h3>
                            {medicalHistory?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(() => {
                                        const grouped = groupMedicalRecordsByType(medicalHistory);
                                        return ["vaccinations", "deworming", "medicines"].map((type) => (
                                            <div key={type} className="bg-gray-50 rounded-xl p-4 border">
                                                <h4 className="font-medium mb-2 capitalize">{type}</h4>
                                                {grouped[type].length > 0 ? (
                                                    grouped[type].map((r, i) => (
                                                        <div key={i} className="text-sm mb-2">
                                                            <div>{formatValue(r.medicineType)}</div>
                                                            <div>Date: {formatDate(r.date)}</div>
                                                            {r.nextDueDate && <div>Next: {formatDate(r.nextDueDate)}</div>}
                                                            {r.dosage && <div>Dosage: {r.dosage}</div>}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-sm">No records</p>
                                                )}
                                            </div>
                                        ));
                                    })()}
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-xl p-4 border">
                                    <p className="text-gray-600 text-sm text-center">No medical records available</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PigProfile;
