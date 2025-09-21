import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TrendingUp, Calendar, History, Filter } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import {
    selectCurrentFatteningRecords,
    selectFatteningHistory,
    selectIsMovingPig,
    selectMovingPigId,
} from '../../store/selectors/pigSelectors';
import { fetchCurrentFatteningRecords, fetchFatteningHistoryByMonth, moveFatteningToDried, moveFatteningToInHouse } from '../../store/actions/pigActions';
import AdvancedTable from '../common/AdvancedTable';


const FatteningStage = () => {
    const dispatch = useDispatch();
    const [selectedFilter, setSelectedFilter] = useState('current');
    const [showWeightFilter, setShowWeightFilter] = useState(false);
    const [weightRange, setWeightRange] = useState({ min: '', max: '' });
    const [filteredData, setFilteredData] = useState([]);

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
    const currentRecords = useSelector(selectCurrentFatteningRecords);
    const historyRecords = useSelector(selectFatteningHistory);

    console.log("currentRecords - ", currentRecords)

    const selectedFarm = "F1"; // fixed for now

    // Fetch data when filter or month/year changes
    useEffect(() => {
        if (selectedFilter === 'current') {
            dispatch(fetchCurrentFatteningRecords(selectedFarm));
        } else {
            dispatch(fetchFatteningHistoryByMonth(selectedYear, selectedMonth + 1, selectedFarm));
        }
    }, [dispatch, selectedFilter, selectedMonth, selectedYear, selectedFarm]);

    // const handleSellPig = async (action, item) => {
    //     const loadingToast = toast.loading(`Processing sale for ${item.pigId}...`);
    //     try {
    //         // TODO: dispatch action here to update pig status
    //         toast.success(`${item.pigId} successfully marked as sold!`, {
    //             id: loadingToast,
    //             duration: 3000,
    //         });
    //     } catch (error) {
    //         toast.error('An error occurred while processing the sale', {
    //             id: loadingToast,
    //         });
    //     }
    // };

    const handleMoveToDried = async (action, item) => {
        const loadingToast = toast.loading(`Moving ${item.pigId} to Dried stage...`);
        const result = await dispatch(moveFatteningToDried({ ...item, selectedFarm }));
        console.log("result handle - ", result)

        if (result.success) {
            toast.success(`${item.pigId} successfully moved to ${result.targetStage} stage!`, {
                id: loadingToast,
                duration: 3000,
            });
        } else {
            toast.error('Failed to move pig to Dried stage', { id: loadingToast });
        }
    };

    const handleMoveToInHouse = async (action, item) => {
        const loadingToast = toast.loading(`Moving ${item.pigId} to InHouse)...`);
        const result = await dispatch(moveFatteningToInHouse({ ...item, selectedFarm }));

        if (result.success) {
            toast.success(`${item.pigId} successfully moved to ${result.targetStage} !`, {
                id: loadingToast,
                duration: 3000,
            });
        } else {
            toast.error('Failed to move pig to InHouse stage', { id: loadingToast });
        }
    };

    const handleAction = (action, item) => {
        if (action.key === 'dried') {
            handleMoveToDried(action, item);
        } else if (action.key === 'inhouse') {
            handleMoveToInHouse(action, item);
        }
    };


    const applyWeightFilter = () => {
        const min = parseFloat(weightRange.min) || 0;
        const max = parseFloat(weightRange.max) || Infinity;

        const sourceData =
            selectedFilter === 'current'
                ? currentRecords
                : historyRecords;

        const filtered = sourceData.filter(
            pig => pig.weight >= min && pig.weight <= max
        );

        setFilteredData(filtered);
        toast.success(
            `Found ${filtered.length} pigs in weight range ${min}kg - ${max === Infinity ? '∞' : max}kg`
        );
        setShowWeightFilter(false);
    };

    const clearWeightFilter = () => {
        setFilteredData([]);
        setWeightRange({ min: '', max: '' });
        toast.info('Weight filter cleared');
    };

    // Filter history records by month/year
    const filteredHistoryRecords = historyRecords.filter(record => {
        const recordDate = new Date(record.outDate);
        return (
            recordDate.getMonth() === selectedMonth &&
            recordDate.getFullYear() === selectedYear
        );
    });

    // Data source for current vs history
    const dataToShow =
        filteredData.length > 0
            ? filteredData
            : selectedFilter === 'current'
                ? currentRecords
                : filteredHistoryRecords;

    // Columns definition
    const baseColumns = [
        { key: 'pigId', label: 'Pig ID', sortable: true },
        // {
        //     key: 'fatherPigId',
        //     label: 'Parents',
        //     sortable: true,
        //     render: (value, item) => (
        //         <div>
        //             <div className="text-sm text-gray-900">Father: {value}</div>
        //             <div className="text-sm text-gray-500">Mother: {item.motherPigId}</div>
        //         </div>
        //     ),
        // },
        { key: 'breed', label: 'Breed', sortable: true },
        {
            key: 'sex',
            label: 'Sex',
            sortable: true,
            render: (value) => (
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'male'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-pink-100 text-pink-800'
                        }`}
                >
                    {value}
                </span>
            ),
        },
    ];

    const currentRecordsColumns = [
        ...baseColumns,
        {
            key: 'weight',
            label: 'Weight (kg)',
            sortable: true,
            render: (value) => `${value} kg`,
        },
        { key: 'inDate', label: 'In Date', sortable: true },
        {
            key: 'pregnancyFailed',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                        }`}
                >
                    {value ? 'Pregnancy Failed' : 'Normal'}
                </span>
            ),
        },
    ];

    const historyRecordsColumns = [
        ...baseColumns,
        {
            key: 'weight',
            label: 'Final Weight',
            sortable: true,
            render: (value) => `${value} kg`,
        },
        { key: 'inDate', label: 'In Date', sortable: true },
        { key: 'outDate', label: 'Out Date', sortable: true },
        // { key: 'outcome', label: 'Outcome', sortable: false },
        {
            key: 'pregnancyFailed',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                        }`}
                >
                    {value ? 'Pregnancy Failed' : 'Normal'}
                </span>
            ),
        },
    ];

    // Action buttons
    const currentRecordsActions = [
        {
            key: 'inhouse',
            label: 'Use In-House',
            className:
                'inline-flex items-center px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm',
            requiresConfirmation: true,
            confirmationMessage:
                'This will mark the pig for in-house use. This action cannot be reversed.',
            disabled: (item) => isMovingPig && movingPigId === item.id,
            render: (item) =>
                isMovingPig && movingPigId === item.id ? (
                    <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-green-600 mr-1"></div>
                        Processing...
                    </>
                ) : (
                    'Use In-House'
                ),
        },
        {
            key: 'dried',
            label: 'Send to Dry',
            className:
                'inline-flex items-center px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm',
            requiresConfirmation: true,
            confirmationMessage:
                'This will mark the pig for dried use. This action cannot be reversed.',
            disabled: (item) => isMovingPig && movingPigId === item.id,
            render: (item) =>
                isMovingPig && movingPigId === item.id ? (
                    <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-green-600 mr-1"></div>
                        Processing...
                    </>
                ) : (
                    'Send To Dry'
                ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mr-2 sm:mr-3" />
                                Fattening Management
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                Track pigs in final growth stage before market
                            </p>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowWeightFilter(true)}
                                className="bg-yellow-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-yellow-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="text-sm sm:text-base">
                                    Weight Filter
                                </span>
                            </button>

                            {filteredData.length > 0 && (
                                <button
                                    onClick={clearWeightFilter}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-all duration-200 text-sm"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
                        <div className="border-b border-gray-200">
                            <nav className="flex">
                                <button
                                    onClick={() => setSelectedFilter('current')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'current'
                                        ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Calendar className="h-4 w-4 inline mr-2" />
                                    Current Fattening ({currentRecords.length})
                                </button>
                                <button
                                    onClick={() => setSelectedFilter('history')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'history'
                                        ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <History className="h-4 w-4 inline mr-2" />
                                    History ({historyRecords.length})
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 sm:p-6">
                            {selectedFilter === 'current' && (
                                <AdvancedTable
                                    data={dataToShow}
                                    columns={currentRecordsColumns}
                                    searchPlaceholder="Search by Pig ID..."
                                    searchKey="pigId"
                                    actionButtons={currentRecordsActions}
                                    // onAction={handleSellPig}
                                    onAction={handleAction}

                                />
                            )}

                            {selectedFilter === 'history' && (
                                <div>
                                    <div className="mb-4 flex items-center space-x-4">
                                        <span className="text-sm font-medium text-gray-700">
                                            Filter by month:
                                        </span>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) =>
                                                setSelectedMonth(
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        >
                                            {months.map((month, index) => (
                                                <option
                                                    key={index}
                                                    value={index}
                                                >
                                                    {month}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) =>
                                                setSelectedYear(
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        >
                                            {[2023, 2024, 2025].map((year) => (
                                                <option
                                                    key={year}
                                                    value={year}
                                                >
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <AdvancedTable
                                        data={dataToShow}
                                        columns={historyRecordsColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="pigId"
                                        actionButtons={[]}
                                        onAction={() => { }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Weight Filter Modal */}
            {showWeightFilter && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Filter by Weight Range
                            </h3>
                            <button
                                onClick={() => setShowWeightFilter(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={weightRange.min}
                                    onChange={(e) =>
                                        setWeightRange({
                                            ...weightRange,
                                            min: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="e.g., 30"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={weightRange.max}
                                    onChange={(e) =>
                                        setWeightRange({
                                            ...weightRange,
                                            max: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="e.g., 60"
                                />
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    Leave fields empty for no limit. For
                                    example, enter only minimum weight to find
                                    all pigs above that weight.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => setShowWeightFilter(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={applyWeightFilter}
                                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FatteningStage;
