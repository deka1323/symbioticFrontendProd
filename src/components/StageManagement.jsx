import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Baby, Sprout, Calendar, History } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { moveToNextStage } from '../store/actions/pigActions';
import { selectIsMovingPig, selectMovingPigId } from '../store/selectors/pigSelectors';
import AdvancedTable from './common/AdvancedTable';

const StageManagement = ({ stage }) => {
  const dispatch = useDispatch();
  const [selectedFilter, setSelectedFilter] = useState('current');

  // Redux selectors
  const isMovingPig = useSelector(selectIsMovingPig);
  const movingPigId = useSelector(selectMovingPigId);

  const stageConfig = {
    gestation: {
      title: 'Gestation Management',
      icon: Users,
      color: 'blue',
      description: 'Track sows during pregnancy period (114 days)',
      nextStage: 'farrowing'
    },
    farrowing: {
      title: 'Farrowing Management',
      icon: Baby,
      color: 'purple',
      description: 'Monitor sows during delivery and piglet care',
      nextStage: 'nursery'
    },
    nursery: {
      title: 'Nursery Management',
      icon: Sprout,
      color: 'green',
      description: 'Track piglets from birth to weaning',
      nextStage: 'fattening'
    },
  };

  const config = stageConfig[stage];
  const Icon = config.icon;

  const handleMoveToNextStage = async (action, item) => {
    const nextStage = config.nextStage;
    const loadingToast = toast.loading(`Moving ${item.pigId} to ${nextStage} stage...`);

    try {
      const result = await dispatch(moveToNextStage(item.pigId, stage));

      if (result.success) {
        toast.success(`${item.pigId} successfully moved to ${result.nextStage} stage!`, {
          id: loadingToast,
          duration: 3000,
        });
      } else {
        toast.error('Failed to move pig to next stage', {
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
      entryDate: '2024-01-15',
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
      entryDate: '2024-01-10',
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
      entryDate: '2023-12-01',
      exitDate: '2023-12-20',
      totalDays: 19,
      breed: 'Yorkshire',
      finalWeight: 48.2,
      status: 'completed',
      outcome: `Moved to ${config.nextStage}`
    }
  ];

  // Current records table columns
  const currentRecordsColumns = [
    { key: 'id', label: 'Record ID', sortable: true },
    { key: 'pigId', label: 'Pig ID', sortable: true },
    { key: 'entryDate', label: 'Entry Date', sortable: true },
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
    { key: 'id', label: 'Record ID', sortable: true },
    { key: 'pigId', label: 'Pig ID', sortable: true },
    { key: 'entryDate', label: 'Entry Date', sortable: true },
    { key: 'exitDate', label: 'Exit Date', sortable: true },
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
      key: 'view',
      label: 'View Details',
      className: `text-${config.color}-600 hover:text-${config.color}-900 text-xs sm:text-sm`,
      render: () => 'View Details'
    },
    {
      key: 'move',
      label: `Move to ${config.nextStage}`,
      className: 'inline-flex items-center px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm',
      requiresConfirmation: true,
      disabled: (item) => isMovingPig && movingPigId === item.id,
      render: (item) => (
        <>
          {isMovingPig && movingPigId === item.id ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-1"></div>
              Moving...
            </>
          ) : (
            `Move to ${config.nextStage}`
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
      className: `text-${config.color}-600 hover:text-${config.color}-900 text-xs sm:text-sm`,
      render: () => 'View Details'
    }
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
                <Icon className={`h-6 w-6 sm:h-8 sm:w-8 text-${config.color}-600 mr-2 sm:mr-3`} />
                {config.title}
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">{config.description}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setSelectedFilter('current')}
                  className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'current'
                      ? `border-${config.color}-500 text-${config.color}-600 bg-${config.color}-50`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Current {config.title.split(' ')[0]} ({mockCurrentRecords.length})
                </button>
                <button
                  onClick={() => setSelectedFilter('history')}
                  className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${selectedFilter === 'history'
                      ? `border-${config.color}-500 text-${config.color}-600 bg-${config.color}-50`
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
                    Active {config.title.split(' ')[0]} Records
                  </h3>
                  <AdvancedTable
                    data={mockCurrentRecords}
                    columns={currentRecordsColumns}
                    searchPlaceholder="Search by Pig ID, Record ID, or Breed..."
                    actionButtons={currentRecordsActions}
                    onAction={handleMoveToNextStage}
                  />
                </div>
              )}

              {selectedFilter === 'history' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {config.title.split(' ')[0]} History
                  </h3>
                  <AdvancedTable
                    data={mockHistoryRecords}
                    columns={historyRecordsColumns}
                    searchPlaceholder="Search by Pig ID, Record ID, or Breed..."
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

export default StageManagement;