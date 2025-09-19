import React, { useEffect, useState } from 'react';
import { FileText, Calendar, TrendingUp, Syringe, Baby, BarChart3, Download, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { samplePigs } from '../data/sampleData';
import AdvancedTable from './common/AdvancedTable';
import StageDistributionReport from './Report/StageDistributionReport';
import UpcomingMedicine from './Report/UpcomingMedicine';
import { currentFarmRecord } from '../store/selectors/pigSelectors';
import { fetchCurrentFarm } from '../store/actions/pigActions';
import { useDispatch, useSelector } from "react-redux";
import ExpectedDeliveryReport from './Report/ExpectedDelieveryReport';
import InHouseReport from './Report/InHouseReport';

const Reports = () => {
  const dispatch = useDispatch();
  const [selectedReport, setSelectedReport] = useState('vaccination');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [detailTitle, setDetailTitle] = useState('');
  const [vaccineFilter, setVaccineFilter] = useState('all');
  const [populationMonth, setPopulationMonth] = useState(new Date().getMonth());
  const [populationYear, setPopulationYear] = useState(new Date().getFullYear());


  useEffect(() => {
    dispatch(fetchCurrentFarm());
  }, [dispatch]);
  const selectedFarm = useSelector(currentFarmRecord);
  const reportTypes = [
    { id: 'vaccination', name: 'Upcoming Vaccinations', icon: Syringe, color: 'green' },
    { id: 'delivery', name: 'Expected Deliveries', icon: Baby, color: 'pink' },
    { id: 'inHouse', name: 'In-House Report', icon: BarChart3, color: 'blue' },
    { id: 'stages', name: 'Stage Distribution', icon: TrendingUp, color: 'purple' },
    { id: 'sold', name: 'Sales Report', icon: FileText, color: 'orange' },
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  console.log("selectedYear + selectedMonth ->", selectedYear, selectedMonth)

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


  const renderDeliveryReport = () => {
    const data = getExpectedDeliveries();

    const columns = [
      { key: 'sowId', label: 'Sow ID', sortable: true },
      { key: 'boarId', label: 'Boar ID', sortable: true },
      { key: 'matingDate', label: 'Mating Date', sortable: true },
      { key: 'sowBreed', label: 'Sow Breed', sortable: true },
      { key: 'expectedDate', label: 'Expected Delivery', sortable: true },
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
          {(selectedReport === 'vaccination' || selectedReport === 'delivery' || selectedReport === 'sold' || selectedReport === 'inHouse') && (
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
            {/* {selectedReport === 'vaccination' && renderVaccinationReport()} */}
            {selectedReport === 'vaccination' && <UpcomingMedicine selectedFarm={selectedFarm} selectedMonth={selectedMonth} selectedYear={selectedYear} />}
            {/* {selectedReport === 'delivery' && renderDeliveryReport()} */}
            {selectedReport === 'delivery' && <ExpectedDeliveryReport selectedFarm={selectedFarm} selectedMonth={selectedMonth} selectedYear={selectedYear} />}
            {/* {selectedReport === 'population' && renderPopulationReport()} */}
            {/* {selectedReport === 'stages' && renderStageReport()} */}
            {selectedReport === 'stages' && <StageDistributionReport />}
            {selectedReport === 'inHouse' && <InHouseReport selectedFarm={selectedFarm} selectedMonth={selectedMonth} selectedYear={selectedYear} />}
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