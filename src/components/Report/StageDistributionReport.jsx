import React, { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Users,
  GitBranch,
  LayoutList,
  X,
  PieChart,
  Split,
  BarChart3,
  TableProperties,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdvancedTable from "../common/AdvancedTable";
import { getAllPigsByStage } from "../../actions/dashboardActions";
import { useDispatch, useSelector } from "react-redux";
import { currentFarmRecord } from "../../store/selectors/pigSelectors";
import { fetchCurrentFarm } from "../../store/actions/pigActions";
import StageDistributionGraphs from "./StageDistributionGraphs";

// --- CONFIGURATION ---
const STAGES = [
  { key: "breeding", label: "Service", icon: TrendingUp },
  { key: "gestation", label: "Gestation", icon: TrendingUp },
  { key: "farrowing", label: "Farrowing", icon: TrendingUp },
  { key: "nursery", label: "Nursery", icon: TrendingUp },
  { key: "dried", label: "Dry", icon: TrendingUp },
  { key: "fattening", label: "Fattening", icon: TrendingUp },
];

const sowOnlyStages = ["breeding", "gestation", "farrowing", "dried"];

// --- HELPER FUNCTIONS ---
const norm = (v) => (typeof v === "string" ? v.trim().toLowerCase() : v);

function buildStats(pigs) {
  const safe = Array.isArray(pigs) ? pigs : [];
  const total = safe.length;

  const sex = safe.reduce((acc, p) => {
    const s = p?.sex || "Unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const breed = safe.reduce((acc, p) => {
    const b = p?.breed || "Unknown";
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  const sexBreed = safe.reduce((acc, p) => {
    const s = p?.sex || "Unknown";
    const b = p?.breed || "Unknown";
    if (!acc[s]) acc[s] = {};
    acc[s][b] = (acc[s][b] || 0) + 1;
    return acc;
  }, {});

  return { total, sex, breed, sexBreed };
}

// --- REUSABLE UI COMPONENTS ---

const Pill = ({ children, onClick, tone = "neutral", title }) => {
  const tones = {
    neutral: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    primary: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    success: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    rose: "bg-rose-100 text-rose-800 hover:bg-rose-200",
    amber: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    violet: "bg-violet-100 text-violet-800 hover:bg-violet-200",
  };
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 ${tones[tone]}`}
    >
      {children}
    </button>
  );
};

const StageMasterCard = ({ label, icon: Icon, children }) => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-bold text-gray-800">{label}</h3>
    </div>
    <div className="p-4 md:p-5">{children}</div>
  </div>
);

// New component to group pills into a card-like element
const StatPillGroup = ({ icon: Icon, title, children, iconColor = "text-gray-500" }) => (
  <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 min-w-[280px] shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
        {title}
      </h4>
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const StatCard = ({ value, label, sublabel, onClick, tone = "primary" }) => {
  const tones = {
    primary: {
      bg: "bg-blue-50 hover:border-blue-200",
      border: "border-blue-100",
      value: "text-blue-900",
    },
    success: {
      bg: "bg-emerald-50 hover:border-emerald-200",
      border: "border-emerald-100",
      value: "text-emerald-900",
    },
    rose: {
      bg: "bg-rose-50 hover:border-rose-200",
      border: "border-rose-100",
      value: "text-rose-900",
    },
  };
  const selectedTone = tones[tone];

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`p-4 rounded-xl border transition-all duration-200 text-left flex-1 min-w-[160px] ${selectedTone.bg
        } ${selectedTone.border} ${onClick ? "cursor-pointer shadow-sm hover:shadow-md" : ""
        }`}
    >
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${selectedTone.value}`}>{value}</p>
      {sublabel && (
        <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
      )}
    </button>
  );
};

// Toggle Button Component
const ViewToggle = ({ showGraphs, onToggle }) => (
  <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
    <button
      onClick={() => onToggle(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!showGraphs
        ? "bg-blue-600 text-white shadow-sm"
        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
        }`}
    >
      <TableProperties className="h-4 w-4" />
      Show Stats
    </button>
    <button
      onClick={() => onToggle(true)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${showGraphs
        ? "bg-blue-600 text-white shadow-sm"
        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
        }`}
    >
      <BarChart3 className="h-4 w-4" />
      Show Graphs
    </button>
  </div>
);

const columns = [
  { key: "pigId", label: "Pig ID", sortable: true },
  { key: "sex", label: "Sex", sortable: true },
  { key: "breed", label: "Breed", sortable: true },
  { key: "stageName", label: "Stage", sortable: true },
];

// --- MAIN COMPONENT ---

export default function StageDistributionReport() {
  const dispatch = useDispatch();
  const [stageData, setStageData] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableTitle, setTableTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGraphs, setShowGraphs] = useState(false);
  const selectedFarm = useSelector(currentFarmRecord);

  useEffect(() => {
    dispatch(fetchCurrentFarm());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedFarm) return;
    let mounted = true;
    (async () => {
      const results = await Promise.all(
        STAGES.map(({ key }) => getAllPigsByStage(selectedFarm, key))
      );
      const mapped = {};
      STAGES.forEach(({ key }, i) => (mapped[key] = results[i]?.data || []));
      if (mounted) setStageData(mapped);
    })();
    return () => {
      mounted = false;
    };
  }, [selectedFarm]);

  const grandTotal = useMemo(
    () =>
      Object.values(stageData).reduce(
        (acc, arr) => acc + (arr?.length || 0),
        0
      ),
    [stageData]
  );

  const showTable = (rows, title) => {
    const tableItems = Array.isArray(rows) ? rows : [];
    const updatedTableItems = tableItems.map((item) => {
      if (sowOnlyStages.includes(item.stageName)) {
        return { ...item, sex: "Female" };
      }
      return item;
    });
    setSelectedRows(updatedTableItems);
    setTableTitle(title);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-gray-50/75 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Stage Distribution Report
              </h2>
              <p className="mt-1 text-gray-500">
                A detailed breakdown of the pig population across different stages.
              </p>
            </div>
            <ViewToggle showGraphs={showGraphs} onToggle={setShowGraphs} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={showGraphs ? 'graphs' : 'stats'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {showGraphs ? (
              <StageDistributionGraphs
                stageData={stageData}
                stages={STAGES}
                sowOnlyStages={sowOnlyStages}
              />
            ) : (
              <div className="space-y-8">
                {STAGES.map(({ key, label, icon }) => {
                  const pigs = stageData[key] || [];
                  const stats = buildStats(pigs);
                  const isSowOnly = sowOnlyStages.includes(key);
                  const pct = grandTotal
                    ? ((stats.total / grandTotal) * 100).toFixed(1)
                    : 0;

                  const breedEntries = Object.entries(stats.breed || {}).sort(
                    (a, b) => b[1] - a[1]
                  );

                  const hasSexBreedData =
                    Object.keys(stats.sexBreed?.Male || stats.sexBreed?.male || {}).length > 0 ||
                    Object.keys(stats.sexBreed?.Female || stats.sexBreed?.female || {}).length > 0;

                  if (stats.total === 0) {
                    return (
                      <StageMasterCard key={key} label={label} icon={icon}>
                        <div className="text-center py-8">
                          <p className="text-gray-500">No pigs in this stage.</p>
                        </div>
                      </StageMasterCard>
                    )
                  }

                  return (
                    <StageMasterCard key={key} label={label} icon={icon}>
                      <div className="flex flex-wrap gap-4">
                        {/* --- STAT CARDS --- */}
                        <StatCard
                          label="Total Pigs"
                          value={stats.total}
                          sublabel={`${pct}% of farm total`}
                          onClick={() => showTable(pigs, `${label} · All pigs`)}
                          tone="primary"
                        />

                        {!isSowOnly && (
                          <>
                            <StatCard
                              label="Male"
                              value={stats.sex?.Male || stats.sex?.male || 0}
                              onClick={() => showTable(pigs.filter(p => norm(p.sex) === 'male'), `${label} · Male`)}
                              tone="success"
                            />
                            <StatCard
                              label="Female"
                              value={stats.sex?.Female || stats.sex?.female || 0}
                              onClick={() => showTable(pigs.filter(p => norm(p.sex) === 'female'), `${label} · Female`)}
                              tone="rose"
                            />
                          </>
                        )}

                        {/* --- PILL GROUP CARDS --- */}

                        {breedEntries.length > 0 && (
                          <StatPillGroup icon={GitBranch} title="By Breed" iconColor="text-amber-600">
                            {breedEntries.map(([b, c]) => (
                              <Pill
                                key={b}
                                tone="amber"
                                title={`Filter ${b}`}
                                onClick={() => showTable(pigs.filter(p => norm(p.breed) === norm(b)), `${label} · Breed: ${b}`)}
                              >
                                {b} &middot; {c}
                              </Pill>
                            ))}
                          </StatPillGroup>
                        )}

                        {!isSowOnly && hasSexBreedData && (
                          <StatPillGroup icon={Split} title="By Sex & Breed" iconColor="text-violet-600">
                            <div className="w-full space-y-4">
                              {/* Male Section */}
                              <div>
                                <p className="text-xs font-bold text-emerald-700 mb-2">MALE</p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(stats.sexBreed?.Male || stats.sexBreed?.male || {}).length === 0 ? (
                                    <span className="text-xs text-gray-400">No data</span>
                                  ) : (
                                    Object.entries(stats.sexBreed?.Male || stats.sexBreed?.male || {}).map(([b, c]) => (
                                      <Pill
                                        key={`m-${b}`}
                                        tone="success"
                                        onClick={() => showTable(pigs.filter(p => norm(p.sex) === 'male' && norm(p.breed) === norm(b)), `${label} · Male · ${b}`)}
                                      >
                                        {b} &middot; {c}
                                      </Pill>
                                    ))
                                  )}
                                </div>
                              </div>
                              {/* Female Section */}
                              <div>
                                <p className="text-xs font-bold text-rose-700 mb-2">FEMALE</p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(stats.sexBreed?.Female || stats.sexBreed?.female || {}).length === 0 ? (
                                    <span className="text-xs text-gray-400">No data</span>
                                  ) : (
                                    Object.entries(stats.sexBreed?.Female || stats.sexBreed?.female || {}).map(([b, c]) => (
                                      <Pill
                                        key={`f-${b}`}
                                        tone="rose"
                                        onClick={() => showTable(pigs.filter(p => norm(p.sex) === 'female' && norm(p.breed) === norm(b)), `${label} · Female · ${b}`)}
                                      >
                                        {b} &middot; {c}
                                      </Pill>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </StatPillGroup>
                        )}
                      </div>
                    </StageMasterCard>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Full-screen Modal for Table */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <LayoutList className="h-5 w-5 text-gray-500" />
                    <h4 className="text-lg font-semibold text-gray-800">
                      {tableTitle}
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  <AdvancedTable
                    data={selectedRows}
                    columns={columns}
                    searchPlaceholder="Search by Pig ID, Breed, or Sex..."
                    searchKey="pigId"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}