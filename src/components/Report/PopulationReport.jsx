import React, { useState, useEffect } from "react";
import { Download, PiggyBank } from "lucide-react";
import { getPigPopulationReports } from "../../actions/reportActions";
import { fetchCurrentFarm } from "../../store/actions/pigActions";
import { useDispatch, useSelector } from "react-redux";
import { currentFarmRecord } from "../../store/selectors/pigSelectors";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const COLORS = [
    "#3b82f6", // blue
    "#f97316", // orange
    "#10b981", // green
    "#ec4899", // pink
    "#6366f1", // indigo
    "#f59e0b", // amber
];

const PopulationReport = ({ showDetails }) => {
    const dispatch = useDispatch();
    const [stats, setStats] = useState({
        total: 0,
        male: { total: 0, breeds: {} },
        female: { total: 0, breeds: {} },
    });

    useEffect(() => {
        dispatch(fetchCurrentFarm());
    }, [dispatch]);

    const selectedFarm = useSelector(currentFarmRecord);

    useEffect(() => {
        if (!selectedFarm) return;
        const fetchData = async () => {
            try {
                const pigs = await getPigPopulationReports(selectedFarm);

                const summary = {
                    total: 0,
                    male: { total: 0, breeds: {} },
                    female: { total: 0, breeds: {} },
                };

                if (Array.isArray(pigs.data) && pigs.data.length > 0) {
                    summary.total = pigs.data.length;

                    pigs.data.forEach((pig) => {
                        const { sex, breed } = pig || {};
                        if (!sex || !breed) return;

                        if (sex.toLowerCase() === "male") {
                            summary.male.total++;
                            summary.male.breeds[breed] =
                                (summary.male.breeds[breed] || 0) + 1;
                        } else if (sex.toLowerCase() === "female") {
                            summary.female.total++;
                            summary.female.breeds[breed] =
                                (summary.female.breeds[breed] || 0) + 1;
                        }
                    });
                }

                setStats(summary);
            } catch (err) {
                console.error("Error fetching population report:", err);
            }
        };

        fetchData();
    }, [selectedFarm]);

    // Pie chart data
    const genderData = [
        { name: "Male", value: stats.male.total },
        { name: "Female", value: stats.female.total },
    ];
    const maleBreedData = Object.entries(stats.male.breeds).map(
        ([breed, value]) => ({ name: breed, value })
    );
    const femaleBreedData = Object.entries(stats.female.breeds).map(
        ([breed, value]) => ({ name: breed, value })
    );

    return (
        <div className="bg-white border border-gray-200 rounded-md p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                    <PiggyBank className="h-7 w-7 text-blue-600 mr-2" />
                    Pig Population Summary
                </h3>
                <button
                    onClick={() => downloadCSV([stats], "population-report")}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition"
                >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                </button>
            </div>

            {/* Stats + Gender Pie Chart side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                {/* Left: Stats */}
                <div className="space-y-4">
                    {/* Total */}
                    <div
                        className="bg-blue-50 border border-gray-200 rounded-md p-3 hover:shadow-sm cursor-pointer transition"
                        onClick={() => showDetails("total", "Total Pigs")}
                    >
                        <div className="text-center">
                            <div className="text-sm font-medium text-blue-700">Total Pigs</div>
                            <div className="text-lg font-semibold text-blue-900">
                                {stats.total}
                            </div>
                        </div>
                    </div>

                    {/* Male & Female */}
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className="bg-green-50 border border-gray-200 rounded-md p-3 hover:shadow-sm cursor-pointer transition text-center"
                            onClick={() => showDetails("male", "Male Pigs")}
                        >
                            <div className="text-sm font-medium text-green-700">Male</div>
                            <div className="text-lg font-semibold text-green-900">
                                {stats.male.total}
                            </div>
                        </div>
                        <div
                            className="bg-pink-50 border border-gray-200 rounded-md p-3 hover:shadow-sm cursor-pointer transition text-center"
                            onClick={() => showDetails("female", "Female Pigs")}
                        >
                            <div className="text-sm font-medium text-pink-700">Female</div>
                            <div className="text-lg font-semibold text-pink-900">
                                {stats.female.total}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Pie chart */}
                <div className="w-full h-64">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={genderData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius="80%"
                                label
                            >
                                {genderData.map((_, idx) => (
                                    <Cell
                                        key={`gender-${idx}`}
                                        fill={COLORS[idx % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Male vs Female Breeds Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Male Breeds */}
                <div className="border border-green-200 rounded-xl p-4">
                    <div className="flex items-center mb-3">
                        <div className="h-8 w-8 flex items-center justify-center border border-green-500 text-green-700 rounded-full">
                            ♂
                        </div>
                        <h4 className="ml-2 text-base font-semibold text-gray-900">
                            Male Breed Distribution
                        </h4>
                    </div>
                    {/* Breed Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {Object.entries(stats.male.breeds).map(([breed, count]) => (
                            <div
                                key={`male-${breed}`}
                                className="border border-green-500 rounded-md p-2 text-center cursor-pointer hover:shadow-sm transition"
                                onClick={() =>
                                    showDetails(`male-${breed.toLowerCase()}`, `Male ${breed}`)
                                }
                            >
                                <div className="text-xs font-medium text-green-700">{breed}</div>
                                <div className="text-sm font-semibold text-green-900">
                                    {count}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Pie Chart */}
                    <div className="w-full h-56">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={maleBreedData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius="80%"
                                    label
                                >
                                    {maleBreedData.map((_, idx) => (
                                        <Cell
                                            key={`male-${idx}`}
                                            fill={COLORS[idx % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Female Breeds */}
                <div className="border border-pink-200 rounded-xl p-4">
                    <div className="flex items-center mb-3">
                        <div className="h-8 w-8 flex items-center justify-center border border-pink-500 text-pink-700 rounded-full">
                            ♀
                        </div>
                        <h4 className="ml-2 text-base font-semibold text-gray-900">
                            Female Breed Distribution
                        </h4>
                    </div>
                    {/* Breed Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {Object.entries(stats.female.breeds).map(([breed, count]) => (
                            <div
                                key={`female-${breed}`}
                                className="border border-pink-500 rounded-md p-2 text-center cursor-pointer hover:shadow-sm transition"
                                onClick={() =>
                                    showDetails(`female-${breed.toLowerCase()}`, `Female ${breed}`)
                                }
                            >
                                <div className="text-xs font-medium text-pink-700">{breed}</div>
                                <div className="text-sm font-semibold text-pink-900">
                                    {count}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Pie Chart */}
                    <div className="w-full h-56">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={femaleBreedData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius="80%"
                                    label
                                >
                                    {femaleBreedData.map((_, idx) => (
                                        <Cell
                                            key={`female-${idx}`}
                                            fill={COLORS[idx % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// CSV helper
const downloadCSV = (data, filename) => {
    if (!data.length) return;
    const flattenObject = (obj) => {
        const flat = {};
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === "object" && obj[key] !== null) {
                Object.keys(obj[key]).forEach((subKey) => {
                    flat[`${key}_${subKey}`] = obj[key][subKey];
                });
            } else {
                flat[key] = obj[key];
            }
        });
        return flat;
    };
    const flattenedData = data.map(flattenObject);
    const header = Object.keys(flattenedData[0]).join(",");
    const rows = flattenedData.map((row) =>
        Object.values(row)
            .map((val) => `"${val}"`)
            .join(",")
    );
    const csvContent = [header, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default PopulationReport;
