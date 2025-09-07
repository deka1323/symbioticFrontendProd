import React, { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  Syringe,
  CalendarDays,
  PieChart,
  FileText,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  getPigDetailsByPigId,
  getPigMedicalHistoryByPigId,
  getPigStageHistoryByPigId,
} from "../actions/dashboardActions";
import { fetchCurrentFarm } from "../store/actions/pigActions";
import { currentFarmRecord } from "../store/selectors/pigSelectors";
import FarmModal from "./FarmModal";
import DataEntry from "./DataEntry";
import PopulationReport from "./Report/PopulationReport";
import PigProfile from "./PigProfile";
import ChangePigId from "./ChangePigId";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedFarm = useSelector(currentFarmRecord);

  const [searchId, setSearchId] = useState("");
  const [selectedPig, setSelectedPig] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [stageHistory, setStageHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showChangePigIdModal, setShowChangePigIdModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentFarm());
  }, [dispatch]);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error("Please enter a Pig ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [pigDetails, medical, stage] = await Promise.allSettled([
        getPigDetailsByPigId(selectedFarm, searchId.trim()),
        getPigMedicalHistoryByPigId(searchId.trim()),
        getPigStageHistoryByPigId(searchId.trim()),
      ]);

      if (pigDetails.status === "fulfilled" && pigDetails.value?.success) {
        setSelectedPig(pigDetails.value.data);
        toast.success(`Pig ${searchId} found!`);
        setIsProfileOpen(true);
      } else {
        setError("Pig not found in database");
        toast.error("Pig not found");
      }

      setMedicalHistory(
        medical.status === "fulfilled" && medical.value?.success ? medical.value.data : []
      );
      setStageHistory(
        stage.status === "fulfilled" && stage.value?.success ? stage.value.data : []
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch pig data");
      setError("Fetch error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => e.key === "Enter" && handleSearch();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-gray-200 rounded-md p-4 bg-white"
        >
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
            Farm Dashboard
          </h1>
        </motion.header>

        {/* Search Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-gray-200 rounded-md p-4 bg-white"
        >
          <label htmlFor="pigSearch" className="text-sm font-medium text-gray-700 mb-2 block">
            Search Pig by ID
          </label>
          <div className="flex gap-3">
            <input
              id="pigSearch"
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Pig ID"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </motion.section>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="border border-red-200 rounded-md p-3 bg-red-50 flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="border border-gray-200 rounded-md p-4 bg-white flex flex-wrap gap-2 justify-end"
        >
          <button onClick={() => setIsFarmModalOpen(true)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Farm Management
          </button>
          <button onClick={() => setIsDataEntryOpen(true)} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
            Open Data Entry
          </button>
          <button onClick={() => setShowChangePigIdModal(true)} className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
            Change Pig ID
          </button>
        </motion.div>

        {/* Quick Reports */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="border border-gray-200 rounded-md p-4 bg-white grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { title: "Vaccination Details", icon: Syringe },
            { title: "Expected Deliveries", icon: CalendarDays },
            { title: "Stage Distribution", icon: PieChart },
            { title: "More Reports", icon: FileText },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="border border-gray-200 rounded-md p-4 text-center cursor-pointer hover:shadow-sm"
              onClick={() => navigate("/reports")}
            >
              <card.icon className="h-6 w-6 text-emerald-600 mb-2 mx-auto" />
              <h3 className="text-sm font-medium text-gray-700">{card.title}</h3>
            </motion.div>
          ))}
        </motion.section>

        {/* Population Report */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="border border-gray-200 rounded-md p-4 bg-white"
        >
          <PopulationReport />
        </motion.section>

        {/* Modals */}
        <FarmModal isOpen={isFarmModalOpen} onClose={() => setIsFarmModalOpen(false)} />
        <DataEntry isOpen={isDataEntryOpen} onClose={() => setIsDataEntryOpen(false)} />
        <PigProfile
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          pig={selectedPig}
          medicalHistory={medicalHistory}
          stageHistory={stageHistory}
        />
        {showChangePigIdModal && (
          <ChangePigId
            selectedFarm={selectedFarm}
            onClose={() => setShowChangePigIdModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
