import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TrendingUp, Calendar, Filter } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import {
    selectIsMovingPig,
    selectMovingPigId,
    selectCurrentDriedRecords,
} from '../../store/selectors/pigSelectors';
import { fetchCurrentDriedRecords } from '../../store/actions/pigActions';
import AdvancedTable from '../common/AdvancedTable';

const DriedStage = () => {
    const dispatch = useDispatch();
    const [showWeightFilter, setShowWeightFilter] = useState(false);
    const [weightRange, setWeightRange] = useState({ min: '', max: '' });
    const [filteredData, setFilteredData] = useState([]);

    // Redux selectors
    const isMovingPig = useSelector(selectIsMovingPig);
    const movingPigId = useSelector(selectMovingPigId);
    const currentDriedRecords = useSelector(selectCurrentDriedRecords);

    const selectedFarm = "F1"; // fixed for now

    // Fetch on mount or farm change
    useEffect(() => {
        dispatch(fetchCurrentDriedRecords(selectedFarm));
    }, [dispatch, selectedFarm]);



    const dataToShow = filteredData.length > 0 ? filteredData : currentDriedRecords;

    // Table columns
    const columns = [
        { key: 'pigId', label: 'Pig ID', sortable: true },
        // Uncomment if needed:
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
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                    {value}
                </span>
            )
        },
        // {
        //     key: 'weight',
        //     label: 'Weight (kg)',
        //     sortable: true,
        //     render: (value) => `${value} kg`,
        // },
        { key: 'inDate', label: 'In Date', sortable: true },
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
                                Dried Management
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                Track pigs in the dried stage
                            </p>
                        </div>
                        <div className="flex space-x-2">

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
                                    className="flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 border-yellow-500 text-yellow-600 bg-yellow-50"
                                    disabled
                                >
                                    <Calendar className="h-4 w-4 inline mr-2" />
                                    Dried ({currentDriedRecords.length})
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 sm:p-6">
                            <AdvancedTable
                                data={dataToShow}
                                columns={columns}
                                searchPlaceholder="Search by Pig ID..."
                                searchKey="pigId"
                                actionButtons={[]}
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DriedStage;