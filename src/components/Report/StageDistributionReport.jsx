import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  TrendingUp,
  Users,
  GitBranch,
  LayoutList,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdvancedTable from "../common/AdvancedTable";
import { getAllPigsByStage } from "../../actions/dashboardActions";
import { useDispatch, useSelector } from "react-redux";
import { currentFarmRecord } from "../../store/selectors/pigSelectors";
import { fetchCurrentFarm } from "../../store/actions/pigActions";

// Dummy stages
const STAGES = [
  { key: "breeding", label: "Breeding" },
  { key: "gestation", label: "Gestation" },
  { key: "farrowing", label: "Farrowing" },
  { key: "nursery", label: "Nursery" },
  { key: "dried", label: "Dried" },
  { key: "fattening", label: "Fattening" },
];

// Dummy fallback
// const fetchDataFallback = async (stage) => {
//   const sample = [
//     { pigId: "P-001", sex: "Male", breed: "Landrace", currentStage: stage },
//     { pigId: "P-002", sex: "Female", breed: "Yorkshire", currentStage: stage },
//     { pigId: "P-003", sex: "Male", breed: "Duroc", currentStage: stage },
//     { pigId: "P-004", sex: "Female", breed: "Hampshire", currentStage: stage },
//     { pigId: "P-005", sex: "Male", breed: "Yorkshire", currentStage: stage },
//   ];
//   return sample;
// };

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

