import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Baby, Calendar, History, Edit, X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import AdvancedTable from '../common/AdvancedTable';
import {
    fetchCurrentFarrowingRecords,
    fetchFarrowingHistoryByMonth,
    updateFarrowingRecord,
    moveFarrowingToNursery,
    fetchCurrentFarm
} from '../../store/actions/pigActions';
import {
    currentFarmRecord,
    selectCurrentFarrowingRecords,
    selectFarrowingHistory,
    selectIsMovingPig,
    selectMovingPigId
} from '../../store/selectors/pigSelectors';

const FarrowingStage = () => {
    const dispatch = useDispatch();
    // const selectedFarm = useSelector((state) => state.farm.selectedFarm);
    const currentFarrowingRecords = useSelector(selectCurrentFarrowingRecords);
    const farrowingHistoryRecords = useSelector(selectFarrowingHistory);
    const isMovingPig = useSelector(selectIsMovingPig);
    const movingPigId = useSelector(selectMovingPigId);

    const [selectedFilter, setSelectedFilter] = useState('current');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // const [selectedFarm, setSelectedFarm] = useState("F1")

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const [editForm, setEditForm] = useState({
        farrowingDate: '',
        stillBorn: 0,
        mummyBorn: 0,
        liveBorn: 0,
        deathDuringFarrowing: 0,
        atw: 0,
        remarks: ''
    });

    useEffect(() => {
        dispatch(fetchCurrentFarm());
    }, [dispatch])

    const selectedFarm = useSelector(currentFarmRecord);

    console.log("Current selected Farm -", selectedFarm)


    useEffect(() => {
        if (selectedFilter === 'current') {
            dispatch(fetchCurrentFarrowingRecords(selectedFarm));
        } else {
            dispatch(fetchFarrowingHistoryByMonth(selectedYear, selectedMonth + 1, selectedFarm));
        }
    }, [dispatch, selectedFilter, selectedMonth, selectedYear]);

    const handleMoveToNextStage = async (action, item) => {
        const loadingToast = toast.loading(`Moving ${item.pigId} to Nursery stage...`);

        try {
            const result = await dispatch(moveFarrowingToNursery(item));
            console.log("farrowing result ->", result)

            if (result.success) {
                toast.success(`${item.pigId} moved to Nursery stage`, { id: loadingToast });
            } else {
                toast.error('Failed to move to nursery', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Error moving pig', { id: loadingToast });
        }
    };

    const handleRowClick = (item) => {
        if (selectedFilter === 'current') {
            console.log("handleRowClick")
            setEditingRecord(item);
            setEditForm({
                farrowingDate: item.farrowingDate || '',
                stillBorn: item.stillBorn || 0,
                mummyBorn: item.mummyBorn || 0,
                liveBorn: item.liveBorn || 0,
                deathDuringFarrowing: item.deathDuringFarrowing || 0,
                atw: item.atw || 0,
                remarks: item.remarks || ''
            });
            setShowEditModal(true);
        }
    };

    const handleEditRecord = (item) => {
        setEditingRecord(item);
        setEditForm({
            farrowingDate: item.farrowingDate || '',
            stillBorn: item.stillBorn || 0,
            mummyBorn: item.mummyBorn || 0,
            liveBorn: item.liveBorn || 0,
            deathDuringFarrowing: item.deathDuringFarrowing || 0,
            atw: item.atw || 0,
            remarks: item.remarks || ''
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        const updatedRecord = {
            ...editingRecord,
            ...editForm,
            stillBorn: parseInt(editForm.stillBorn),
            mummyBorn: parseInt(editForm.mummyBorn),
            liveBorn: parseInt(editForm.liveBorn),
            deathDuringFarrowing: parseInt(editForm.deathDuringFarrowing),
            atw: parseFloat(editForm.atw),
            totalBorn: parseInt(editForm.stillBorn) + parseInt(editForm.mummyBorn) + parseInt(editForm.liveBorn),
            weaningCount: parseInt(editForm.liveBorn) - parseInt(editForm.deathDuringFarrowing),
            selectedFarm,
        };

        try {
            await dispatch(updateFarrowingRecord(updatedRecord));
            toast.success('Farrowing details updated successfully!');
            setShowEditModal(false);
            setEditingRecord(null);
        } catch (err) {
            toast.error('Failed to update farrowing record');
        }
    };

    const currentRecordsColumns = [
        { key: 'id', label: 'Record ID', sortable: true },
        { key: 'pigId', label: 'Pig ID', sortable: true },
        { key: 'inDate', label: 'In Date', sortable: true },
        { key: 'farrowingDate', label: 'Farrowing Date', sortable: true },
        { key: 'stillBorn', label: 'Still Born', sortable: true },
        { key: 'mummyBorn', label: 'Mummy Born', sortable: true },
        { key: 'liveBorn', label: 'Live Born', sortable: true },
        { key: 'deathDuringFarrowing', label: 'Death During Farrowing', sortable: true },
        {
            key: 'totalBorn',
            label: 'Total Pig Born',
            sortable: true,
            render: (value, item) => item.stillBorn + item.mummyBorn + item.liveBorn
        },
        { key: 'weaningCount', label: 'No of Weaning', sortable: true },
        {
            key: 'atw',
            label: 'ATW (kg)',
            sortable: true,
            render: (value) => `${value} kg`
        },
    ];

    const historyRecordsColumns = [
        { key: 'id', label: 'Record ID', sortable: true },
        { key: 'pigId', label: 'Pig ID', sortable: true },
        { key: 'inDate', label: 'In Date', sortable: true },
        { key: 'outDate', label: 'Out Date', sortable: true },
        { key: 'farrowingDate', label: 'Farrowing Date', sortable: true },
        { key: 'weaningDate', label: 'Weaning Date', sortable: true },
        { key: 'stillBorn', label: 'Still Born', sortable: true },
        { key: 'mummyBorn', label: 'Mummy Born', sortable: true },
        { key: 'liveBorn', label: 'Live Born', sortable: true },
        { key: 'deathDuringFarrowing', label: 'Death During Farrowing', sortable: true },
        {
            key: 'totalBorn',
            label: 'Total Pig Born',
            sortable: true,
            render: (value, item) => item.stillBorn + item.mummyBorn + item.liveBorn
        },
        {
            key: 'atw',
            label: 'ATW (kg)',
            sortable: true,
            render: (value) => `${value} kg`
        }
    ];

    const currentRecordsActions = [
        {
            key: 'edit',
            label: 'Edit Details',
            className: 'text-purple-600 hover:text-purple-900 text-xs sm:text-sm',
            render: () => (
                <div className="flex items-center">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                </div>
            )
        },
        {
            key: 'move',
            label: 'Move to Nursery',
            className: 'inline-flex items-center px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm',
            requiresConfirmation: true,
            confirmationMessage: 'This will move the pig to Nursery stage. This action cannot be reversed.',
            disabled: (item) => isMovingPig && movingPigId === item.id,
            render: (item) => (
                <>
                    {isMovingPig && movingPigId === item.id ? (
                        <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-green-600 mr-1"></div>
                            Moving...
                        </>
                    ) : (
                        'Move to Nursery'
                    )}
                </>
            )
        }
    ];

    const historyRecordsActions = [
        {
            key: 'view',
            label: 'View Details',
            className: 'text-purple-600 hover:text-purple-900 text-xs sm:text-sm',
            render: () => 'View Details'
        }
    ];

    const handleAction = (action, item) => {
        if (action.key === 'edit') {
            console.log("item edit ->", item)
            handleEditRecord(item);
        } else if (action.key === 'move') {
            console.log("item move ->", item)
            handleMoveToNextStage(action, item);
        }
    };

    // return (
    //     <div className="min-h-screen bg-gray-50">
    //         <Toaster position="top-right" />
    //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    //             {/* Tabs and Content Rendering Below */}
    //             {/* Edit Modal, AdvancedTable usage, etc. remain same */}
    //         </div>
    //     </div>
    // );
    return (
        <div className="min-h-screen bg-gray-50">
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                                <Baby className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2 sm:mr-3" />
                                Farrowing Management
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                Monitor sows during delivery and piglet care
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
                        <div className="border-b border-gray-200">
                            <nav className="flex">
                                <button
                                    onClick={() => setSelectedFilter('current')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'current'
                                        ? 'border-purple-500 text-purple-600 bg-purple-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Calendar className="h-4 w-4 inline mr-2" />
                                    Current Farrowing {selectedFilter === 'current' && ` (${currentFarrowingRecords.length})`}
                                </button>
                                <button
                                    onClick={() => setSelectedFilter('history')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'history'
                                        ? 'border-purple-500 text-purple-600 bg-purple-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <History className="h-4 w-4 inline mr-2" />
                                    History {selectedFilter === 'history' && ` (${farrowingHistoryRecords.length})`}
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 sm:p-6">
                            {selectedFilter === 'current' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Active Farrowing Records
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Click on any row to edit farrowing details
                                    </p>
                                    <AdvancedTable
                                        data={currentFarrowingRecords}
                                        columns={currentRecordsColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="pigId"
                                        actionButtons={currentRecordsActions}
                                        onAction={handleAction}
                                    // onRowClick={handleRowClick}
                                    // rowClickable={true}
                                    />
                                </div>
                            )}

                            {selectedFilter === 'history' && (
                                <div>
                                    {/* Month Selection for History */}
                                    <div className="mb-4 flex items-center space-x-4">
                                        <span className="text-sm font-medium text-gray-700">Filter by month:</span>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            {months.map((month, index) => (
                                                <option key={index} value={index}>{month}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            {[2023, 2024, 2025].map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Farrowing History
                                    </h3>
                                    <AdvancedTable
                                        data={farrowingHistoryRecords}
                                        columns={historyRecordsColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="pigId"
                                        actionButtons={historyRecordsActions}
                                        onAction={() => { }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Edit Farrowing Details - {editingRecord?.pigId}
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Farrowing
                                </label>
                                <input
                                    type="date"
                                    value={editForm.farrowingDate}
                                    onChange={(e) => setEditForm({ ...editForm, farrowingDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No of Still Born
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editForm.stillBorn}
                                    onChange={(e) => setEditForm({ ...editForm, stillBorn: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No of Mummy Born
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editForm.mummyBorn}
                                    onChange={(e) => setEditForm({ ...editForm, mummyBorn: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    No of Live Born
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editForm.liveBorn}
                                    onChange={(e) => setEditForm({ ...editForm, liveBorn: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Death During Farrowing
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editForm.deathDuringFarrowing}
                                    onChange={(e) => setEditForm({ ...editForm, deathDuringFarrowing: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ATW - Average Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={editForm.atw}
                                    onChange={(e) => setEditForm({ ...editForm, atw: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter average weight"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Remarks
                                </label>
                                <textarea
                                    value={editForm.remarks}
                                    onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter any remarks or observations..."
                                />
                            </div>

                            {/* Calculated Values Display */}
                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Calculated Values:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Total Pig Born:</span>
                                        <span className="ml-2 font-medium">
                                            {editForm.stillBorn + editForm.mummyBorn + editForm.liveBorn}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">No of Weaning:</span>
                                        <span className="ml-2 font-medium">
                                            {editForm.liveBorn - editForm.deathDuringFarrowing}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Survival Rate:</span>
                                        <span className="ml-2 font-medium">
                                            {editForm.liveBorn > 0
                                                ? ((editForm.liveBorn - editForm.deathDuringFarrowing) / editForm.liveBorn * 100).toFixed(1)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">ATW:</span>
                                        <span className="ml-2 font-medium">{editForm.atw} kg</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarrowingStage;
