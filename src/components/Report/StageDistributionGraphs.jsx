import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

// Color palettes for consistency
const COLORS = {
    primary: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
    sex: {
        male: '#10B981',
        female: '#F43F5E',
    },
    breed: ['#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
    stages: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
};

// Helper function to get color by index
const getColor = (index, palette) => palette[index % palette.length];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-semibold text-gray-800">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-semibold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Chart container component
const ChartContainer = ({ title, children, className = "" }) => (
    <div className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm ${className}`}>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            {title}
        </h4>
        <div className="h-64">
            {children}
        </div>
    </div>
);

const StageDistributionGraphs = ({ stageData, stages, sowOnlyStages }) => {
    // Prepare data for overall stage distribution
    const stageDistributionData = stages.map(({ key, label }) => ({
        name: label,
        value: (stageData[key] || []).length,
        fill: getColor(stages.findIndex(s => s.key === key), COLORS.stages),
    })).filter(item => item.value > 0);

    // Calculate overall statistics
    const allPigs = Object.values(stageData).flat();
    const totalCount = allPigs.length;

    // Overall breed distribution
    const breedStats = allPigs.reduce((acc, pig) => {
        const breed = pig?.breed || 'Unknown';
        acc[breed] = (acc[breed] || 0) + 1;
        return acc;
    }, {});

    const overallBreedData = Object.entries(breedStats)
        .map(([breed, count], index) => ({
            name: breed,
            value: count,
            fill: getColor(index, COLORS.breed),
        }))
        .sort((a, b) => b.value - a.value);

    // Overall sex distribution (excluding sow-only stages for accuracy)
    const sexStats = allPigs
        .filter(pig => !sowOnlyStages.includes(pig.stageName))
        .reduce((acc, pig) => {
            const sex = pig?.sex?.toLowerCase() || 'unknown';
            acc[sex] = (acc[sex] || 0) + 1;
            return acc;
        }, {});

    const overallSexData = Object.entries(sexStats).map(([sex, count]) => ({
        name: sex.charAt(0).toUpperCase() + sex.slice(1),
        value: count,
        fill: sex === 'male' ? COLORS.sex.male : sex === 'female' ? COLORS.sex.female : '#6B7280',
    }));

    // Prepare detailed stage analysis
    const getStageAnalysis = (stageKey) => {
        const pigs = stageData[stageKey] || [];
        const isSowOnly = sowOnlyStages.includes(stageKey);

        if (pigs.length === 0) return null;

        // Breed distribution for this stage
        const stageBreedStats = pigs.reduce((acc, pig) => {
            const breed = pig?.breed || 'Unknown';
            acc[breed] = (acc[breed] || 0) + 1;
            return acc;
        }, {});

        const stageBreedData = Object.entries(stageBreedStats)
            .map(([breed, count], index) => ({
                name: breed,
                value: count,
                fill: getColor(index, COLORS.breed),
            }))
            .sort((a, b) => b.value - a.value);

        // Sex distribution for this stage (if applicable)
        let stageSexData = [];
        if (!isSowOnly) {
            const stageSexStats = pigs.reduce((acc, pig) => {
                const sex = pig?.sex?.toLowerCase() || 'unknown';
                acc[sex] = (acc[sex] || 0) + 1;
                return acc;
            }, {});

            stageSexData = Object.entries(stageSexStats).map(([sex, count]) => ({
                name: sex.charAt(0).toUpperCase() + sex.slice(1),
                value: count,
                fill: sex === 'male' ? COLORS.sex.male : sex === 'female' ? COLORS.sex.female : '#6B7280',
            }));
        }

        // Sex + Breed combination (if applicable)
        let stageSexBreedData = [];
        if (!isSowOnly && stageSexData.length > 1) {
            const sexBreedCombos = {};
            pigs.forEach(pig => {
                const sex = pig?.sex?.toLowerCase() || 'unknown';
                const breed = pig?.breed || 'Unknown';
                const key = `${sex.charAt(0).toUpperCase() + sex.slice(1)} ${breed}`;
                sexBreedCombos[key] = (sexBreedCombos[key] || 0) + 1;
            });

            stageSexBreedData = Object.entries(sexBreedCombos)
                .map(([combo, count], index) => ({
                    name: combo,
                    value: count,
                    fill: combo.startsWith('Male') ? '#10B981' : combo.startsWith('Female') ? '#F43F5E' : '#6B7280',
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 8); // Limit to prevent overcrowding
        }

        return {
            breed: stageBreedData,
            sex: stageSexData,
            sexBreed: stageSexBreedData,
        };
    };

    return (
        <div className="bg-gray-50/75 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Overall Statistics Section */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Overall Farm Statistics</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Overall Stage Distribution */}
                        {stageDistributionData.length > 0 && (
                            <ChartContainer title={`Total Distribution (${totalCount} pigs)`} className="lg:col-span-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stageDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            {stageDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}

                        {/* Overall Breed Distribution */}
                        {overallBreedData.length > 0 && (
                            <ChartContainer title="Overall Breed Distribution" className="lg:col-span-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={overallBreedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}

                        {/* Overall Sex Distribution */}
                        {overallSexData.length > 0 && (
                            <ChartContainer title="Overall Sex Distribution" className="lg:col-span-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={overallSexData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            {overallSexData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                    </div>
                </div>

                {/* Stage-by-Stage Analysis */}
                <div className="space-y-8">
                    {stages.map(({ key, label }) => {
                        const analysis = getStageAnalysis(key);
                        const isSowOnly = sowOnlyStages.includes(key);
                        const pigCount = (stageData[key] || []).length;

                        if (!analysis || pigCount === 0) {
                            return (
                                <div key={key} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{label}</h4>
                                    <p className="text-gray-500">No pigs in this stage.</p>
                                </div>
                            );
                        }

                        // Determine grid layout based on available data
                        let gridCols = "grid-cols-1";
                        const hasBreed = analysis.breed.length > 0;
                        const hasSex = analysis.sex.length > 0 && !isSowOnly;
                        const hasSexBreed = analysis.sexBreed.length > 0 && !isSowOnly;

                        const chartCount = [hasBreed, hasSex, hasSexBreed].filter(Boolean).length;
                        if (chartCount >= 3) gridCols = "lg:grid-cols-3";
                        else if (chartCount >= 2) gridCols = "lg:grid-cols-2";

                        return (
                            <div key={key} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-800">
                                        {label} ({pigCount} pig{pigCount !== 1 ? 's' : ''})
                                    </h4>
                                </div>

                                <div className={`grid ${gridCols} gap-6`}>
                                    {/* Breed Distribution */}
                                    {hasBreed && (
                                        <ChartContainer title="By Breed">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analysis.breed} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{ fontSize: 11 }}
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                    />
                                                    <YAxis tick={{ fontSize: 11 }} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="value" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    )}

                                    {/* Sex Distribution */}
                                    {hasSex && (
                                        <ChartContainer title="By Sex">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={analysis.sex}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={70}
                                                        dataKey="value"
                                                    >
                                                        {analysis.sex.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    )}

                                    {/* Sex + Breed Combination */}
                                    {hasSexBreed && (
                                        <ChartContainer title="By Sex & Breed">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analysis.sexBreed} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{ fontSize: 10 }}
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={80}
                                                    />
                                                    <YAxis tick={{ fontSize: 11 }} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="value" radius={[3, 3, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StageDistributionGraphs;