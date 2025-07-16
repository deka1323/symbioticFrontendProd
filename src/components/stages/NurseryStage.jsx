import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Sprout, Calendar, History, Edit, X, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { moveToNextStage } from '../../store/actions/pigActions';
import { selectIsMovingPig, selectMovingPigId } from '../../store/selectors/pigSelectors';
import AdvancedTable from '../common/AdvancedTable';

const NurseryStage = () => {
    const dispatch = useDispatch();
    const [selectedFilter, setSelectedFilter] = useState('current');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPiglet, setEditingPiglet] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});
    const [editForm, setEditForm] = useState({
        pigId: '',
        weight: '',
        sex: '',
        breed: '',
        csfDate: '',
        otherVaccinationName: '',
        otherVaccinationDate: ''
    });

    const isMovingPig = useSelector(selectIsMovingPig);
    const movingPigId = useSelector(selectMovingPigId);

    const handleMoveToNextStage = async (action, item) => {
        const loadingToast = toast.loading(`Moving litter ${item.litterId} to Fattening stage...`);
        try {
            const result = await dispatch(moveToNextStage(item.litterId, 'nursery'));
            if (result.success) {
                toast.success(`Litter ${item.litterId} successfully moved to ${result.nextStage} stage!`, { id: loadingToast });
            } else {
                toast.error('Failed to move litter to next stage', { id: loadingToast });
            }
        } catch (error) {
            toast.error('An error occurred while moving the litter', { id: loadingToast });
        }
    };

    const handleMovePigletToFattening = async (piglet, parentRecord) => {
        const loadingToast = toast.loading(`Moving Piglet ${piglet.pigId} to Fattening...`);
        try {
            const result = await dispatch(moveToNextStage(piglet.pigId, 'nursery'));
            if (result.success) {
                toast.success(`Piglet ${piglet.pigId} moved to ${result.nextStage}!`, { id: loadingToast });
            } else {
                toast.error('Failed to move piglet to next stage', { id: loadingToast });
            }
        } catch (err) {
            toast.error('An error occurred while moving the piglet', { id: loadingToast });
        }
    };

    const handleEditPiglet = (piglet, parentRecord) => {
        setEditingPiglet({ ...piglet, parentRecord });
        setEditForm({
            pigId: piglet.pigId || '',
            weight: piglet.weight || '',
            sex: piglet.sex || '',
            breed: piglet.breed || '',
            csfDate: piglet.csfDate || '',
            otherVaccinationName: piglet.otherVaccinationName || '',
            otherVaccinationDate: piglet.otherVaccination || ''
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        toast.success('Piglet details updated successfully!');
        setShowEditModal(false);
        setEditingPiglet(null);
    };

    const toggleRowExpansion = (recordId) => {
        setExpandedRows(prev => ({ ...prev, [recordId]: !prev[recordId] }));
    };

    const mockCurrentRecords = [
        {
            id: 'NR001',
            litterId: 'LT001',
            sowId: 'PIG001',
            boarId: 'BOAR003',
            inDate: '2024-02-15',
            farrowingDate: '2024-02-10',
            weaningDate: '2024-02-15',
            totalPiglets: 7,
            status: 'active',
            piglets: [
                {
                    id: 'P001',
                    pigId: 'PIG101',
                    dob: '2024-02-10',
                    dow: '2024-02-15',
                    weight: 2.5,
                    sex: 'female',
                    breed: 'Yorkshire-Duroc',
                    csfDate: '2024-02-20',
                    otherVaccination: '2024-02-25',
                    otherVaccinationName: 'FMD',
                    inDate: '2024-02-15',
                    outDate: null,
                    currentStage: 'nursery'
                }
            ]
        }
    ];

    const mockHistoryRecords = [
        {
            id: 'NR002',
            litterId: 'LT002',
            sowId: 'PIG015',
            boarId: 'BOAR005',
            inDate: '2024-01-01',
            outDate: '2024-02-01',
            farrowingDate: '2023-12-20',
            weaningDate: '2024-01-01',
            totalPiglets: 6,
            status: 'completed',
            outcome: 'Moved to fattening'
        }
    ];

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
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {value}
                </span>
            )
        }
    ];

    // History records table columns
    const historyRecordsColumns = [
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
        { key: 'outDate', label: 'Out Date', sortable: true },
        { key: 'totalPiglets', label: 'Total Piglets', sortable: true },
        { key: 'outcome', label: 'Outcome', sortable: false }
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

    // Action buttons for history
    const historyRecordsActions = [
        {
            key: 'view',
            label: 'View Details',
            className: 'text-green-600 hover:text-green-900 text-xs sm:text-sm',
            render: () => 'View Details'
        }
    ];

    const renderExpandedRow = (item) => {
        if (!expandedRows[item.id]) return null;
        return (
            <tr key={`${item.id}-expanded`}>
                <td colSpan={8} className="px-6 py-4 bg-gray-50">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-2">Pig ID</th>
                                <th className="px-3 py-2">DOB</th>
                                <th className="px-3 py-2">Weight</th>
                                <th className="px-3 py-2">Sex</th>
                                <th className="px-3 py-2">Breed</th>
                                <th className="px-3 py-2">CSF Date</th>
                                <th className="px-3 py-2">Other Vacc.</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item.piglets.map((piglet) => (
                                <tr key={piglet.id}>
                                    <td className="px-3 py-2">{piglet.pigId}</td>
                                    <td className="px-3 py-2">{piglet.dob}</td>
                                    <td className="px-3 py-2">{piglet.weight} kg</td>
                                    <td className="px-3 py-2">{piglet.sex}</td>
                                    <td className="px-3 py-2">{piglet.breed}</td>
                                    <td className="px-3 py-2">{piglet.csfDate}</td>
                                    <td className="px-3 py-2">
                                        {piglet.otherVaccinationName
                                            ? `${piglet.otherVaccinationName} (${piglet.otherVaccination})`
                                            : 'Not given'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditPiglet(piglet, item)} className="text-green-600 text-xs">
                                                <Edit className="inline h-3 w-3 mr-1" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleMovePigletToFattening(piglet, item)}
                                                disabled={piglet.currentStage !== 'nursery'}
                                                className="text-yellow-700 text-xs bg-yellow-100 px-2 py-1 rounded"
                                            >
                                                Move
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </td>
            </tr>
        );
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
                                    Current Nursery ({mockCurrentRecords.length})
                                </button>
                                <button
                                    onClick={() => setSelectedFilter('history')}
                                    className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'history'
                                        ? 'border-green-500 text-green-600 bg-green-50'
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
                                        Active Nursery Records
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Click the arrow to expand and view individual piglet details. Click Edit to modify piglet information.
                                    </p>
                                    <AdvancedTable
                                        data={mockCurrentRecords}
                                        columns={currentRecordsColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="sowId"
                                        actionButtons={currentRecordsActions}
                                        onAction={handleMoveToNextStage}
                                        customRowRenderer={renderExpandedRow}
                                    />
                                </div>
                            )}

                            {selectedFilter === 'history' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Nursery History
                                    </h3>
                                    <AdvancedTable
                                        data={mockHistoryRecords}
                                        columns={historyRecordsColumns}
                                        searchPlaceholder="Search by Pig ID..."
                                        searchKey="sowId"
                                        actionButtons={historyRecordsActions}
                                        onAction={() => { }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Piglet Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Edit Piglet Details
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Warning Section */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                                <div>
                                    <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        While changing Pig ID, be cautious as this will affect all future tracking and records.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pig ID *
                                </label>
                                <input
                                    type="text"
                                    value={editForm.pigId}
                                    onChange={(e) => setEditForm({ ...editForm, pigId: e.target.value })}
                                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="Enter unique Pig ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={editForm.weight}
                                    onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sex
                                </label>
                                <select
                                    value={editForm.sex}
                                    onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="">Select Sex</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Breed
                                </label>
                                <input
                                    type="text"
                                    value={editForm.breed}
                                    onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="e.g., Yorkshire-Duroc"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CSF Vaccination Date
                                </label>
                                <input
                                    type="date"
                                    value={editForm.csfDate}
                                    onChange={(e) => setEditForm({ ...editForm, csfDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Other Vaccination Name
                                </label>
                                <input
                                    type="date"
                                    value={editForm.otherVaccinationName}
                                    onChange={(e) => setEditForm({ ...editForm, otherVaccinationName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="e.g., FMD, Swine Flu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Other Vaccination Date
                                </label>
                                <input
                                    type="date"
                                    value={editForm.otherVaccinationDate}
                                    onChange={(e) => setEditForm({ ...editForm, otherVaccinationDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
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

export default NurseryStage;
//*