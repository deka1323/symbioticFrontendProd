import React, { useEffect, useState } from "react";
import {
  Search, Loader2, AlertCircle, Syringe, CalendarDays, PieChart, FileText, Home, Layers, BarChart2
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
import farmLogo from "../assets/symbioticLogo.png";
import BoarModal from "./BoarModal";


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
  const [showBoarModal, setShowBoarModal] = useState(false);

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
          className="border border-gray-200 rounded-md p-5 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Farm Dashboard
                </h1>
                <p className="text-sm text-gray-600">Overview of farm operations</p>
              </div>
            </div>

            {/* Right: Farm Logo */}
            <div className="flex items-center">
              <img src={farmLogo} alt="Farm Logo" className="h-16 w-16 object-contain rounded-full border border-gray-200"
              />
            </div>
          </div>
        </motion.header>



        {/* Search Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-gray-200 rounded-md p-4 bg-blue-50 shadow-sm"


        >
          <label htmlFor="pigSearch" className="text-sm font-medium text-blue-800 mb-2 block">
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
              className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-md hover:bg-emerald-700 flex items-center gap-2"
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
          className="border border-gray-200 rounded-md p-4 bg-blue-50 flex flex-wrap gap-3 justify-center"
        >
          <button
            onClick={() => setIsFarmModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold border border-blue-500 text-blue-600 bg-white rounded-md hover:bg-blue-50"
          >
            Farm Management
          </button>
          <button
            onClick={() => setIsDataEntryOpen(true)}
            className="px-4 py-2 text-sm font-semibold border border-green-500 text-green-600 bg-white rounded-md hover:bg-green-50"
          >
            Open Data Entry
          </button>
          <button
            onClick={() => setShowChangePigIdModal(true)}
            className="px-4 py-2 text-sm font-semibold border border-yellow-500 text-yellow-600 bg-white rounded-md hover:bg-yellow-50"
          >
            Change Pig ID
          </button>
          <button
            onClick={() => setShowBoarModal(true)}
            className="px-4 py-2 text-sm font-semibold border border-yellow-500 text-yellow-600 bg-white rounded-md hover:bg-yellow-50"
          >
            Boar Details
          </button>
        </motion.div>

        {/* ===================== Pig Stages Section ===================== */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="border border-gray-200 rounded-md p-4 bg-white"
        >
          <h2 className="text-md md:text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-800" />
            Pig Stages
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { title: "Service", route: "/breeding" },
              { title: "Gestation", route: "/gestation" },
              { title: "Farrowing", route: "/farrowing" },
              { title: "Nursery", route: "/nursery" },
              { title: "Fattening", route: "/fattening" },
              { title: "Dried", route: "/dried" },
            ].map((stage, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(stage.route)}
                className="bg-gradient-to-r from-blue-100 to-blue-50
                   rounded-xl p-6 flex items-center justify-center text-center 
                   cursor-pointer shadow-sm hover:shadow-md 
                   transition-all duration-300"
              >
                <h3 className="text-sm font-semibold text-gray-800">
                  {stage.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </motion.section>


        {/* Quick Reports */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="border border-gray-200 rounded-md p-4 bg-blue-50"
        >
          {/* Header */}
          <h2 className="text-md md:text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-800" />
            Quick Reports
          </h2>

          {/* Report Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Vaccination Details", icon: Syringe },
              { title: "Expected Deliveries", icon: CalendarDays },
              { title: "Stage Distribution", icon: PieChart },
              { title: "More Reports", icon: FileText },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="border border-gray-200 rounded-md p-4 text-center cursor-pointer hover:shadow-sm bg-white transition"
                onClick={() => navigate("/reports")}
              >
                <card.icon className="h-6 w-6 text-emerald-600 mb-2 mx-auto" />
                <h3 className="text-sm font-medium text-gray-700">{card.title}</h3>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Population Report */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="border border-gray-200 rounded-md p-4 bg-blue-50"
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
        {showBoarModal && (
          <BoarModal
            selectedFarm={selectedFarm}
            onClose={() => setShowBoarModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
