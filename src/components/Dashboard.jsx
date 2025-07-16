import React, { useState } from 'react';
import { Search, Edit, Calendar, Syringe, Heart, Users } from 'lucide-react';
import { createDefaultPig, PigStages } from '../types/pig';

const Dashboard = () => {
  const [searchId, setSearchId] = useState('');
  const [selectedPig, setSelectedPig] = useState(null);

  // Mock data for demonstration
  const mockPig = {
    pigId: 'PIG001',
    sex: 'female',
    breed: 'Yorkshire',
    motherPigId: 'PIG090',
    fatherPigId: 'BOAR05',
    weight: 45.5,
    dateOfBirth: '2023-03-15',
    currentStatus: 'living',
    currentStage: 'breeding',
    vaccinationDates: [
      { date: '2023-04-15', vaccineType: 'PRRS', nextDueDate: '2024-04-15' },
      { date: '2023-05-15', vaccineType: 'FMD', nextDueDate: '2024-05-15' }
    ],
    dewormingDates: [
      { date: '2023-06-01', medicineType: 'Ivermectin', dosage: '2ml' }
    ],
    otherMedicines: [
      { date: '2023-07-10', medicineType: 'Antibiotic', dosage: '5ml' }
    ],
    pregnancyCount: 2,
    matingPartners: [
      { partnerId: 'BOAR03', matingDate: '2023-08-15', breed: 'Duroc' }
    ],
    pigletDetails: [
      {
        pregnancyNumber: 1,
        farrowing_date: '2023-05-20',
        totalBorn: 8,
        live: 7,
        dead: 1,
        pigletIds: ['PIG101', 'PIG102', 'PIG103', 'PIG104', 'PIG105', 'PIG106', 'PIG107']
      }
    ],
    totalPigletsSummary: {
      totalBorn: 8,
      totalLive: 7,
      totalDead: 1
    }
  };

  const handleSearch = () => {
    if (searchId) {
      setSelectedPig(mockPig);
    }
  };

  const handleStageChange = (newStage) => {
    if (selectedPig) {
      setSelectedPig({
        ...selectedPig,
        currentStage: newStage
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Farm Dashboard</h1>

          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <label htmlFor="pigId" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Pig by ID
                </label>
                <input
                  type="text"
                  id="pigId"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter Pig ID (e.g., PIG001)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Pig Details Section */}
          {selectedPig && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Pig Details - {selectedPig.pigId}</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Sex:</span>
                      <span className="text-gray-900 capitalize">{selectedPig.sex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Breed:</span>
                      <span className="text-gray-900">{selectedPig.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Date of Birth:</span>
                      <span className="text-gray-900">{selectedPig.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Weight:</span>
                      <span className="text-gray-900">{selectedPig.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Mother ID:</span>
                      <span className="text-gray-900">{selectedPig.motherPigId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Father ID:</span>
                      <span className="text-gray-900">{selectedPig.fatherPigId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedPig.currentStatus === 'living'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {selectedPig.currentStatus}
                      </span>
                    </div>
                    {selectedPig.soldDate && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Sold Date:</span>
                        <span className="text-gray-900">{selectedPig.soldDate}</span>
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
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedPig.currentStage}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-3">Change stage:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['breeding', 'gestation', 'farrowing', 'nursery'].map((stage) => (
                          <button
                            key={stage}
                            onClick={() => handleStageChange(stage)}
                            disabled={selectedPig.currentStage === stage}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPig.currentStage === stage
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                              }`}
                          >
                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Records */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Syringe className="h-5 w-5 mr-2" />
                  Medical Records
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Vaccinations */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <h4 className="font-medium text-green-800 mb-3">Vaccinations</h4>
                    <div className="space-y-2">
                      {selectedPig.vaccinationDates.map((vaccine, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-green-700">{vaccine.vaccineType}</div>
                          <div className="text-green-600">Given: {vaccine.date}</div>
                          <div className="text-green-600">Next Due: {vaccine.nextDueDate}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deworming */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-3">Deworming</h4>
                    <div className="space-y-2">
                      {selectedPig.dewormingDates.map((medicine, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-blue-700">{medicine.medicineType}</div>
                          <div className="text-blue-600">Date: {medicine.date}</div>
                          <div className="text-blue-600">Dosage: {medicine.dosage}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Other Medicines */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <h4 className="font-medium text-purple-800 mb-3">Other Medicines</h4>
                    <div className="space-y-2">
                      {selectedPig.otherMedicines.map((medicine, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-purple-700">{medicine.medicineType}</div>
                          <div className="text-purple-600">Date: {medicine.date}</div>
                          <div className="text-purple-600">Dosage: {medicine.dosage}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Breeding Records (for females) */}
              {selectedPig.sex === 'female' && selectedPig.matingPartners && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Breeding Records
                  </h3>
                  <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-pink-800 mb-3">Mating History</h4>
                        <div className="space-y-2">
                          {selectedPig.matingPartners.map((mating, index) => (
                            <div key={index} className="text-sm bg-white rounded-lg p-3 border border-pink-100">
                              <div className="font-medium text-pink-700">Partner: {mating.partnerId}</div>
                              <div className="text-pink-600">Date: {mating.matingDate}</div>
                              <div className="text-pink-600">Breed: {mating.breed}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-pink-800 mb-3">Pregnancy Summary</h4>
                        <div className="bg-white rounded-lg p-3 border border-pink-100">
                          <div className="text-sm space-y-1">
                            <div>Total Pregnancies: <span className="font-medium">{selectedPig.pregnancyCount}</span></div>
                            <div>Total Piglets Born: <span className="font-medium">{selectedPig.totalPigletsSummary?.totalBorn}</span></div>
                            <div>Total Live: <span className="font-medium text-green-600">{selectedPig.totalPigletsSummary?.totalLive}</span></div>
                            <div>Total Dead: <span className="font-medium text-red-600">{selectedPig.totalPigletsSummary?.totalDead}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Stage Details */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Stage Information</h3>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-blue-800">Current Stage:</span>
                      <span className="ml-2 text-sm text-blue-700 capitalize">{selectedPig.currentStage}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-800">Status:</span>
                      <span className="ml-2 text-sm text-blue-700 capitalize">{selectedPig.currentStatus}</span>
                    </div>
                    {selectedPig.currentStage === 'sold' && selectedPig.soldDate && (
                      <div>
                        <span className="text-sm font-medium text-blue-800">Sold Date:</span>
                        <span className="ml-2 text-sm text-blue-700">{selectedPig.soldDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;