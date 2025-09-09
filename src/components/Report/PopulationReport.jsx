import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Download, FileText } from "lucide-react";
import { getPigPopulationReports } from "../../actions/reportActions";
import { fetchCurrentFarm } from "../../store/actions/pigActions";
import { useDispatch, useSelector } from "react-redux";
import { currentFarmRecord } from "../../store/selectors/pigSelectors";

const PopulationReport = ({ showDetails }) => {
    const dispatch = useDispatch();
    const [stats, setStats] = useState({
        total: 0,
        male: { total: 0, breeds: {} },
        female: { total: 0, breeds: {} },
    });

    useEffect(() => {
        dispatch(fetchCurrentFarm());
    }, [dispatch])

    useEffect(() => {
        console.log("stats -> ", stats)
    }, [stats])

    const selectedFarm = useSelector(currentFarmRecord);

    // Fetch + process pig data
    useEffect(() => {
        if (!selectedFarm) return;
        const fetchData = async () => {
            try {
                const pigs = await getPigPopulationReports(selectedFarm); // returns list of pigs
                console.log("PIGS --> ", pigs)

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
                            summary.male.breeds[breed] = (summary.male.breeds[breed] || 0) + 1;
                        } else if (sex.toLowerCase() === "female") {
                            summary.female.total++;
                            summary.female.breeds[breed] = (summary.female.breeds[breed] || 0) + 1;
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


    // CSV download function
    const downloadCSV = (data, filename) => {
        const flattenObject = (obj) => {
            const flat = {};
            Object.keys(obj).forEach((key) => {
                if (typeof obj[key] === "object" && obj[key] !== null) {
                    Object.keys(obj[key]).forEach((subKey) => {
                        if (typeof obj[key][subKey] === "object") {
                            Object.keys(obj[key][subKey]).forEach((innerKey) => {
                                flat[`${key}_${subKey}_${innerKey}`] = obj[key][subKey][innerKey];
                            });
                        } else {
                            flat[`${key}_${subKey}`] = obj[key][subKey];
                        }
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

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="h-7 w-7 text-blue-600 mr-2" />
                    Pig Population Report
                </h3>
                <button
                    onClick={() => downloadCSV([stats], "population-report")}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition"
                >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total */}
                <div
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 hover:shadow-md cursor-pointer transition"
                    onClick={() => showDetails("total", "Total Pigs")}
                >
                    <div className="flex items-center">
                        <BarChart3 className="h-10 w-10 text-blue-600" />
                        <div className="ml-4">
                            <div className="text-sm font-medium text-blue-700">Total Pigs</div>
                            <div className="text-3xl font-extrabold text-blue-900">{stats.total}</div>
                        </div>
                    </div>
                </div>

                {/* Male */}
                <div
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 hover:shadow-md cursor-pointer transition"
                    onClick={() => showDetails("male", "Male Pigs")}
                >
                    <div className="flex items-center">
                        <TrendingUp className="h-10 w-10 text-green-600" />
                        <div className="ml-4">
                            <div className="text-sm font-medium text-green-700">Male</div>
                            <div className="text-3xl font-extrabold text-green-900">{stats.male.total}</div>
                        </div>
                    </div>
                </div>

                {/* Female */}
                <div
                    className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 hover:shadow-md cursor-pointer transition"
                    onClick={() => showDetails("female", "Female Pigs")}
                >
                    <div className="flex items-center">
                        <FileText className="h-10 w-10 text-pink-600" />
                        <div className="ml-4">
                            <div className="text-sm font-medium text-pink-700">Female</div>
                            <div className="text-3xl font-extrabold text-pink-900">{stats.female.total}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Male vs Female Breeds Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                {/* Male Breeds */}
                <div className="bg-white border rounded-xl shadow p-6">
                    <div className="flex items-center mb-4">
                        <div className="h-10 w-10 flex items-center justify-center bg-green-100 text-green-700 rounded-full">
                            ♂
                        </div>
                        <h4 className="ml-3 text-lg font-semibold text-gray-900">
                            Male Breeds Distribution
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(stats.male.breeds).map(([breed, count]) => (
                            <div
                                key={`male-${breed}`}
                                className="bg-green-50 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition"
                                onClick={() => showDetails(`male-${breed.toLowerCase()}`, `Male ${breed}`)}
                            >
                                <div className="text-sm font-medium text-green-700">{breed}</div>
                                <div className="text-xl font-bold text-green-900">{count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Female Breeds */}
                <div className="bg-white border rounded-xl shadow p-6">
                    <div className="flex items-center mb-4">
                        <div className="h-10 w-10 flex items-center justify-center bg-pink-100 text-pink-700 rounded-full">
                            ♀
                        </div>
                        <h4 className="ml-3 text-lg font-semibold text-gray-900">
                            Female Breeds Distribution
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(stats.female.breeds).map(([breed, count]) => (
                            <div
                                key={`female-${breed}`}
                                className="bg-pink-50 rounded-lg p-4 cursor-pointer hover:bg-pink-100 transition"
                                onClick={() => showDetails(`female-${breed.toLowerCase()}`, `Female ${breed}`)}
                            >
                                <div className="text-sm font-medium text-pink-700">{breed}</div>
                                <div className="text-xl font-bold text-pink-900">{count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopulationReport;
