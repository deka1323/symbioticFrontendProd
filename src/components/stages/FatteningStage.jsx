import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TrendingUp, Calendar, History, Filter } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { selectIsMovingPig, selectMovingPigId } from '../../store/selectors/pigSelectors';
import AdvancedTable from '../common/AdvancedTable';

const FatteningStage = () => {
    const dispatch = useDispatch();
    const [selectedFilter, setSelectedFilter] = useState('current');
    const [showWeightFilter, setShowWeightFilter] = useState(false);
    const [weightRange, setWeightRange] = useState({ min: '', max: '' });
    const [filteredData, setFilteredData] = useState([]);

    // Redux selectors
    const isMovingPig = useSelector(selectIsMovingPig);
    const movingPigId = useSelector(selectMovingPigId);

    const handleSellPig = async (action, item) => {
        const loadingToast = toast.loading(`Processing sale for ${item.pigId}...`);

        try {
            // Here you would dispatch an action to mark pig as sold
            toast.success(`${item.pigId} successfully marked as sold!`, {
                id: loadingToast,
                duration: 3000,
            });
        } catch (error) {
            toast.error('An error occurred while processing the sale', {
                id: loadingToast,
            });
        }
    };

    const applyWeightFilter = () => {
        const min = parseFloat(weightRange.min) || 0;
        const max = parseFloat(weightRange.max) || Infinity;

        const filtered = mockCurrentRecords.filter(pig =>
            pig.weight >= min && pig.weight <= max
        );

        setFilteredData(filtered);
        toast.success(`Found ${filtered.length} pigs in weight range ${min}kg - ${max === Infinity ? '∞' : max}kg`);
        setShowWeightFilter(false);
    };

    const clearWeightFilter = () => {
        setFilteredData([]);
        setWeightRange({ min: '', max: '' });
        toast.info('Weight filter cleared');
    };

    // Mock data for demonstration
    const mockCurrentRecords = [
        {
            id: 'FT001',
            pigId: 'PIG101',
            fatherPigId: 'BOAR003',
            motherPigId: 'PIG001',
            breed: 'Yorkshire-Duroc',
            sex: 'female',
            weight: 45.5,
            inDate: '2024-03-01',
            status: 'active'
        },
        {
            id: 'FT002',
            pigId: 'PIG102',
            fatherPigId: 'BOAR003',
            motherPigId: 'PIG001',
            breed: 'Yorkshire-Duroc',
            sex: 'male',
            weight: 52.3,
            inDate: '2024-03-01',
            status: 'active'
        },
        {
            id: 'FT003',
            pigId: 'PIG103',
            fatherPigId: 'BOAR005',
            motherPigId: 'PIG025',
            breed: 'Landrace-Hampshire',
            sex: 'female',
            weight: 38.7,
            inDate: '2024-03-05',
            status: 'active'
        }
    ];

    const mockHistoryRecords = [
        {
            id: 'FT004',
            pigId: 'PIG090',
            fatherPigId: 'BOAR001',
            motherPigId: 'PIG010',
            breed: 'Yorkshire',
            sex: 'male',
            weight: 65.2,
            inDate: '2024-01-15',
            outDate: '2024-02-20',
            status: 'sold',
            outcome: 'Sold to market'
        }
    ];

    const dataToShow = filteredData.length > 0 ? filteredData : mockCurrentRecords;

    // Current records table columns
    const currentRecordsColumns = [
        { key: 'pigId', label: 'Pig ID', sortable: true },
        {
            key: 'fatherPigId',
            label: 'Parents',
            sortable: true,
            render: (value, item) => (
                <div>
                    <div className="text-sm text-gray-900">Father: {value}</div>
                    <div className="text-sm text-gray-500">Mother: {item.motherPigId}</div>
                </div>
            )
        },
        { key: 'breed', label: 'Breed', sortable: true },
        {
            key: 'sex',
            label: 'Sex',
            sortable: true,
            render: (value) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                    }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'weight',
            label: 'Weight (kg)',
            sortable: true,
            render: (value) => `${value} kg`
        },
        { key: 'inDate', label: 'In Date', sortable: true },
    ];

    // History records table columns
    const historyRecordsColumns = [
        { key: 'pigId', label: 'Pig ID', sortable: true },
        {
            key: 'fatherPigId',
            label: 'Parents',
            sortable: true,
            render: (value, item) => (
                <div>
                    <div className="text-sm text-gray-900">Father: {value}</div>
                    <div className="text-sm text-gray-500">Mother: {item.motherPigId}</div>
                </div>
            )
        },
        { key: 'breed', label: 'Breed', sortable: true },
        {
            key: 'sex',
            label: 'Sex',
            sortable: true,
            render: (value) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                    }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'weight',
            label: 'Final Weight',
            sortable: true,
            render: (value) => `${value} kg`
        },
        { key: 'inDate', label: 'In Date', sortable: true },
        { key: 'outDate', label: 'Out Date', sortable: true },
        { key: 'outcome', label: 'Outcome', sortable: false }
    ];

    // Action buttons for current records
    const currentRecordsActions = [
        {
            key: 'inhouse',
            label: 'Use In-House',
            className: 'inline-flex items-center px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm',
            requiresConfirmation: true,
            confirmationMessage: 'This will mark the pig for in-house use. This action cannot be reversed.',
            disabled: (item) => isMovingPig && movingPigId === item.id,
            render: (item) => (
                <>
                    {isMovingPig && movingPigId === item.id ? (
                        <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-green-600 mr-1"></div>
                            Processing...
                        </>
                    ) : (
                        'Use In-House'
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
                                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mr-2 sm:mr-3" />
                                Fattening Management
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                Track pigs in final growth stage before market
                            </p>
                        </div>

                        {/* Weight Filter Button */}
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowWeightFilter(true)}
                                className="bg-yellow-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-yellow-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="text-sm sm:text-base">Weight Filter</span>
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

                    {/* Weight Filter Display */}
                    {filteredData.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-yellow-800">
                                <strong>Active Filter:</strong> Weight range {weightRange.min || '0'}kg - {weightRange.max || '∞'}kg
                                ({filteredData.length} pigs found)
                            </p>
                        </div>
                    )}

                    {/* Filter Tabs */}
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
                                    Current Fattening ({dataToShow.length})
                                </button>
                                <button
                                    onClick={() => setSelectedFilter('history')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'history'
                                            ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
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
                                        Active Fattening Records
                                    </h3>
                                    <AdvancedTable
                                        data={dataToShow}
                                        columns={currentRecordsColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="pigId"
                                        actionButtons={currentRecordsActions}
                                        onAction={handleSellPig}
                                    />
                                </div>
                            )}

                            {selectedFilter === 'history' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Fattening History
                                    </h3>
                                    <AdvancedTable
                                        data={mockHistoryRecords}
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
                                    onChange={(e) => setWeightRange({ ...weightRange, min: e.target.value })}
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
                                    onChange={(e) => setWeightRange({ ...weightRange, max: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="e.g., 60"
                                />
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    Leave fields empty for no limit. For example, enter only minimum weight to find all pigs above that weight.
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