import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Plus, Calendar, History, Edit, X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import AdvancedTable from '../common/AdvancedTable';
import {
    fetchCurrentBreedingRecords,
    fetchBreedingHistoryByMonth,
    createBreedingRecord,
    updateBreedingRecord,
    moveToGestation,
    fetchCurrentFarm
} from '../../store/actions/pigActions';
import {
    selectCurrentBreedingRecords,
    selectBreedingHistory,
    selectIsMovingPig,
    selectMovingPigId,
    selectIsLoading,
    currentFarmRecord
} from '../../store/selectors/pigSelectors';

const Loader = () => (
    <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-600"></div>
    </div>
);


const BreedingStage = () => {
    const dispatch = useDispatch();
    const [showNewBreeding, setShowNewBreeding] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [sowId, setSowId] = useState('');
    const [boarId, setBoarId] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('current');
    // const [selectedFarm, setSelectedFarm] = useState("F1")

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [editForm, setEditForm] = useState({
        matingDate: '',
        notes: ''
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        dispatch(fetchCurrentFarm());
    }, [dispatch])

    const selectedFarm = useSelector(currentFarmRecord);


    const currentBreeding = useSelector(selectCurrentBreedingRecords);
    const breedingHistory = useSelector(selectBreedingHistory);
    const isMovingPig = useSelector(selectIsMovingPig);
    const movingPigId = useSelector(selectMovingPigId);
    const isLoading = useSelector(selectIsLoading);

    const filteredHistoryRecords = breedingHistory?.filter(record => {
        if (!record.outDate) return false;
        const recordDate = new Date(record.outDate);
        return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
    });

    useEffect(() => {
        if (selectedFilter === 'current') {
            dispatch(fetchCurrentBreedingRecords(selectedFarm));
        } else {
            dispatch(fetchBreedingHistoryByMonth(selectedYear, selectedMonth + 1, selectedFarm));
        }
        console.log("month :", selectedMonth)
        console.log("Year :", selectedYear)
    }, [dispatch, selectedFilter, selectedMonth, selectedYear]);

    const handleNewBreeding = async () => {
        if (!sowId || !boarId) {
            toast.error('Please enter both Sow ID and Boar ID');
            return;
        }

        const newRecord = {
            sowId,
            boarId,
            selectedFarm
        };

        const result = await dispatch(createBreedingRecord(newRecord));
        if (result.success) {
            toast.success('New service record created successfully!');
            setShowNewBreeding(false);
            setSowId('');
            setBoarId('');
        } else {
            toast.error('Failed to create service record');
        }
    };

    const handleEditRecord = (record) => {
        setEditingRecord(record);
        setEditForm({
            matingDate: record.matingDate || '',
            notes: record.notes || ''
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        // const updatedRecord = {
        //     ...editingRecord,
        //     ...editForm,
        // };
        const updatedRecord = {
            Entity: editingRecord.Entity,
            Type: editingRecord.Type,
            sowId: editingRecord.pigId,
            breedingId: editingRecord.recordId,
            ...editForm,
            selectedFarm
        };

        const result = await dispatch(updateBreedingRecord(updatedRecord));
        console.log("result from update :", result)
        if (result.success) {
            toast.success('Service record updated successfully!');
            setShowEditModal(false);
            setEditingRecord(null);
        } else {
            toast.error('Failed to update Service record');
        }
    };

    const handleMoveToGestation = async (action, item) => {
        const loadingToast = toast.loading(`Moving ${item.sowId} to Gestation stage...`);
        const payload = { ...item, selectedFarm }
        console.log("payload ->", payload)
        const result = await dispatch(moveToGestation(payload));

        if (result.success) {
            toast.success(`${item.sowId} successfully moved to ${result.targetStage} stage!`, {
                id: loadingToast,
                duration: 3000,
            });
        } else {
            toast.error('Failed to move pig to gestation stage', { id: loadingToast });
        }
    };


    // Current breeding table columns
    const currentBreedingColumns = [
        {
            key: 'recordId',
            label: 'Service ID',
            sortable: true
        },
        {
            key: 'pigId',
            label: 'Sow ID',
            sortable: true,
            render: (value, item) => (
                <div>
                    <div className="text-sm text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500">{item.stageSpecificData?.sowBreed || '-'}</div>
                </div>
            )
        },
        {
            key: 'boarId',
            label: 'Boar Details',
            sortable: true,
            render: (_, item) => (
                <div>
                    <div className="text-sm text-gray-900">{item.stageSpecificData?.boarId || '-'}</div>
                    <div className="text-sm text-gray-500">{item.stageSpecificData?.boarBreed || '-'}</div>
                </div>
            )
        },
        {
            key: 'matingDate',
            label: 'Service Date',
            sortable: true,
            render: (_, item) => item.stageSpecificData?.matingDate || '-'
        },
        {
            key: 'inDate',
            label: 'In Date',
            sortable: true
        }
    ];


    // History breeding table columns
    const historyBreedingColumns = [
        { key: 'recordId', label: 'Service ID', sortable: true },
        {
            key: 'pigId',
            label: 'Sow Details',
            sortable: true,
            render: (value, item) => (
                <div>
                    <div className="text-sm text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500">{item.stageSpecificData?.sowBreed || '-'}</div>
                </div>
            )
        },
        {
            key: 'boarId',
            label: 'Boar Details',
            sortable: true,
            render: (value, item) => (
                <div>
                    <div className="text-sm text-gray-900">{item.stageSpecificData?.boarId || '-'}</div>
                    <div className="text-sm text-gray-500">{item.stageSpecificData?.boarBreed || '-'}</div>
                </div>
            )
        },
        { key: 'inDate', label: 'In Date', sortable: true },
        { key: 'outDate', label: 'Out Date', sortable: true },
    ];

    // Action buttons for current breeding
    const currentBreedingActions = [
        {
            key: 'edit',
            label: 'Edit Details',
            className: 'text-pink-600 hover:text-pink-900 text-xs sm:text-sm mr-2',
            render: () => (
                <div className="flex items-center">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                </div>
            )
        },
        {
            key: 'move',
            label: 'Move to Gestation',
            className: 'inline-flex items-center px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm',
            requiresConfirmation: true,
            confirmationMessage: 'This will move the pig to Gestation stage. This action cannot be reversed.',
            disabled: (item) => isMovingPig && movingPigId === item.id,
            render: (item) => (
                <>
                    {isMovingPig && movingPigId === item.id ? (
                        <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-1"></div>
                            Moving...
                        </>
                    ) : (
                        'Move to Gestation'
                    )}
                </>
            )
        }
    ];

    // Action buttons for history
    const historyBreedingActions = [
        {
            key: 'view',
            label: 'View Details',
            className: 'text-pink-600 hover:text-pink-900 text-xs sm:text-sm',
            render: () => 'View Details'
        }
    ];

    const handleAction = (action, item) => {
        if (action.key === 'edit') {
            handleEditRecord(item);
        } else if (action.key === 'move') {
            console.log("item moving-> ", item);
            handleMoveToGestation(action, item);
        }
    };

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
                                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 mr-2 sm:mr-3" />
                                Service Management
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                Manage pig service records and track mating activities
                            </p>
                        </div>
                        <button
                            onClick={() => setShowNewBreeding(true)}
                            className="bg-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">New Service</span>
                        </button>
                    </div>

                    {/* New Breeding Form */}
                    {showNewBreeding && (
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8 border border-gray-100">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Create New Service Record</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sow ID
                                    </label>
                                    <input
                                        type="text"
                                        value={sowId}
                                        onChange={(e) => setSowId(e.target.value)}
                                        placeholder="Enter Sow ID"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Boar ID
                                    </label>
                                    <input
                                        type="text"
                                        value={boarId}
                                        onChange={(e) => setBoarId(e.target.value)}
                                        placeholder="Enter Boar ID"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6">
                                <button
                                    onClick={() => setShowNewBreeding(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNewBreeding}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isLoading ? 'Creating...' : 'Create Service Record'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
                        <div className="border-b border-gray-200">
                            <nav className="flex">
                                <button
                                    onClick={() => setSelectedFilter('current')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'current'
                                        ? 'border-pink-500 text-pink-600 bg-pink-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Calendar className="h-4 w-4 inline mr-2" />
                                    Current Service
                                    {selectedFilter === 'current' && ` (${currentBreeding.length})`}
                                </button>
                                <button
                                    onClick={() => setSelectedFilter('history')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'history'
                                        ? 'border-pink-500 text-pink-600 bg-pink-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <History className="h-4 w-4 inline mr-2" />
                                    Service History
                                    {selectedFilter === 'history' && ` (${filteredHistoryRecords.length})`}
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 sm:p-6">
                            {selectedFilter === 'current' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Service Records</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Click Edit to modify service details including mating date
                                    </p>

                                    {isLoading ? (
                                        <Loader />
                                    ) : (
                                        <AdvancedTable
                                            data={currentBreeding}
                                            columns={currentBreedingColumns}
                                            searchPlaceholder="Search by Pig ID..."
                                            searchKey="pigId"
                                            actionButtons={currentBreedingActions}
                                            onAction={handleAction}
                                        />
                                    )}
                                </div>
                            )}


                            {selectedFilter === 'history' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Service History</h3>

                                    {/* Month Filter */}
                                    <div className="mb-4 flex items-center space-x-4">
                                        <span className="text-sm font-medium text-gray-700">Filter by month:</span>
                                        {/* ... your selects ... */}
                                    </div>

                                    {isLoading ? (
                                        <Loader />
                                    ) : (
                                        <AdvancedTable
                                            data={filteredHistoryRecords}
                                            columns={historyBreedingColumns}
                                            searchPlaceholder="Search by Pig ID..."
                                            searchKey="pigId"
                                            actionButtons={historyBreedingActions}
                                            onAction={() => { }}
                                        />
                                    )}
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
                                Edit Service Details - {editingRecord?.sowId}
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
                                    Service Date *
                                </label>
                                <input
                                    type="date"
                                    value={editForm.matingDate}
                                    onChange={(e) => setEditForm({ ...editForm, matingDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                    placeholder="Enter any additional notes..."
                                />
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
                                disabled={isLoading}
                                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-200 disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BreedingStage;