const Pill = ({ children, onClick, tone = "neutral", title }) => {
  const tones = {
    neutral:
      "bg-white text-gray-700 border border-gray-200 hover:border-gray-300",
    primary:
      "bg-blue-50 text-blue-700 border border-blue-100 hover:border-blue-200",
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border border-rose-100 hover:border-rose-200",
    amber:
      "bg-amber-50 text-amber-800 border border-amber-100 hover:border-amber-200",
    violet:
      "bg-violet-50 text-violet-700 border border-violet-100 hover:border-violet-200",
  };
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tones[tone]}`}
    >
      {children}
    </button>
  );
};

const StageCard = ({ label, children }) => (
  <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white shadow-sm p-5">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-purple-100 text-purple-700">
          <TrendingUp className="h-5 w-5" />
        </div>
        <h4 className="text-base md:text-lg font-semibold text-gray-900">
          {label}
        </h4>
      </div>
    </div>
    {children}
  </div>
);

const columns = [
  { key: "pigId", label: "Pig ID", sortable: true },
  { key: "sex", label: "Sex", sortable: true },
  { key: "breed", label: "Breed", sortable: true },
  { key: "currentStage", label: "Stage", sortable: true },
];

export default function StageDistributionReport() {
  const dispatch = useDispatch();
  const [stageData, setStageData] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableTitle, setTableTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const results = await Promise.all(
        STAGES.map(({ key }) => getAllPigsByStage(selectedFarm, key.key))
      );

      console.log("results ::::", results)
      const mapped = {};
      STAGES.forEach(({ key }, i) => (mapped[key] = results[i] || []));
      if (mounted) setStageData(mapped);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    dispatch(fetchCurrentFarm());
  }, [dispatch])

  const selectedFarm = useSelector(currentFarmRecord);

  const grandTotal = useMemo(
    () =>
      Object.values(stageData).reduce(
        (acc, arr) => acc + (arr?.length || 0),
        0
      ),
    [stageData]
  );

  const showTable = (rows, title) => {
    setSelectedRows(Array.isArray(rows) ? rows : []);
    setTableTitle(title);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl md:text-2xl font-bold text-gray-900">
            Stage Distribution Report
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {STAGES.map(({ key, label }) => {
          const pigs = stageData[key] || [];
          const stats = buildStats(pigs);
          const pct = grandTotal
            ? ((stats.total / grandTotal) * 100).toFixed(1)
            : 0;

          const maleCount = stats.sex?.Male || stats.sex?.male || 0;
          const femaleCount = stats.sex?.Female || stats.sex?.female || 0;
          const breedEntries = Object.entries(stats.breed || {}).sort(
            (a, b) => b[1] - a[1]
          );

          return (
            <StageCard key={key} label={label}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total */}
                <div className="rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Total
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 leading-none">
                    {stats.total}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {pct}% of all pigs
                  </div>
                  <div className="mt-3">
                    <Pill
                      tone="primary"
                      title="View all"
                      onClick={() => showTable(pigs, `${label} · All pigs`)}
                    >
                      View all pigs
                    </Pill>
                  </div>
                </div>

                {/* By Sex */}
                <div className="rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <LayoutList className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      By Sex
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Pill
                      tone="success"
                      title="Filter male"
                      onClick={() =>
                        showTable(
                          pigs.filter((p) => norm(p.sex) === "male"),
                          `${label} · Male`
                        )
                      }
                    >
                      ♂ Male · {maleCount}
                    </Pill>
                    <Pill
                      tone="rose"
                      title="Filter female"
                      onClick={() =>
                        showTable(
                          pigs.filter((p) => norm(p.sex) === "female"),
                          `${label} · Female`
                        )
                      }
                    >
                      ♀ Female · {femaleCount}
                    </Pill>
                  </div>
                </div>

                {/* By Breed */}
                <div className="rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow col-span-full">
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <GitBranch className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      By Breed
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {breedEntries.length === 0 && (
                      <span className="text-xs text-gray-500">
                        No breeds available
                      </span>
                    )}
                    {breedEntries.map(([b, c]) => (
                      <Pill
                        key={b}
                        tone="amber"
                        title={`Filter ${b}`}
                        onClick={() =>
                          showTable(
                            pigs.filter((p) => norm(p.breed) === norm(b)),
                            `${label} · Breed: ${b}`
                          )
                        }
                      >
                        {b} · {c}
                      </Pill>
                    ))}
                  </div>
                </div>

                {/* Sex × Breed */}
                <div className="rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow col-span-full">
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <LayoutList className="h-4 w-4 text-violet-600" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                      Sex × Breed
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-[11px] font-semibold text-emerald-700 mb-2">
                        Male
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(
                          stats.sexBreed?.Male || stats.sexBreed?.male || {}
                        ).length === 0 && (
                            <span className="text-xs text-gray-400">No data</span>
                          )}
                        {Object.entries(
                          stats.sexBreed?.Male || stats.sexBreed?.male || {}
                        ).map(([b, c]) => (
                          <Pill
                            key={`m-${b}`}
                            tone="success"
                            title={`Male · ${b}`}
                            onClick={() =>
                              showTable(
                                pigs.filter(
                                  (p) =>
                                    norm(p.sex) === "male" &&
                                    norm(p.breed) === norm(b)
                                ),
                                `${label} · Male · ${b}`
                              )
                            }
                          >
                            {b} · {c}
                          </Pill>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-rose-700 mb-2">
                        Female
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(
                          stats.sexBreed?.Female ||
                          stats.sexBreed?.female ||
                          {}
                        ).length === 0 && (
                            <span className="text-xs text-gray-400">No data</span>
                          )}
                        {Object.entries(
                          stats.sexBreed?.Female ||
                          stats.sexBreed?.female ||
                          {}
                        ).map(([b, c]) => (
                          <Pill
                            key={`f-${b}`}
                            tone="rose"
                            title={`Female · ${b}`}
                            onClick={() =>
                              showTable(
                                pigs.filter(
                                  (p) =>
                                    norm(p.sex) === "female" &&
                                    norm(p.breed) === norm(b)
                                ),
                                `${label} · Female · ${b}`
                              )
                            }
                          >
                            {b} · {c}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </StageCard>
          );
        })}
      </div>

      {/* Full-screen Modal for Table */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <LayoutList className="h-5 w-5 text-gray-600" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    {tableTitle}
                  </h4>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
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
  );
}
