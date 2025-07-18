import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Plus, Calendar, History } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import {
    addBreedingRecord,
    moveToGestation
} from '../../store/actions/pigActions';
import {
    selectCurrentBreedingRecords,
    selectBreedingHistory,
    selectIsMovingPig,
    selectMovingPigId
} from '../../store/selectors/pigSelectors';
import AdvancedTable from '../common/AdvancedTable';

const BreedingStage = () => {
    const dispatch = useDispatch();
    const [showNewBreeding, setShowNewBreeding] = useState(false);
    const [sowId, setSowId] = useState('');
    const [boarId, setBoarId] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('current');

    // Month filter for history
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Redux selectors
    const currentBreeding = useSelector(selectCurrentBreedingRecords);
    const breedingHistory = useSelector(selectBreedingHistory);
    const isMovingPig = useSelector(selectIsMovingPig);
    const movingPigId = useSelector(selectMovingPigId);

    // Filter history records by month
    const filteredHistoryRecords = breedingHistory.filter(record => {
        if (!record.outDate) return false;
        const recordDate = new Date(record.outDate);
        return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
    });

    const handleNewBreeding = () => {
        if (!sowId || !boarId) {
            toast.error('Please enter both Sow ID and Boar ID');
            return;
        }

        const newRecord = {
            sowId,
            boarId,
            sowBreed: 'Yorkshire',
            boarBreed: 'Duroc',
            sowAge: 18,
            boarAge: 24
        };

        dispatch(addBreedingRecord(newRecord));
        toast.success('New breeding record created successfully!');
        setShowNewBreeding(false);
        setSowId('');
        setBoarId('');
    };

    const handleMoveToGestation = async (action, item) => {
        const loadingToast = toast.loading(`Moving ${item.sowId} to Gestation stage...`);

        try {
            const result = await dispatch(moveToGestation(item.id));

            if (result.success) {
                toast.success(`${item.sowId} successfully moved to ${result.targetStage} stage!`, {
                    id: loadingToast,
                    duration: 3000,
                });
            } else {
                toast.error('Failed to move pig to gestation stage', {
                    id: loadingToast,
                });
            }
        } catch (error) {
            toast.error('An error occurred while moving the pig', {
                id: loadingToast,
            });
        }
    };

    // Current breeding table columns
    const currentBreedingColumns = [
        { key: 'id', label: 'Breeding ID', sortable: true },
        {
            key: 'sowId',
            label: 'Sow Details',
            sortable: true,
            render: (value, item) => (
                <div>
                    <div className="text-sm text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500">{item.sowBreed} • {item.sowAge} months</div>
                </div>
            )
        },
        {
            key: 'boarId',
            label: 'Boar Details',
            sortable: true,
            render: (value, item) => (
                <div>
                    <div className="text-sm text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500">{item.boarBreed} • {item.boarAge} months</div>
                </div>
            )
        },
        { key: 'matingDate', label: 'Mating Date', sortable: true },
        { key: 'inDate', label: 'In Date', sortable: true },
    ];

    // History breeding table columns
    const historyBreedingColumns = [
        { key: 'id', label: 'Breeding ID', sortable: true },
        {
            key: 'sowId',
            label: 'Sow Details',
            sortable: true,
            render: (value, item) => (
                <div>
                    <div className="text-sm text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500">{item.sowBreed} • {item.sowAge} months</div>
                </div>
            )
        },
        {
            key: 'boarId',
            label: 'Boar Details',
            sortable: true,
            render: (value, item) => (
                <div>
                    <div className="text-sm text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500">{item.boarBreed} • {item.boarAge} months</div>
                </div>
            )
        },
        { key: 'inDate', label: 'In Date', sortable: true },
        { key: 'outDate', label: 'Out Date', sortable: true },
    ];

    // Action buttons for current breeding
    const currentBreedingActions = [
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
    ];

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
                                Breeding Management
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                Manage pig breeding records and track mating activities
                            </p>
                        </div>
                        <button
                            onClick={() => setShowNewBreeding(true)}
                            className="bg-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">New Breeding</span>
                        </button>
                    </div>

                    {/* New Breeding Form */}
                    {showNewBreeding && (
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8 border border-gray-100">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Create New Breeding Record</h2>
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
                                    className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-200"
                                >
                                    Create Breeding Record
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
                                    Current Breeding ({currentBreeding.length})
                                </button>
                                <button
                                    onClick={() => setSelectedFilter('history')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'history'
                                            ? 'border-pink-500 text-pink-600 bg-pink-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <History className="h-4 w-4 inline mr-2" />
                                    Breeding History ({breedingHistory.length})
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 sm:p-6">
                            {selectedFilter === 'current' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Breeding Records</h3>
                                    <AdvancedTable
                                        data={currentBreeding}
                                        columns={currentBreedingColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="sowId"
                                        actionButtons={currentBreedingActions}
                                        onAction={handleMoveToGestation}
                                    />
                                </div>
                            )}

                            {selectedFilter === 'history' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Breeding History</h3>
                                    {/* Month Selection for History */}
                                    <div className="mb-4 flex items-center space-x-4">
                                        <span className="text-sm font-medium text-gray-700">Filter by month:</span>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        >
                                            {months.map((month, index) => (
                                                <option key={index} value={index}>{month}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        >
                                            {[2023, 2024, 2025].map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <AdvancedTable
                                        data={filteredHistoryRecords}
                                        columns={historyBreedingColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="sowId"
                                        actionButtons={historyBreedingActions}
                                        onAction={() => { }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BreedingStage;