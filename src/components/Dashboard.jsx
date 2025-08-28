import React, { useEffect, useState } from 'react';
import { Search, Edit, Calendar, Syringe, Heart, Users, Loader2, AlertCircle } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { getPigDetailsByPigId, getPigMedicalHistoryByPigId, getPigStageHistoryByPigId } from '../actions/dashboardActions';
import FarmModal from './FarmModal';
import { useDispatch, useSelector } from 'react-redux';
import { currentFarmRecord } from '../store/selectors/pigSelectors';
import { fetchCurrentFarm } from '../store/actions/pigActions';
import DataEntry from './DataEntry';


const Dashboard = () => {
  const dispatch = useDispatch();
  const [searchId, setSearchId] = useState('');
  const [selectedPig, setSelectedPig] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [stageHistory, setStageHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentFarm());
  }, [dispatch])

  const selectedFarm = useSelector(currentFarmRecord);

  console.log("Current selected Farm -", selectedFarm)


  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error('Please enter a Pig ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedPig(null);
    setMedicalHistory([]);
    setStageHistory([]);

    try {
      // Call all APIs in parallel
      const [pigDetailsResult, medicalResult, stageResult] = await Promise.allSettled([
        getPigDetailsByPigId(searchId.trim()),
        getPigMedicalHistoryByPigId(searchId.trim()),
        getPigStageHistoryByPigId(searchId.trim()),
      ]);

      // Pig Details
      if (
        pigDetailsResult.status === 'fulfilled' &&
        pigDetailsResult.value?.success
      ) {
        setSelectedPig(pigDetailsResult.value.data);
        toast.success(`Pig ${searchId} found successfully!`);
      } else {
        toast.error(`Pig ${searchId} not found`);
        setError('Pig not found in database');
        setLoading(false);
        return;
      }

      // Medical History
      if (
        medicalResult.status === 'fulfilled' &&
        medicalResult.value?.success &&
        Array.isArray(medicalResult.value.data)
      ) {
        setMedicalHistory(medicalResult.value.data);
      } else {
        console.warn('No medical history available');
        setMedicalHistory([]);
      }

      // Stage History
      if (
        stageResult.status === 'fulfilled' &&
        stageResult.value?.success &&
        Array.isArray(stageResult.value.data)
      ) {
        setStageHistory(stageResult.value.data);
      } else {
        console.warn('No stage history available');
        setStageHistory([]);
      }

    } catch (error) {
      console.error('Dashboard search error:', error);
      toast.error('An error occurred while fetching pig data');
      setError('Failed to fetch pig data');
    } finally {
      setLoading(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    return value;
  };

  const groupMedicalRecordsByType = (records) => {
    const grouped = {
      vaccinations: [],
      deworming: [],
      medicines: []
    };

    records.forEach(record => {
      if (record.recordType === 'vaccination') {
        grouped.vaccinations.push(record);
      } else if (record.recordType === 'deworming') {
        grouped.deworming.push(record);
      } else {
        grouped.medicines.push(record);
      }
    });

    return grouped;
  };

  const calculateDaysInStage = (inDate, outDate) => {
    if (!inDate) return 'N/A';
    const startDate = new Date(inDate);
    const endDate = outDate ? new Date(outDate) : new Date();
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Farm Dashboard</h1>

          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8 border border-gray-100">
            <label
              htmlFor="pigId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Pig by ID
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Input */}
              <input
                type="text"
                id="pigId"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter Pig ID (e.g., PIG001)"
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />

              {/* Button */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>


          <div className="flex space-x-4">
            <button
              onClick={() => setIsFarmModalOpen(true)}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Farm Management
            </button>

            <FarmModal
              isOpen={isFarmModalOpen}
              onClose={() => setIsFarmModalOpen(false)}
            />

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Open Data Entry
            </button>

            <DataEntry isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          </div>


          {/* Toasts */}
          <Toaster position="top-right" />

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Pig Details Section */}
          {selectedPig && !loading && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Pig Details - {formatValue(selectedPig.pigId)}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Sex:</span>
                      <span className="text-gray-900 capitalize">{formatValue(selectedPig.sex)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Breed:</span>
                      <span className="text-gray-900">{formatValue(selectedPig.breed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Date of Birth:</span>
                      <span className="text-gray-900">{formatDate(selectedPig.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Weight:</span>
                      <span className="text-gray-900">
                        {selectedPig.weight ? `${selectedPig.weight} kg` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Mother ID:</span>
                      <span className="text-gray-900">{formatValue(selectedPig.motherPigId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Father ID:</span>
                      <span className="text-gray-900">{formatValue(selectedPig.fatherPigId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedPig.currentStatus === 'living'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {formatValue(selectedPig.currentStatus)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Origin:</span>
                      <span className="text-gray-900 capitalize">{formatValue(selectedPig.origin)}</span>
                    </div>
                    {selectedPig.soldDate && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Sold Date:</span>
                        <span className="text-gray-900">{formatDate(selectedPig.soldDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Stage Management */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Stage</h3>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-gray-600">Current Stage:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedPig.currentStage === 'breeding' ? 'bg-pink-100 text-pink-800' :
                        selectedPig.currentStage === 'gestation' ? 'bg-blue-100 text-blue-800' :
                          selectedPig.currentStage === 'farrowing' ? 'bg-purple-100 text-purple-800' :
                            selectedPig.currentStage === 'nursery' ? 'bg-green-100 text-green-800' :
                              selectedPig.currentStage === 'fattening' ? 'bg-yellow-100 text-yellow-800' :
                                selectedPig.currentStage === 'sold' ? 'bg-orange-100 text-orange-800' :
                                  selectedPig.currentStage === 'inhouse' ? 'bg-gray-100 text-gray-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                        {formatValue(selectedPig.currentStage)}
                      </span>
                    </div>

                    {selectedPig.pregnancyCount !== undefined && selectedPig.sex === 'female' && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Pregnancy Count:</span>
                        <span className="text-gray-900">{formatValue(selectedPig.pregnancyCount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stage History */}
              {stageHistory.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Stage History
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="space-y-3">
                      {stageHistory.map((stage, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-blue-700 font-medium capitalize">
                            {formatValue(stage.stageName)} Stage:
                          </span>
                          <span className="text-blue-600">
                            {formatDate(stage.inDate)} to {stage.outDate ? formatDate(stage.outDate) : 'Present'}
                            ({calculateDaysInStage(stage.inDate, stage.outDate)} days)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Records */}
              {medicalHistory.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Syringe className="h-5 w-5 mr-2" />
                    Medical Records
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(() => {
                      const groupedRecords = groupMedicalRecordsByType(medicalHistory);

                      return (
                        <>
                          {/* Vaccinations */}
                          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                            <h4 className="font-medium text-green-800 mb-3">Vaccinations</h4>
                            <div className="space-y-2">
                              {groupedRecords.vaccinations.length > 0 ? (
                                groupedRecords.vaccinations.map((record, index) => (
                                  <div key={index} className="text-sm">
                                    <div className="font-medium text-green-700">
                                      {formatValue(record.medicineType)}
                                    </div>
                                    <div className="text-green-600">Given: {formatDate(record.date)}</div>
                                    {record.nextDueDate && (
                                      <div className="text-green-600">Next Due: {formatDate(record.nextDueDate)}</div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-green-600">No vaccination records</div>
                              )}
                            </div>
                          </div>

                          {/* Deworming */}
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <h4 className="font-medium text-blue-800 mb-3">Deworming</h4>
                            <div className="space-y-2">
                              {groupedRecords.deworming.length > 0 ? (
                                groupedRecords.deworming.map((record, index) => (
                                  <div key={index} className="text-sm">
                                    <div className="font-medium text-blue-700">
                                      {formatValue(record.medicineType)}
                                    </div>
                                    <div className="text-blue-600">Date: {formatDate(record.date)}</div>
                                    {record.dosage && (
                                      <div className="text-blue-600">Dosage: {formatValue(record.dosage)}</div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-blue-600">No deworming records</div>
                              )}
                            </div>
                          </div>

                          {/* Other Medicines */}
                          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <h4 className="font-medium text-purple-800 mb-3">Other Medicines</h4>
                            <div className="space-y-2">
                              {groupedRecords.medicines.length > 0 ? (
                                groupedRecords.medicines.map((record, index) => (
                                  <div key={index} className="text-sm">
                                    <div className="font-medium text-purple-700">
                                      {formatValue(record.medicineType)}
                                    </div>
                                    <div className="text-purple-600">Date: {formatDate(record.date)}</div>
                                    {record.dosage && (
                                      <div className="text-purple-600">Dosage: {formatValue(record.dosage)}</div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-purple-600">No other medicine records</div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* No Medical Records Message */}
              {medicalHistory.length === 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Syringe className="h-5 w-5 mr-2" />
                    Medical Records
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-600 text-center">No medical records available for this pig</p>
                  </div>
                </div>
              )}

              {/* No Stage History Message */}
              {stageHistory.length === 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Stage History
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-600 text-center">No stage history available for this pig</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

