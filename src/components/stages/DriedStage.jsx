import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TrendingUp, Calendar, History, Filter } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { selectIsMovingPig, selectMovingPigId } from '../../store/selectors/pigSelectors';
import AdvancedTable from '../common/AdvancedTable';

const DriedStage = () => {
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


    // Mock data for demonstration
    // const mockCurrentRecords = [
    //     {
    //         id: 'FT001',
    //         pigId: 'PIG101',
    //         fatherPigId: 'BOAR003',
    //         motherPigId: 'PIG001',
    //         breed: 'Yorkshire-Duroc',
    //         sex: 'female',
    //         weight: 45.5,
    //         inDate: '2024-03-01',
    //         status: 'active',
    //         pregnancyFailed: false
    //     },
    //     {
    //         id: 'FT002',
    //         pigId: 'PIG102',
    //         fatherPigId: 'BOAR003',
    //         motherPigId: 'PIG001',
    //         breed: 'Yorkshire-Duroc',
    //         sex: 'male',
    //         weight: 52.3,
    //         inDate: '2024-03-01',
    //         status: 'active',
    //         pregnancyFailed: false
    //     },
    //     {
    //         id: 'FT003',
    //         pigId: 'PIG103',
    //         fatherPigId: 'BOAR005',
    //         motherPigId: 'PIG025',
    //         breed: 'Landrace-Hampshire',
    //         sex: 'female',
    //         weight: 38.7,
    //         inDate: '2024-03-05',
    //         status: 'active',
    //         pregnancyFailed: true
    //     }
    // ];

    const mockCurrentRecords = [];


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
        { key: 'inDate', label: 'In Date', sortable: true },
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
                                Dried Management
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                Track pigs in the dried stage
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
                                        ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Calendar className="h-4 w-4 inline mr-2" />
                                    Dried ({dataToShow.length})
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 sm:p-6">
                            {selectedFilter === 'current' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Dried Records
                                    </h3>
                                    <AdvancedTable
                                        data={dataToShow}
                                        columns={currentRecordsColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="pigId"
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

export default DriedStage;
