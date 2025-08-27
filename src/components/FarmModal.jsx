import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, PlusCircle, CheckCircle } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

import {
    fetchAllFarms,
    fetchCurrentFarm,
    createFarmRecord,
    setCurrentFarm,
} from "../store/actions/pigActions";

import {
    selectFarmRecords,
    currentFarmRecord,
} from "../store/selectors/pigSelectors";

const FarmModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const farms = useSelector(selectFarmRecords);
    const selectedFarm = useSelector(currentFarmRecord);

    console.log("selectedFarm -", selectedFarm)
    console.log("farms -", farms)

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newFarmName, setNewFarmName] = useState("");
    const [newFarmAddress, setNewFarmAddress] = useState("");

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchAllFarms());
            dispatch(fetchCurrentFarm());
        }
    }, [isOpen, dispatch]);

    const handleSelectFarm = async (farm) => {
        const result = await dispatch(setCurrentFarm(farm.farmId));
        if (result.success) {
            toast.success(`✅ ${farm.farmName} has been selected`);
        }
        else {
            toast.error("Error selecting farm !!");
        }

    };

    const handleCreateFarm = async () => {
        if (!newFarmName || !newFarmAddress) {
            toast.error("⚠️ Please fill all fields");
            return;
        }
        const newFarm = {
            farmName: newFarmName,
            farmAddress: newFarmAddress,
        };
        const result = await dispatch(createFarmRecord(newFarm));
        console.log("result from frontend :", result)
        if (result.success) {
            toast.success(`New farm "${newFarmName}" has been created`);
        }
        else {
            toast.error("⚠️ New farm creation Failed !");
        }
        setNewFarmName("");
        setNewFarmAddress("");
        setShowCreateForm(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        theme: {
                            primary: '#10b981',
                            secondary: '#ffffff',
                        },
                    },
                }}
            />
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={22} />
                </button>

                <h2 className="text-xl font-semibold mb-4">Select or Create Farm</h2>

                {/* Current Farm */}
                {selectedFarm ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                        <span className="text-green-700 font-medium">
                            Current Farm: {selectedFarm}
                        </span>
                        <CheckCircle className="text-green-600" size={20} />
                    </div>
                ) : (
                    <div className="text-gray-500 italic mb-4">No farm selected yet.</div>
                )}

                {/* Farm Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="px-4 py-2">Farm ID</th>
                                <th className="px-4 py-2">Farm Name</th>
                                <th className="px-4 py-2">Address</th>
                                <th className="px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {farms.length > 0 ? (
                                farms.map((farm) => (
                                    <tr
                                        key={farm.farmId}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-2">{farm.farmId}</td>
                                        <td className="px-4 py-2">{farm.farmName}</td>
                                        <td className="px-4 py-2">{farm.farmAddress}</td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleSelectFarm(farm)}
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-4 text-center text-gray-500 italic"
                                    >
                                        No farms available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create New Farm Toggle */}
                <div className="mt-6">
                    {!showCreateForm ? (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-2 text-blue-600 font-medium hover:underline"
                        >
                            <PlusCircle size={20} />
                            Create New Farm
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Farm Name"
                                value={newFarmName}
                                onChange={(e) => setNewFarmName(e.target.value)}
                                className="w-full border rounded-lg p-2"
                            />
                            <input
                                type="text"
                                placeholder="Farm Address"
                                value={newFarmAddress}
                                onChange={(e) => setNewFarmAddress(e.target.value)}
                                className="w-full border rounded-lg p-2"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCreateFarm}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Save Farm
                                </button>
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmModal;
