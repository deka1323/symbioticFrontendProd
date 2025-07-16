import React, { useState } from 'react';
import { FileText, Calendar, TrendingUp, Syringe, Baby, BarChart3, Download, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { samplePigs } from '../data/sampleData';
import AdvancedTable from './common/AdvancedTable';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('vaccination');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [detailTitle, setDetailTitle] = useState('');
  const [vaccineFilter, setVaccineFilter] = useState('all');
  const [populationMonth, setPopulationMonth] = useState(new Date().getMonth());
  const [populationYear, setPopulationYear] = useState(new Date().getFullYear());

  const reportTypes = [
    { id: 'vaccination', name: 'Upcoming Vaccinations', icon: Syringe, color: 'green' },
    { id: 'delivery', name: 'Expected Deliveries', icon: Baby, color: 'pink' },
    { id: 'population', name: 'Pig Population Report', icon: BarChart3, color: 'blue' },
    { id: 'stages', name: 'Stage Distribution', icon: TrendingUp, color: 'purple' },
    { id: 'sold', name: 'Sales Report', icon: FileText, color: 'orange' },
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate upcoming vaccinations for selected month with filter
  const getUpcomingVaccinations = () => {
    const currentDate = new Date();
    const selectedDate = new Date(selectedYear, selectedMonth);

    return samplePigs
      .filter(pig => pig.currentStatus === 'living')
      .map(pig => {
        const lastVaccination = pig.vaccinationRecords[pig.vaccinationRecords.length - 1];
        if (lastVaccination && lastVaccination.nextDueDate) {
          const dueDate = new Date(lastVaccination.nextDueDate);
          if (dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear) {
            const daysLeft = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24));
            return {
              pigId: pig.pigId,
              vaccineType: lastVaccination.vaccineType,
              dueDate: lastVaccination.nextDueDate,
              daysLeft: daysLeft,
              priority: daysLeft <= 7 ? 'Urgent' : daysLeft <= 14 ? 'Medium' : 'Low'
            };
          }
        }
        return null;
      })
      .filter(Boolean)
      .filter(item => vaccineFilter === 'all' ||
        (vaccineFilter === 'csf' && item.vaccineType === 'CSF') ||
        (vaccineFilter === 'other' && item.vaccineType !== 'CSF'))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  };

  // Generate expected deliveries for selected month
  const getExpectedDeliveries = () => {
    return samplePigs
      .filter(pig => pig.currentStage === 'gestation')
      .map(pig => {
        // Simulate expected delivery date (114 days from breeding)
        const breedingDate = new Date(pig.dateOfBirth);
        breedingDate.setDate(breedingDate.getDate() + 300); // Simulate breeding date
        const expectedDate = new Date(breedingDate);
        expectedDate.setDate(expectedDate.getDate() + 114);

        if (expectedDate.getMonth() === selectedMonth && expectedDate.getFullYear() === selectedYear) {
          const currentDate = new Date();
          const daysLeft = Math.ceil((expectedDate - currentDate) / (1000 * 60 * 60 * 24));

          return {
            sowId: pig.pigId,
            boarId: pig.fatherPigId || 'BOAR001',
            matingDate: breedingDate.toISOString().split('T')[0],
            expectedDate: expectedDate.toISOString().split('T')[0],
            daysLeft: daysLeft
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  };

  // Get population statistics with month filter for in-house
  const getPopulationStats = () => {
    const inhousePigs = samplePigs.filter(pig => {
      if (pig.currentStage === 'inhouse') {
        // Filter by month for in-house pigs
        const createdDate = new Date(pig.createdAt);
        return createdDate.getMonth() === populationMonth && createdDate.getFullYear() === populationYear;
      }
      return false;
    });

    const stats = {
      total: samplePigs.length,
      living: samplePigs.filter(pig => pig.currentStatus === 'living').length,
      dead: samplePigs.filter(pig => pig.currentStatus === 'dead').length,
      breeding: samplePigs.filter(pig => pig.currentStage === 'breeding').length,
      gestation: samplePigs.filter(pig => pig.currentStage === 'gestation').length,
      farrowing: samplePigs.filter(pig => pig.currentStage === 'farrowing').length,
      nursery: samplePigs.filter(pig => pig.currentStage === 'nursery').length,
      fattening: samplePigs.filter(pig => pig.currentStage === 'fattening').length,
      sold: samplePigs.filter(pig => pig.currentStage === 'sold').length,
      inhouse: inhousePigs.length
    };
    return stats;
  };

  // Get stage distribution
  const getStageDistribution = () => {
    const stats = getPopulationStats();
    return [
      { stage: 'Breeding', count: stats.breeding, percentage: ((stats.breeding / stats.living) * 100).toFixed(1) },
      { stage: 'Gestation', count: stats.gestation, percentage: ((stats.gestation / stats.living) * 100).toFixed(1) },
      { stage: 'Farrowing', count: stats.farrowing, percentage: ((stats.farrowing / stats.living) * 100).toFixed(1) },
      { stage: 'Nursery', count: stats.nursery, percentage: ((stats.nursery / stats.living) * 100).toFixed(1) },
      { stage: 'Fattening', count: stats.fattening, percentage: ((stats.fattening / stats.living) * 100).toFixed(1) }
    ];
  };

  // Get sales report for selected month
  const getSalesReport = () => {
    return samplePigs
      .filter(pig => {
        if (pig.currentStage === 'sold' && pig.soldDate) {
          const soldDate = new Date(pig.soldDate);
          return soldDate.getMonth() === selectedMonth && soldDate.getFullYear() === selectedYear;
        }
        return false;
      })
      .map(pig => ({
        pigId: pig.pigId,
        breed: pig.breed,
        sex: pig.sex,
        weight: pig.weight,
        soldDate: pig.soldDate,
        age: Math.floor((new Date(pig.soldDate) - new Date(pig.dateOfBirth)) / (1000 * 60 * 60 * 24 * 30))
      }));
  };

  // Show detailed view
  const showDetails = (stage, title) => {
    let data = [];

    switch (stage) {
      case 'living':
        data = samplePigs.filter(pig => pig.currentStatus === 'living').map(pig => ({ pigId: pig.pigId }));
        break;
      case 'dead':
        data = samplePigs.filter(pig => pig.currentStatus === 'dead').map(pig => ({ pigId: pig.pigId }));
        break;
      case 'breeding':
        data = samplePigs.filter(pig => pig.currentStage === 'breeding').map(pig => ({ pigId: pig.pigId }));
        break;
      case 'gestation':
        data = samplePigs.filter(pig => pig.currentStage === 'gestation').map(pig => ({ pigId: pig.pigId }));
        break;
      case 'farrowing':
        data = samplePigs.filter(pig => pig.currentStage === 'farrowing').map(pig => ({ pigId: pig.pigId }));
        break;
      case 'nursery':
        data = samplePigs.filter(pig => pig.currentStage === 'nursery').map(pig => ({ pigId: pig.pigId }));
        break;
      case 'fattening':
        data = samplePigs.filter(pig => pig.currentStage === 'fattening').map(pig => ({ pigId: pig.pigId }));
        break;
      case 'sold':
        data = samplePigs.filter(pig => pig.currentStage === 'sold').map(pig => ({ pigId: pig.pigId }));
        break;
      case 'inhouse':
        data = samplePigs.filter(pig => {
          if (pig.currentStage === 'inhouse') {
            const createdDate = new Date(pig.createdAt);
            return createdDate.getMonth() === populationMonth && createdDate.getFullYear() === populationYear;
          }
          return false;
        }).map(pig => ({ pigId: pig.pigId }));
        break;
      default:
        data = [];
    }

    setDetailData(data);
    setDetailTitle(title);
    setShowDetailModal(true);
  };

  // Download CSV
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data to download');
      return;
    }

    try {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header] || '').join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('CSV downloaded successfully!');
    } catch (error) {
      toast.error('Error downloading CSV. Please try again.');
      console.error('CSV download error:', error);
    }
  };

  const renderVaccinationReport = () => {
    const data = getUpcomingVaccinations();

    const columns = [
      { key: 'pigId', label: 'Pig ID', sortable: true },
      { key: 'vaccineType', label: 'Vaccine Type', sortable: true },
      { key: 'dueDate', label: 'Due Date', sortable: true },
      { key: 'daysLeft', label: 'Days Left', sortable: true },
      {
        key: 'priority',
        label: 'Priority',
        render: (value) => (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'Urgent' ? 'bg-red-100 text-red-800' :
              value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
            }`}>
            {value}
          </span>
        )
      }
    ];

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Syringe className="h-6 w-6 text-green-600 mr-2" />
            Upcoming Vaccinations - {months[selectedMonth]} {selectedYear}
          </h3>
          <div className="flex space-x-2">
            <select
              value={vaccineFilter}
              onChange={(e) => setVaccineFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Vaccines</option>
              <option value="csf">CSF Only</option>
              <option value="other">Other Vaccines</option>
            </select>
            <button
              onClick={() => downloadCSV(data, 'upcoming-vaccinations')}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
        <AdvancedTable
          data={data}
          columns={columns}
          searchPlaceholder="Search by Pig ID..."
          searchKey="pigId"
        />
      </div>
    );
  };

  const renderDeliveryReport = () => {
    const data = getExpectedDeliveries();

    const columns = [
      { key: 'sowId', label: 'Sow ID', sortable: true },
      { key: 'boarId', label: 'Boar ID', sortable: true },
      { key: 'matingDate', label: 'Mating Date', sortable: true },
      { key: 'expectedDate', label: 'Expected Delivery', sortable: true },
      {
        key: 'daysLeft',
        label: 'Days Left',
        sortable: true,
        render: (value) => (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value <= 7 ? 'bg-red-100 text-red-800' :
              value <= 14 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
            }`}>
            {value} days
          </span>
        )
      }
    ];

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Baby className="h-6 w-6 text-pink-600 mr-2" />
            Expected Deliveries - {months[selectedMonth]} {selectedYear}
          </h3>
          <button
            onClick={() => downloadCSV(data, 'expected-deliveries')}
            className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </button>
        </div>
        <AdvancedTable
          data={data}
          columns={columns}
          searchPlaceholder="Search by Pig ID..."
          searchKey="sowId"
        />
      </div>
    );
  };

  const renderPopulationReport = () => {
    const stats = getPopulationStats();

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
            Pig Population Report
          </h3>
          <div className="flex space-x-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">In-house filter:</span>
              <select
                value={populationMonth}
                onChange={(e) => setPopulationMonth(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
              <select
                value={populationYear}
                onChange={(e) => setPopulationYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => downloadCSV([stats], 'population-report')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
            onClick={() => showDetails('total', 'Total Pigs')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-blue-600">Total Pigs</div>
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              </div>
            </div>
          </div>

          <div
            className="bg-green-50 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors duration-200"
            onClick={() => showDetails('living', 'Living Pigs')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-green-600">Living</div>
                <div className="text-2xl font-bold text-green-900">{stats.living}</div>
              </div>
            </div>
          </div>

          <div
            className="bg-red-50 rounded-lg p-4 cursor-pointer hover:bg-red-100 transition-colors duration-200"
            onClick={() => showDetails('dead', 'Dead Pigs')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">×</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-red-600">Dead</div>
                <div className="text-2xl font-bold text-red-900">{stats.dead}</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-purple-600">Survival Rate</div>
                <div className="text-2xl font-bold text-purple-900">
                  {((stats.living / stats.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-orange-50 rounded-lg p-4 cursor-pointer hover:bg-orange-100 transition-colors duration-200"
            onClick={() => showDetails('sold', 'Sold Pigs')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-orange-600">Sold</div>
                <div className="text-2xl font-bold text-orange-900">{stats.sold}</div>
              </div>
            </div>
          </div>

          <div
            className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={() => showDetails('inhouse', `In-House (${months[populationMonth]} ${populationYear})`)}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">In-House</div>
                <div className="text-2xl font-bold text-gray-900">{stats.inhouse}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStageReport = () => {
    const data = getStageDistribution();

    const columns = [
      { key: 'stage', label: 'Stage', sortable: true },
      { key: 'count', label: 'Count', sortable: true },
      { key: 'percentage', label: 'Percentage', sortable: true, render: (value) => `${value}%` }
    ];

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-6 w-6 text-purple-600 mr-2" />
            Stage Distribution Report
          </h3>
          <button
            onClick={() => downloadCSV(data, 'stage-distribution')}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {data.map((item, index) => (
            <div
              key={index}
              className="bg-purple-50 rounded-lg p-4 cursor-pointer hover:bg-purple-100 transition-colors duration-200"
              onClick={() => showDetails(item.stage.toLowerCase(), `${item.stage} Stage Pigs`)}
            >
              <div className="text-sm font-medium text-purple-600">{item.stage}</div>
              <div className="text-2xl font-bold text-purple-900">{item.count}</div>
              <div className="text-xs text-purple-600">{item.percentage}% of living pigs</div>
            </div>
          ))}
        </div>

        <AdvancedTable
          data={data}
          columns={columns}
          searchPlaceholder="Search by stage..."
          searchKey="stage"
        />
      </div>
    );
  };

  const renderSalesReport = () => {
    const data = getSalesReport();

    const columns = [
      { key: 'pigId', label: 'Pig ID', sortable: true },
      { key: 'breed', label: 'Breed', sortable: true },
      { key: 'sex', label: 'Sex', sortable: true, render: (value) => value.charAt(0).toUpperCase() + value.slice(1) },
      { key: 'weight', label: 'Weight (kg)', sortable: true, render: (value) => `${value.toFixed(1)} kg` },
      { key: 'age', label: 'Age (months)', sortable: true },
      { key: 'soldDate', label: 'Sold Date', sortable: true }
    ];

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 text-orange-600 mr-2" />
            Sales Report - {months[selectedMonth]} {selectedYear}
          </h3>
          <button
            onClick={() => downloadCSV(data, 'sales-report')}
            className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </button>
        </div>

        {data.length > 0 && (
          <div className="mb-4 p-4 bg-orange-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-orange-800">Total Sold:</span>
                <span className="ml-2 text-orange-700">{data.length} pigs</span>
              </div>
              <div>
                <span className="font-medium text-orange-800">Avg Weight:</span>
                <span className="ml-2 text-orange-700">
                  {(data.reduce((sum, pig) => sum + pig.weight, 0) / data.length).toFixed(1)} kg
                </span>
              </div>
              <div>
                <span className="font-medium text-orange-800">Male:</span>
                <span className="ml-2 text-orange-700">{data.filter(pig => pig.sex === 'male').length}</span>
              </div>
              <div>
                <span className="font-medium text-orange-800">Female:</span>
                <span className="ml-2 text-orange-700">{data.filter(pig => pig.sex === 'female').length}</span>
              </div>
            </div>
          </div>
        )}

        <AdvancedTable
          data={data}
          columns={columns}
          searchPlaceholder="Search by Pig ID..."
          searchKey="pigId"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
            Reports & Analytics
          </h1>

          {/* Month/Year Selection */}
          {(selectedReport === 'vaccination' || selectedReport === 'delivery' || selectedReport === 'sold') && (
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Select Period:</span>
                </div>
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
            </div>
          )}

          {/* Report Type Selection */}
          <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto scrollbar-hide">
                {reportTypes.map((report) => {
                  const Icon = report.icon;
                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`flex-shrink-0 py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm flex items-center transition-colors duration-200 ${selectedReport === report.id
                          ? `border-${report.color}-500 text-${report.color}-600`
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="whitespace-nowrap">{report.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Report Content */}
          <div>
            {selectedReport === 'vaccination' && renderVaccinationReport()}
            {selectedReport === 'delivery' && renderDeliveryReport()}
            {selectedReport === 'population' && renderPopulationReport()}
            {selectedReport === 'stages' && renderStageReport()}
            {selectedReport === 'sold' && renderSalesReport()}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{detailTitle}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadCSV(detailData, detailTitle.toLowerCase().replace(/\s+/g, '-'))}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Download className="h-4 w-4" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <AdvancedTable
                data={detailData}
                columns={[{ key: 'pigId', label: 'Pig ID', sortable: true }]}
                searchPlaceholder="Search by Pig ID..."
                searchKey="pigId"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;