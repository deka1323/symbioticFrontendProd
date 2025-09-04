// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Search, Loader2, AlertCircle, Syringe, CalendarDays, PieChart, FileText } from "lucide-react";
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-gray-900 mb-8"
        >
          Farm Dashboard
        </motion.h1>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-10"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Pig by ID
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Pig ID (e.g., PIG001)"
              className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 shadow-sm"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 flex items-center gap-2 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" /> Search
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center"
          >
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-4 mb-10"
        >
          <button
            onClick={() => setIsFarmModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all duration-200"
          >
            Farm Management
          </button>
          <button
            onClick={() => setIsDataEntryOpen(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition-all duration-200"
          >
            Open Data Entry
          </button>
        </motion.div>

        {/* Quick Reports Card Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {[
            { title: "Vaccination Details", icon: Syringe },
            { title: "Expected Deliveries", icon: CalendarDays },
            { title: "Stage Distribution", icon: PieChart },
            { title: "More Reports", icon: FileText },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="cursor-pointer bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-200"
              onClick={() => navigate("/reports")}
            >
              <card.icon className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
            </motion.div>
          ))}
        </motion.div>

        {/* Population Report */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <PopulationReport />
        </motion.div>

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
      </div>
    </div>
  );
};

export default Dashboard;
