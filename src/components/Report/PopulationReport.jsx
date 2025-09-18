import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Download, FileText, PiggyBank } from "lucide-react";
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

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4">
                {/* Total Pigs centered */}
                <div className="md:flex md:justify-center">
                    <div
                        className="bg-blue-50 border border-gray-200 rounded-md p-3 hover:shadow-sm cursor-pointer transition w-full md:w-1/3"
                        onClick={() => showDetails("total", "Total Pigs")}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-center">
                                <div className="text-sm font-medium text-blue-700">Total Pigs</div>
                                <div className="text-lg font-semibold text-blue-900">{stats.total}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Male & Female side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Male */}
                    <div
                        className="bg-green-50 border border-gray-200 rounded-md p-3 hover:shadow-sm cursor-pointer transition flex flex-col items-center justify-center"
                        onClick={() => showDetails("male", "Male Pigs")}
                    >
                        <div className="text-center">
                            <div className="text-sm font-medium text-green-700">Male</div>
                            <div className="text-lg font-semibold text-green-900">{stats.male.total}</div>
                        </div>
                    </div>

                    {/* Female */}
                    <div
                        className="bg-pink-50 border border-gray-200 rounded-md p-3 hover:shadow-sm cursor-pointer transition flex flex-col items-center justify-center"
                        onClick={() => showDetails("female", "Female Pigs")}
                    >
                        <div className="text-center">
                            <div className="text-sm font-medium text-pink-700">Female</div>
                            <div className="text-lg font-semibold text-pink-900">{stats.female.total}</div>
                        </div>
                    </div>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(stats.male.breeds).map(([breed, count]) => (
                            <div
                                key={`male-${breed}`}
                                className="border border-green-500 rounded-md p-2 text-center cursor-pointer hover:shadow-sm transition"
                                onClick={() => showDetails(`male-${breed.toLowerCase()}`, `Male ${breed}`)}
                            >
                                <div className="text-xs font-medium text-green-700">{breed}</div>
                                <div className="text-sm font-semibold text-green-900">{count}</div>
                            </div>
                        ))}
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(stats.female.breeds).map(([breed, count]) => (
                            <div
                                key={`female-${breed}`}
                                className="border border-pink-500 rounded-md p-2 text-center cursor-pointer hover:shadow-sm transition"
                                onClick={() => showDetails(`female-${breed.toLowerCase()}`, `Female ${breed}`)}
                            >
                                <div className="text-xs font-medium text-pink-700">{breed}</div>
                                <div className="text-sm font-semibold text-pink-900">{count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PopulationReport;
