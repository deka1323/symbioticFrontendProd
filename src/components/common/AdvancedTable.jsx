import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdvancedTable = ({
    data,
    columns,
    searchPlaceholder = "Search by Pig ID...",
    searchKey,
    onAction,
    actionButtons = [],
    onRowClick = null,
    rowClickable = false,
    customRowRenderer = null
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // Search functionality
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;

        const filtered = data.filter(item => {
            if (searchKey) {
                const value = item[searchKey];
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            } else {
                return Object.values(item).some(value =>
                    value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
        });

        if (searchTerm && filtered.length === 0) {
            toast.error(`No entries found for "${searchTerm}"`);
        } else if (searchTerm && filtered.length > 0) {
            toast.success(`Found ${filtered.length} entries for "${searchTerm}"`);
        }

        return filtered;
    }, [data, searchTerm]);

    // Sorting functionality
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (sortConfig.key.toLowerCase().includes('date')) {
                const dateA = new Date(aValue);
                const dateB = new Date(bValue);
                return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            const stringA = aValue?.toString().toLowerCase() || '';
            const stringB = bValue?.toString().toLowerCase() || '';

            if (sortConfig.direction === 'asc') {
                return stringA.localeCompare(stringB);
            } else {
                return stringB.localeCompare(stringA);
            }
        });
    }, [filteredData, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleAction = (action, item) => {
        if (action.requiresConfirmation) {
            setPendingAction({ action, item });
            setShowConfirmDialog(true);
        } else {
            onAction(action, item);
        }
    };

    const confirmAction = () => {
        if (pendingAction) {
            onAction(pendingAction.action, pendingAction.item);
            setShowConfirmDialog(false);
            setPendingAction(null);
        }
    };

    const cancelAction = () => {
        setShowConfirmDialog(false);
        setPendingAction(null);
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return <ChevronUp className="h-3 w-3 text-gray-400" />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="h-3 w-3 text-blue-600" />
            : <ChevronDown className="h-3 w-3 text-blue-600" />;
    };

    const handleRowClick = (item) => {
        if (rowClickable && onRowClick) {
            onRowClick(item);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Search and Controls */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Items per page */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Show:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-600">entries</span>
                    </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
                    {searchTerm && ` (filtered from ${data.length} total entries)`}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Serial No column */}
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                S.No
                            </th>

                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                        }`}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.label}</span>
                                        {column.sortable && getSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}

                            {actionButtons.length > 0 && (
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + 1 + (actionButtons.length > 0 ? 1 : 0)}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    {searchTerm ? `No results found for "${searchTerm}"` : 'No data available'}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item, index) => (
                                <React.Fragment key={item.id || index}>
                                    <tr
                                        className={`hover:bg-gray-50 transition-colors duration-150 ${rowClickable ? 'cursor-pointer' : ''}`}
                                        onClick={() => handleRowClick(item)}
                                    >
                                        {/* Serial No cell */}
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {startIndex + index + 1}
                                        </td>

                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                            >
                                                {column.render ? column.render(item[column.key], item) : item[column.key]}
                                            </td>
                                        ))}

                                        {actionButtons.length > 0 && (
                                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    {actionButtons.map((button) => (
                                                        <button
                                                            key={button.key}
                                                            onClick={() => handleAction(button, item)}
                                                            disabled={button.disabled && button.disabled(item)}
                                                            className={`${button.className} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        >
                                                            {button.render ? button.render(item) : button.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    {customRowRenderer && customRowRenderer(item)}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 border rounded-md text-sm ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
                                <p className="text-sm text-gray-600">This action cannot be reversed</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700">
                                {pendingAction?.action?.confirmationMessage ||
                                    `Are you sure you want to move ${pendingAction?.item?.pigId || pendingAction?.item?.sowId || pendingAction?.item?.litterId} to the next stage?`}
                            </p>
                            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ <strong>Warning:</strong> This action is irreversible.
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={cancelAction}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                                {pendingAction?.action?.key === 'sell' ? 'Confirm Sale' : 'Confirm Move'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedTable;
