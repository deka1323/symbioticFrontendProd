import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Calendar, History } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import AdvancedTable from '../common/AdvancedTable';
import {
    fetchCurrentFarm,
    fetchCurrentGestationRecords,
    fetchGestationHistoryByMonth,
    moveGestationToFarrowing,
    moveGestationToFattening
} from '../../store/actions/pigActions';
import {
    selectCurrentGestationRecords,
    selectGestationHistory,
    selectIsMovingPig,
    selectMovingPigId,
    selectIsLoading,
    currentFarmRecord
} from '../../store/selectors/pigSelectors';

const GestationStage = () => {
    const dispatch = useDispatch();
    const [selectedFilter, setSelectedFilter] = useState('current');

    // const [selectedFarm, setSelectedFarm] = useState("F1")

    // Month filter for history
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        dispatch(fetchCurrentFarm());
    }, [dispatch])

    const selectedFarm = useSelector(currentFarmRecord);

    console.log("Current selected Farm -", selectedFarm)

    // Redux selectors
    const currentGestation = useSelector(selectCurrentGestationRecords);
    const gestationHistory = useSelector(selectGestationHistory);
    const isMovingPig = useSelector(selectIsMovingPig);
    const movingPigId = useSelector(selectMovingPigId);
    const isLoading = useSelector(selectIsLoading);

    const filteredHistoryRecords = gestationHistory.filter(record => {
        if (!record.outDate) return false;
        const recordDate = new Date(record.outDate);
        return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
    });

    useEffect(() => {
        if (selectedFilter === 'current') {
            dispatch(fetchCurrentGestationRecords(selectedFarm));
        } else {
            dispatch(fetchGestationHistoryByMonth(selectedYear, selectedMonth + 1, selectedFarm));
        }
    }, [dispatch, selectedFilter, selectedMonth, selectedYear]);

    const handleMoveToFarrowing = async (action, item) => {
        const loadingToast = toast.loading(`Moving ${item.pigId} to Farrowing stage...`);
        const result = await dispatch(moveGestationToFarrowing({ ...item, selectedFarm }));

        if (result.success) {
            toast.success(`${item.pigId} successfully moved to ${result.targetStage} stage!`, {
                id: loadingToast,
                duration: 3000,
            });
        } else {
            toast.error('Failed to move pig to farrowing stage', { id: loadingToast });
        }
    };

    const handleMoveToFattening = async (action, item) => {
        const loadingToast = toast.loading(`Moving ${item.pigId} to Fattening stage (pregnancy failed)...`);
        const result = await dispatch(moveGestationToFattening({ ...item, selectedFarm }));

        if (result.success) {
            toast.success(`${item.pigId} successfully moved to ${result.targetStage} stage (pregnancy failed)!`, {
                id: loadingToast,
                duration: 3000,
            });
        } else {
            toast.error('Failed to move pig to fattening stage', { id: loadingToast });
        }
    };

    const handleAction = (action, item) => {
        if (action.key === 'move') {
            handleMoveToFarrowing(action, item);
        } else if (action.key === 'pregnancy-failed') {
            handleMoveToFattening(action, item);
        }
    };

    // Calculate days in stage
    const calculateDaysInStage = (inDate) => {
        if (!inDate) return 0;
        const startDate = new Date(inDate);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Current records table columns
    const currentRecordsColumns = [
        // { key: 'recordId', label: 'Record ID', sortable: true },
        { key: 'pigId', label: 'Pig ID', sortable: true },
        { key: 'inDate', label: 'In Date', sortable: true },
        {
            key: 'expectedExitDate',
            label: 'Expected Exit',
            sortable: true,
            render: (_, item) => item.stageSpecificData?.expectedExitDate || 'N/A'
        },
        {
            key: 'daysInStage',
            label: 'Days in Stage',
            sortable: true,
            render: (_, item) => `${calculateDaysInStage(item.inDate)} days`
        },
        { key: 'breed', label: 'Breed', sortable: true },
    ];

    // History records table columns
    const historyRecordsColumns = [
        // { key: 'recordId', label: 'Record ID', sortable: true },
        { key: 'pigId', label: 'Pig ID', sortable: true },
        { key: 'inDate', label: 'In Date', sortable: true },
        { key: 'outDate', label: 'Out Date', sortable: true },
        {
            key: 'totalDays',
            label: 'Total Days',
            sortable: true,
            render: (value) => `${value} days`
        },
        {
            key: 'finalWeight',
            label: 'Final Weight',
            sortable: true,
            render: (value) => `${value} kg`
        },
        { key: 'outcome', label: 'Outcome', sortable: false }
    ];

    // Action buttons for current records
    const currentRecordsActions = [
        {
            key: 'move',
            label: 'Move to Farrowing',
            className: 'inline-flex items-center px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm mr-2',
            requiresConfirmation: true,
            confirmationMessage: 'This will move the pig to Farrowing stage. This action cannot be reversed.',
            disabled: (item) => isMovingPig && movingPigId === item.recordId,
            render: (item) => (
                <>
                    {isMovingPig && movingPigId === item.recordId ? (
                        <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-purple-600 mr-1"></div>
                            Moving...
                        </>
                    ) : (
                        'Move to Farrowing'
                    )}
                </>
            )
        },
        {
            key: 'pregnancy-failed',
            label: 'Pregnancy Failed',
            className: 'inline-flex items-center px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm',
            requiresConfirmation: true,
            confirmationMessage: 'This will mark the pregnancy as failed and move the pig to Fattening stage. This action cannot be reversed.',
            disabled: (item) => isMovingPig && movingPigId === item.recordId,
            render: (item) => (
                <>
                    {isMovingPig && movingPigId === item.recordId ? (
                        <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-600 mr-1"></div>
                            Processing...
                        </>
                    ) : (
                        'Pregnancy Failed'
                    )}
                </>
            )
        }
    ];

    // Action buttons for history
    const historyRecordsActions = [];

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
                                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
                                Gestation Management
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                Track sows during pregnancy period (114 days)
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
                                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Calendar className="h-4 w-4 inline mr-2" />
                                    Current Gestation
                                    {selectedFilter === 'current' && ` (${currentGestation.length})`}
                                </button>
                                <button
                                    onClick={() => setSelectedFilter('history')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'history'
                                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <History className="h-4 w-4 inline mr-2" />
                                    Gestation History
                                    {selectedFilter === 'history' && ` (${filteredHistoryRecords.length})`}
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 sm:p-6">
                            {selectedFilter === 'current' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Active Gestation Records
                                    </h3>
                                    <AdvancedTable
                                        data={currentGestation}
                                        columns={currentRecordsColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="pigId"
                                        actionButtons={currentRecordsActions}
                                        onAction={handleAction}
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
                                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {months.map((month, index) => (
                                                <option key={index} value={index}>{month}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {[2023, 2024, 2025].map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Note:</strong> Search functionality works within the selected month's data only.
                                            Showing records for {months[selectedMonth]} {selectedYear}.
                                        </p>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Gestation History
                                    </h3>
                                    <AdvancedTable
                                        data={filteredHistoryRecords}
                                        columns={historyRecordsColumns}
                                        searchPlaceholder={`Search within ${months[selectedMonth]} ${selectedYear} data...`}
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
        </div>
    );

    // return (
    //     <div>
    //         Chiman
    //     </div>
    // )
};

export default GestationStage;