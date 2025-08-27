import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Sprout, Calendar, History, Edit, X, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { fetchCurrentFarm, fetchCurrentNurseryLitterRecords, fetchCurrentNurseryRecords, updatePigletBasicRecord, updatePigletRecord } from '../../store/actions/pigActions';
import { selectIsMovingPig, selectMovingPigId, selectCurrentNurseryLitterRecords, selectCurrentNurseryRecords, currentFarmRecord } from '../../store/selectors/pigSelectors';
import AdvancedTable from '../common/AdvancedTable';

const NurseryStage = () => {
    const dispatch = useDispatch();
    const [selectedFilter, setSelectedFilter] = useState('current');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPiglet, setEditingPiglet] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});
    // const [selectedFarm, setSelectedFarm] = useState("F1");
    const [basicDetails, setBasicDetails] = useState({
        pigId: '',
        sex: '',
        breed: ''
    });

    const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
    const [showVaccinationModal, setShowVaccinationModal] = useState(false);


    const [vaccinationDetails, setVaccinationDetails] = useState({
        weight: '',
        csfDate: '',
        otherVaccination: '',
        otherVaccinationName: '',
        otherVaccinationPeriod: '',
    });


    // Month filter for history
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [breedSummary, setBreedSummary] = useState({});
    const [isBreedEditable, setIsBreedEditable] = useState(false);


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
    const isMovingPig = useSelector(selectIsMovingPig);
    const movingPigId = useSelector(selectMovingPigId);
    const currentNurseryLitterRecords = useSelector(selectCurrentNurseryLitterRecords);
    const currentNurseryRecords = useSelector(selectCurrentNurseryRecords);


    useEffect(() => {
        if (selectedFilter === 'current') {
            dispatch(fetchCurrentNurseryLitterRecords(selectedFarm));
        } else {
            dispatch(fetchCurrentNurseryRecords(selectedFarm));
        }
    }, [dispatch, selectedFilter, selectedMonth, selectedYear]);



    useEffect(() => {
        if (currentNurseryRecords && currentNurseryRecords.length > 0) {
            const summary = currentNurseryRecords.reduce((acc, pig) => {
                const { breed, sex } = pig;
                if (!acc[breed]) {
                    acc[breed] = { male: 0, female: 0 };
                }
                acc[breed][sex] = (acc[breed][sex] || 0) + 1;
                return acc;
            }, {});
            setBreedSummary(summary);
        }
    }, [currentNurseryRecords]);



    const handleMoveToNextStage = async (action, item) => {
        const loadingToast = toast.loading(`Moving litter ${item.litterId} to Fattening stage...`);

        try {
            const result = await dispatch(moveToNextStage(item.litterId, 'nursery'));

            if (result.success) {
                toast.success(`Litter ${item.litterId} successfully moved to ${result.nextStage} stage!`, {
                    id: loadingToast,
                    duration: 3000,
                });
            } else {
                toast.error('Failed to move litter to next stage', {
                    id: loadingToast,
                });
            }
        } catch (error) {
            toast.error('An error occurred while moving the litter', {
                id: loadingToast,
            });
        }
    };

    const handleMovePigletToFattening = async (piglet, parentRecord) => {
        const loadingToast = toast.loading(`Moving piglet ${piglet.pigId} to Fattening stage...`);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success(`Piglet ${piglet.pigId} successfully moved to Fattening stage!`, {
                id: loadingToast,
                duration: 3000,
            });
        } catch (error) {
            toast.error('An error occurred while moving the piglet', {
                id: loadingToast,
            });
        }
    };

    const handleEditBasicInfo = (piglet, parent) => {
        const autoBreed = generateBreed(parent.breed, parent.boarBreed);
        setBasicDetails({
            ...basicDetails,
            litterId: piglet.litterId,
            pigletId: piglet.pigletId,
            motherPigId: parent.pigId,
            fatherPigId: parent.boarId,
            dateOfBirth: piglet.dob,
            selectedFarm: parent.selectedFarm,
            breed: autoBreed,


        });
        setIsBreedEditable(false);
        setShowBasicInfoModal(true);
    };

    const handleEditVaccination = (piglet, parent) => {
        setVaccinationDetails({
            ...vaccinationDetails,
            litterId: piglet.litterId,
            pigletId: piglet.pigletId,
            selectedFarm: parent.selectedFarm,
            pigId: piglet.pigId,
        });
        setShowVaccinationModal(true);
    };


    const handleSaveBasicDetails = () => {
        const { pigId, sex, breed } = basicDetails;
        if (!pigId || !sex || !breed) {
            toast.error("All fields (Pig ID, Sex, Breed) are mandatory!");
            return;
        }

        try {
            // await dispatch(updatePigletBasicRecord(basicDetails));
            console.log("basic details -> ", basicDetails);
            dispatch(updatePigletBasicRecord(basicDetails));
            toast.success('Basic details updated successfully!');
            setShowBasicInfoModal(false)
            setBasicDetails({
                pigId: '',
                sex: '',
                breed: ''
            })
        } catch (err) {
            toast.error('Failed to update farrowing record');
        }
    };


    const handleSaveVaccinationDetails = () => {
        try {
            dispatch(updatePigletRecord(vaccinationDetails));
            toast.success('Vaccination details updated successfully!');
            setShowVaccinationModal(false)
            setVaccinationDetails({
                weight: '',
                csfDate: '',
                otherVaccination: '',
                otherVaccinationName: '',
                otherVaccinationPeriod: '',
            })
        } catch (err) {
            toast.error('Failed to update farrowing record');
        }
    };

    const toggleRowExpansion = (recordId) => {
        setExpandedRows(prev => ({
            ...prev,
            [recordId]: !prev[recordId]
        }));
    };


    // Current records table columns
    const currentRecordsColumns = [
        {
            key: 'expand',
            label: '',
            render: (value, item) => (
                <button
                    onClick={() => toggleRowExpansion(item.id)}
                    className="text-green-600 hover:text-green-800"
                >
                    {expandedRows[item.id] ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </button>
            )
        },
        { key: 'litterId', label: 'Litter ID', sortable: true },
        {
            key: 'sowId',
            label: 'Parents',
            sortable: true,
            render: (value, item) => (
                <div>
                    <div className="text-sm text-gray-900">Sow: {value}</div>
                    <div className="text-sm text-gray-500">Boar: {item.boarId}</div>
                </div>
            )
        },
        { key: 'inDate', label: 'In Date', sortable: true },
        { key: 'weaningDate', label: 'Weaning Date', sortable: true },
        { key: 'totalPiglets', label: 'Total Piglets', sortable: true },
    ];

    // History records table columns
    const nurseredRecordsColumns = [
        { key: 'recordId', label: 'Nursery ID', sortable: true },
        { key: 'pigId', label: 'Pig ID', sortable: true },
        {
            key: 'sowId',
            label: 'Parents',
            sortable: true,
            render: (value, item) => (
                <div>
                    <div className="text-sm text-gray-900">Sow: {value}</div>
                    <div className="text-sm text-gray-500">Boar: {item.boarId}</div>
                </div>
            )
        },
        { key: 'breed', label: 'Breed', sortable: true },
        { key: 'inDate', label: 'In Date', sortable: true },
        { key: 'outDate', label: 'Out Date', sortable: true },
    ];

    // Action buttons for current records
    const currentRecordsActions = [
        {
            key: 'move',
            label: 'Move to Fattening',
            className: 'inline-flex items-center px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm',
            requiresConfirmation: true,
            confirmationMessage: 'This will move all piglets in this litter to Fattening stage. This action cannot be reversed.',
            disabled: (item) => isMovingPig && movingPigId === item.id,
            render: (item) => (
                <>
                    {isMovingPig && movingPigId === item.id ? (
                        <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-yellow-600 mr-1"></div>
                            Moving...
                        </>
                    ) : (
                        'Move to Fattening'
                    )}
                </>
            )
        }
    ];


    // Custom row renderer for expanded piglet details
    const renderExpandedRow = (item) => {
        if (!expandedRows[item.id]) return null;

        return (
            <tr key={`${item.id}-expanded`}>
                <td colSpan={currentRecordsColumns.length + 1} className="px-6 py-4 bg-gray-50">
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Piglet Details:</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pig ID</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">D.O.B</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">D.O.W</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sex</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Breed</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">CSF Date</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Other Vaccination</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {item.piglets.map((piglet) => (
                                        <tr key={piglet.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-sm text-gray-900">{piglet.pigId}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900">{piglet.dob}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900">{piglet.dow}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900">{piglet.weight} kg</td>
                                            <td className="px-3 py-2 text-sm text-gray-900 capitalize">{piglet.sex}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900">{piglet.breed}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900">{piglet.csfDate || 'Not given'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-900">
                                                {piglet.otherVaccinationName ? `${piglet.otherVaccinationName} (${piglet.otherVaccination})` : 'Not given'}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditBasicInfo(piglet, item)}
                                                        className="text-green-600 hover:text-green-900 flex items-center text-xs"
                                                        disabled={piglet.currentStage !== 'nursery'}
                                                    >
                                                        <Edit className="h-3 w-3 mr-1" />
                                                        Edit Basic
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditVaccination(piglet, item)}
                                                        className="text-green-600 hover:text-green-900 flex items-center text-xs"
                                                        disabled={piglet.currentStage !== 'nursery'}
                                                    >
                                                        <Edit className="h-3 w-3 mr-1" />
                                                        Edit Vaccination
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    // Mapping full breed names -> short forms
    const BREED_MAP = {
        "DUROC": "D",
        "DUROC CROSS": "DC",
        "LARGE WHITE YORKSHIRE": "LWY",
        "LANDRACE": "LAN",
        "HAMPSHIRE": "HAMP",
        "LARGE BLACK": "LB",
    };

    // Utility: convert full breed string to short form
    const normalizeBreed = (breed) => {
        if (!breed) return "";
        const clean = breed.trim().toUpperCase();

        // Try exact match
        if (BREED_MAP[clean]) return BREED_MAP[clean];

        // If it's already a short form like B1, F1(...) or "D", return as-is
        if (/^F\d+\(.+\)$/.test(clean) || Object.values(BREED_MAP).includes(clean) || /^B\d+$/.test(clean)) {
            return clean;
        }

        return clean; // fallback (keep input)
    };

    // Generate Breed from parents
    const generateBreed = (firstParent, secondParent) => {
        // Parse normalized breed
        const parseBreed = (breed) => {
            breed = normalizeBreed(breed);

            let gen = 0;
            let parts = [];

            // e.g., F2(D/LWY) → gen=2, parts=[D,LWY]
            const match = breed.match(/^F(\d+)\((.+)\)$/);
            if (match) {
                gen = parseInt(match[1], 10);
                parts = match[2].split("/");
            } else {
                parts = [breed];
            }

            return { gen, parts };
        };

        const parent1 = parseBreed(firstParent);
        const parent2 = parseBreed(secondParent);

        // If both are same pure breeds → offspring same
        if (
            parent1.parts.length === 1 &&
            parent2.parts.length === 1 &&
            parent1.parts[0] === parent2.parts[0]
        ) {
            return parent1.parts[0];
        }

        // Merge parent breeds (remove duplicates, keep order)
        const allParts = [...parent1.parts, ...parent2.parts];
        const uniqueParts = [...new Set(allParts)];

        // Generation = max parent gen + 1
        const generation = Math.max(parent1.gen, parent2.gen) + 1;

        return `F${generation}(${uniqueParts.join("/")})`;
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
                                <Sprout className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3" />
                                Nursery Management
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                Track piglets from birth to weaning with individual piglet details
                            </p>
                        </div>
                    </div>

                    {/* Breed Summary Section */}
                    {Object.keys(breedSummary).length > 0 && (
                        <div className="bg-white shadow rounded-lg p-4 mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Breed-wise Pig Distribution</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(breedSummary).map(([breed, counts]) => {
                                    const total = counts.male + counts.female;
                                    return (
                                        <div
                                            key={breed}
                                            className="border rounded-lg p-3 bg-gray-50 hover:shadow transition"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-sm font-bold text-gray-900">{breed}</h3>
                                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                                    Total: {total}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-700 space-y-1">
                                                <p>🐖 Male: <span className="font-semibold text-blue-600">{counts.male}</span></p>
                                                <p>🐖 Female: <span className="font-semibold text-pink-600">{counts.female}</span></p>
                                            </div>
                                        </div>
                                    );
                                })}
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
                                        ? 'border-green-500 text-green-600 bg-green-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Calendar className="h-4 w-4 inline mr-2" />
                                    Current Nursery Litter({currentNurseryLitterRecords.length})
                                </button>
                                <button
                                    onClick={() => setSelectedFilter('nursered')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'history'
                                        ? 'border-green-500 text-green-600 bg-green-50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <History className="h-4 w-4 inline mr-2" />
                                    Current Nursery Piglets ({currentNurseryRecords.length})
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 sm:p-6">
                            {selectedFilter === 'current' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Active Nursery Litter Records
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Click the arrow to expand and view individual piglet details. Click Edit to modify piglet information.
                                    </p>
                                    <AdvancedTable
                                        data={currentNurseryLitterRecords}
                                        columns={currentRecordsColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="sowId"
                                        onAction={handleMoveToNextStage}
                                        customRowRenderer={renderExpandedRow}
                                    />
                                </div>
                            )}

                            {selectedFilter === 'nursered' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Nursered Pigs
                                    </h3>
                                    <AdvancedTable
                                        data={currentNurseryRecords}
                                        columns={nurseredRecordsColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="pigId"
                                        onAction={() => { }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>



            {showBasicInfoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Edit Basic Details</h3>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                                <div>
                                    <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Changing Pig ID will affect all future tracking and records.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pig ID *
                            </label>
                            <input
                                type="text"
                                required
                                value={basicDetails.pigId}
                                onChange={(e) =>
                                    setBasicDetails({ ...basicDetails, pigId: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Enter unique Pig ID"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sex *
                            </label>
                            <select
                                required
                                value={basicDetails.sex}
                                onChange={(e) =>
                                    setBasicDetails({ ...basicDetails, sex: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                <option value="">Select Sex</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Breed *
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    required
                                    value={basicDetails.breed}
                                    onChange={(e) =>
                                        setBasicDetails({ ...basicDetails, breed: e.target.value })
                                    }
                                    className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
                                    placeholder="e.g., Yorkshire-Duroc"
                                    disabled={!isBreedEditable}   // 🔒 lock until cleared
                                />
                                {basicDetails.breed && !isBreedEditable && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBasicDetails({ ...basicDetails, breed: "" });
                                            setIsBreedEditable(true); // 🔓 unlock after clear
                                        }}
                                        className="px-2 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>


                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={() => setShowBasicInfoModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                            <button onClick={handleSaveBasicDetails} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showVaccinationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Edit Vaccination Details</h3>
                        {/* Inputs for Weight, CSF Date, Other Vaccination */}
                        {/* Save Button */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={vaccinationDetails.weight}
                                onChange={(e) =>
                                    setVaccinationDetails({ ...vaccinationDetails, weight: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CSF Vaccination Date
                            </label>
                            <input
                                type="date"
                                value={vaccinationDetails.csfDate}
                                onChange={(e) =>
                                    setVaccinationDetails({ ...vaccinationDetails, csfDate: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Other Vaccination Name
                            </label>
                            <input
                                type="text"
                                value={vaccinationDetails.otherVaccinationName}
                                onChange={(e) =>
                                    setVaccinationDetails({ ...vaccinationDetails, otherVaccinationName: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., FMD, Swine Flu"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Other Vaccination Date
                            </label>
                            <input
                                type="date"
                                value={vaccinationDetails.otherVaccination}
                                onChange={(e) =>
                                    setVaccinationDetails({
                                        ...vaccinationDetails,
                                        otherVaccination: e.target.value
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Other Vaccination Period
                            </label>
                            <input
                                type="number"
                                value={vaccinationDetails.otherVaccinationPeriod}
                                onChange={(e) =>
                                    setVaccinationDetails({
                                        ...vaccinationDetails,
                                        otherVaccinationPeriod: e.target.value
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={() => setShowVaccinationModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                            <button onClick={handleSaveVaccinationDetails} className="px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}



        </div>
    );
};

export default NurseryStage;