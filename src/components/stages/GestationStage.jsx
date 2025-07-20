import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Calendar, History } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { moveToNextStage } from '../../store/actions/pigActions';
import { selectIsMovingPig, selectMovingPigId } from '../../store/selectors/pigSelectors';
import AdvancedTable from '../common/AdvancedTable';

const GestationStage = () => {
    const dispatch = useDispatch();
    const [selectedFilter, setSelectedFilter] = useState('current');

    // Month filter for history
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Redux selectors
    const isMovingPig = useSelector(selectIsMovingPig);
    const movingPigId = useSelector(selectMovingPigId);

    const handleMoveToNextStage = async (action, item) => {
        const nextStage = action.key === 'pregnancy-failed' ? 'Fattening' : 'Farrowing';
        const loadingToast = toast.loading(`Moving ${item.pigId} to ${nextStage} stage...`);

        try {
            const result = await dispatch(moveToNextStage(item.pigId, 'gestation', action.key === 'pregnancy-failed'));

            if (result.success) {
                toast.success(`${item.pigId} successfully moved to ${result.nextStage} stage!`, {
                    id: loadingToast,
                    duration: 3000,
                });
            } else {
                toast.error(`Failed to move pig to ${nextStage} stage`, {
                    id: loadingToast,
                });
            }
        } catch (error) {
            toast.error('An error occurred while moving the pig', {
                id: loadingToast,
            });
        }
    };

    // Mock data for demonstration
    const mockCurrentRecords = [
        {
            id: 'GS001',
            pigId: 'PIG001',
            inDate: '2024-01-15',
            expectedExitDate: '2024-05-08',
            daysInStage: 15,
            breed: 'Yorkshire',
            weight: 45.5,
            status: 'healthy',
            notes: 'Regular monitoring required'
        },
        {
            id: 'GS002',
            pigId: 'PIG025',
            inDate: '2024-01-10',
            expectedExitDate: '2024-05-03',
            daysInStage: 20,
            breed: 'Landrace',
            weight: 52.3,
            status: 'healthy',
            notes: 'Extra nutrition provided'
        }
    ];

    const mockHistoryRecords = [
        {
            id: 'GS003',
            pigId: 'PIG015',
            inDate: '2023-12-01',
            outDate: '2023-12-20',
            totalDays: 19,
            breed: 'Yorkshire',
            finalWeight: 48.2,
            status: 'completed',
            outcome: 'Moved to farrowing'
        }
    ];

    // Filter history records by month
    const filteredHistoryRecords = mockHistoryRecords.filter(record => {
        const recordDate = new Date(record.outDate);
        return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
    });

    // Current records table columns
    const currentRecordsColumns = [
        { key: 'id', label: 'Record ID', sortable: true },
        { key: 'pigId', label: 'Pig ID', sortable: true },
        { key: 'inDate', label: 'In Date', sortable: true },
        { key: 'expectedExitDate', label: 'Expected Exit', sortable: true },
        {
            key: 'daysInStage',
            label: 'Days in Stage',
            sortable: true,
            render: (value) => `${value} days`
        },
        { key: 'breed', label: 'Breed', sortable: true },
        {
            key: 'weight',
            label: 'Weight (kg)',
            sortable: true,
            render: (value) => `${value} kg`
        },
    ];

    // History records table columns
    const historyRecordsColumns = [
        { key: 'id', label: 'Record ID', sortable: true },
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
            className: 'inline-flex items-center px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm',
            requiresConfirmation: true,
            confirmationMessage: 'This will move the pig to Farrowing stage. This action cannot be reversed.',
            disabled: (item) => isMovingPig && movingPigId === item.id,
            render: (item) => (
                <>
                    {isMovingPig && movingPigId === item.id ? (
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
            disabled: (item) => isMovingPig && movingPigId === item.id,
            render: (item) => (
                <>
                    {isMovingPig && movingPigId === item.id ? (
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
    const historyRecordsActions = [
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
                                    Current Gestation ({mockCurrentRecords.length})
                                </button>
                                <button
                                    onClick={() => setSelectedFilter('history')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'history'
                                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <History className="h-4 w-4 inline mr-2" />
                                    History ({mockHistoryRecords.length})
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
                                        data={mockCurrentRecords}
                                        columns={currentRecordsColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="pigId"
                                        actionButtons={currentRecordsActions}
                                        onAction={handleMoveToNextStage}
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Gestation History
                                    </h3>
                                    <AdvancedTable
                                        data={filteredHistoryRecords}
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
        </div>
    );
};

export default GestationStage;