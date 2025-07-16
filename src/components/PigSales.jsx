import React, { useState } from 'react';
import { ShoppingCart, Plus, X, Download, Eye, User, MapPin, Phone, FileText, AlertTriangle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { samplePigs, companyInfo, generateReceiptNumber } from '../data/sampleData';
import jsPDF from 'jspdf';

const PigSales = () => {
    const [pigletIds, setPigletIds] = useState(['']);
    const [adultIds, setAdultIds] = useState(['']);
    const [buyerInfo, setBuyerInfo] = useState({
        name: '',
        address: '',
        phone: ''
    });
    const [managerName, setManagerName] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    console.log("samplePigs ->", samplePigs)

    const addPigIdField = (type) => {
        if (type === 'piglet') {
            setPigletIds([...pigletIds, '']);
        } else {
            setAdultIds([...adultIds, '']);
        }
    };

    const removePigIdField = (type, index) => {
        if (type === 'piglet' && pigletIds.length > 1) {
            const newIds = pigletIds.filter((_, i) => i !== index);
            setPigletIds(newIds);
        } else if (type === 'adult' && adultIds.length > 1) {
            const newIds = adultIds.filter((_, i) => i !== index);
            setAdultIds(newIds);
        }
    };

    const updatePigId = (type, index, value) => {
        if (type === 'piglet') {
            const newIds = [...pigletIds];
            newIds[index] = value;
            setPigletIds(newIds);
        } else {
            const newIds = [...adultIds];
            newIds[index] = value;
            setAdultIds(newIds);
        }
    };

    const validateForm = () => {
        const validPigletIds = pigletIds.filter(id => id.trim() !== '');
        const validAdultIds = adultIds.filter(id => id.trim() !== '');

        if (validPigletIds.length === 0 && validAdultIds.length === 0) {
            toast.error('Please enter at least one Pig ID');
            return false;
        }

        if (!buyerInfo.name.trim()) {
            toast.error('Please enter buyer name');
            return false;
        }

        if (!buyerInfo.address.trim()) {
            toast.error('Please enter buyer address');
            return false;
        }

        if (!buyerInfo.phone.trim()) {
            toast.error('Please enter buyer phone number');
            return false;
        }

        if (!managerName.trim()) {
            toast.error('Please enter manager name');
            return false;
        }

        return true;
    };

    const findPigDetails = (pigId) => {
        return samplePigs.find(pig => pig.pigId === pigId);
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const validPigletIds = pigletIds.filter(id => id.trim() !== '');
        const validAdultIds = adultIds.filter(id => id.trim() !== '');
        const allPigIds = [...validPigletIds, ...validAdultIds];

        const pigDetails = [];
        const notFoundPigs = [];

        allPigIds.forEach(pigId => {
            const pig = findPigDetails(pigId);
            if (pig) {
                // Determine sale type based on stage
                const saleType = ['nursery', 'fattening'].includes(pig.currentStage) ? 'piglet' : 'adult';
                pigDetails.push({ ...pig, saleType });
            } else {
                notFoundPigs.push(pigId);
            }
        });

        if (notFoundPigs.length > 0) {
            toast.error(`Pig IDs not found: ${notFoundPigs.join(', ')}`);
            return;
        }

        if (pigDetails.length === 0) {
            toast.error('No valid pigs found for sale');
            return;
        }

        // Generate receipt data
        const receipt = {
            receiptNumber: generateReceiptNumber(),
            date: new Date().toLocaleDateString(),
            buyer: buyerInfo,
            manager: managerName,
            pigs: pigDetails,
            company: companyInfo,
            pigletCount: pigDetails.filter(p => p.saleType === 'piglet').length,
            adultCount: pigDetails.filter(p => p.saleType === 'adult').length
        };

        setReceiptData(receipt);
        setShowPreview(true);
        toast.success(`Sale receipt generated for ${pigDetails.length} pig(s)`);
    };

    const downloadPDF = () => {
        if (!receiptData) return;

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            let yPosition = 20;

            // Header
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            doc.text(receiptData.company.name, pageWidth / 2, yPosition, { align: 'center' });

            yPosition += 10;
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(receiptData.company.address, pageWidth / 2, yPosition, { align: 'center' });

            yPosition += 6;
            doc.text(`Phone: ${receiptData.company.phone} | Email: ${receiptData.company.email}`, pageWidth / 2, yPosition, { align: 'center' });

            yPosition += 6;
            doc.text(`Registration No: ${receiptData.company.registrationNumber}`, pageWidth / 2, yPosition, { align: 'center' });

            // Title
            yPosition += 20;
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('LIVESTOCK SALE RECEIPT', pageWidth / 2, yPosition, { align: 'center' });

            // Receipt details
            yPosition += 20;
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(`Receipt No: ${receiptData.receiptNumber}`, 20, yPosition);
            doc.text(`Date: ${receiptData.date}`, pageWidth - 60, yPosition);

            yPosition += 10;
            doc.text(`Piglets: ${receiptData.pigletCount} | Adults: ${receiptData.adultCount}`, 20, yPosition);

            // Buyer information
            yPosition += 20;
            doc.setFont(undefined, 'bold');
            doc.text('BUYER INFORMATION:', 20, yPosition);

            yPosition += 8;
            doc.setFont(undefined, 'normal');
            doc.text(`Name: ${receiptData.buyer.name}`, 20, yPosition);

            yPosition += 6;
            doc.text(`Address: ${receiptData.buyer.address}`, 20, yPosition);

            yPosition += 6;
            doc.text(`Phone: ${receiptData.buyer.phone}`, 20, yPosition);

            // Pig details
            yPosition += 20;
            doc.setFont(undefined, 'bold');
            doc.text('LIVESTOCK DETAILS:', 20, yPosition);

            yPosition += 10;
            doc.setFont(undefined, 'normal');
            receiptData.pigs.forEach((pig, index) => {
                doc.text(`${index + 1}. Pig ID: ${pig.pigId} (${pig.saleType})`, 25, yPosition);
                yPosition += 6;
                doc.text(`   Breed: ${pig.breed} | Sex: ${pig.sex} | Weight: ${pig.weight.toFixed(1)}kg`, 25, yPosition);
                yPosition += 6;
                doc.text(`   Vaccinations: ${pig.vaccinationRecords.map(v => v.vaccineType).join(', ')}`, 25, yPosition);
                yPosition += 10;
            });

            // Footer
            yPosition += 20;
            doc.text(`Manager: ${receiptData.manager}`, 20, yPosition);
            doc.text(`Owner: ${receiptData.company.ownerName}`, pageWidth - 80, yPosition);

            yPosition += 20;
            doc.text('_________________', 20, yPosition);
            doc.text('_________________', pageWidth - 80, yPosition);

            yPosition += 6;
            doc.text('Manager Signature', 20, yPosition);
            doc.text('Owner Signature', pageWidth - 80, yPosition);

            doc.save(`livestock-sale-receipt-${receiptData.receiptNumber}.pdf`);
            toast.success('Receipt downloaded successfully!');
        } catch (error) {
            toast.error('Error generating PDF. Please try again.');
            console.error('PDF generation error:', error);
        }
    };

    const confirmSale = () => {
        // Here you would update the database to mark pigs as sold
        // Also save receipt details to database
        const receiptRecord = {
            receiptNumber: receiptData.receiptNumber,
            date: receiptData.date,
            buyer: receiptData.buyer,
            manager: receiptData.manager,
            pigIds: receiptData.pigs.map(p => p.pigId),
            totalPigs: receiptData.pigs.length,
            pigletCount: receiptData.pigletCount,
            adultCount: receiptData.adultCount
        };

        // Save to database (mock)
        console.log('Saving receipt to database:', receiptRecord);

        toast.success(`${receiptData.pigs.length} pig(s) marked as sold in database`);

        // Reset form
        setPigletIds(['']);
        setAdultIds(['']);
        setBuyerInfo({ name: '', address: '', phone: '' });
        setManagerName('');
        setShowPreview(false);
        setReceiptData(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                        <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3" />
                        Livestock Sales Management
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        Professional pig sales and receipt generation system
                    </p>
                </div>

                {!showPreview ? (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Sale</h2>

                        {/* Piglet IDs */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Piglet IDs to Sell
                            </label>
                            {pigletIds.map((pigId, index) => (
                                <div key={`piglet-${index}`} className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="text"
                                        value={pigId}
                                        onChange={(e) => updatePigId('piglet', index, e.target.value)}
                                        placeholder="Enter Piglet ID (e.g., PIG101)"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                    {pigletIds.length > 1 && (
                                        <button
                                            onClick={() => removePigIdField('piglet', index)}
                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => addPigIdField('piglet')}
                                className="flex items-center space-x-2 text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors duration-200"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Another Piglet ID</span>
                            </button>
                        </div>

                        {/* Adult Pig IDs */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adult Pig IDs to Sell
                            </label>
                            {adultIds.map((pigId, index) => (
                                <div key={`adult-${index}`} className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="text"
                                        value={pigId}
                                        onChange={(e) => updatePigId('adult', index, e.target.value)}
                                        placeholder="Enter Adult Pig ID (e.g., PIG001)"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                    {adultIds.length > 1 && (
                                        <button
                                            onClick={() => removePigIdField('adult', index)}
                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => addPigIdField('adult')}
                                className="flex items-center space-x-2 text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors duration-200"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Another Adult Pig ID</span>
                            </button>
                        </div>

                        {/* Buyer Information */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Buyer Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Buyer Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={buyerInfo.name}
                                        onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
                                        placeholder="Enter buyer's full name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={buyerInfo.phone}
                                        onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <textarea
                                    value={buyerInfo.address}
                                    onChange={(e) => setBuyerInfo({ ...buyerInfo, address: e.target.value })}
                                    placeholder="Enter complete address"
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>

                        {/* Manager Name */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Manager Name *
                            </label>
                            <input
                                type="text"
                                value={managerName}
                                onChange={(e) => setManagerName(e.target.value)}
                                placeholder="Enter manager's name who is handling this sale"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmit}
                                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <Eye className="h-5 w-5" />
                                <span>Generate Receipt Preview</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Receipt Preview */
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">Receipt Preview</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Back to Edit
                                    </button>
                                    <button
                                        onClick={downloadPDF}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Download PDF</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Receipt Content */}
                        <div className="p-8" id="receipt-content">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-gray-900">{receiptData?.company.name}</h1>
                                <p className="text-gray-600 mt-1">{receiptData?.company.address}</p>
                                <p className="text-gray-600">Phone: {receiptData?.company.phone} | Email: {receiptData?.company.email}</p>
                                <p className="text-gray-600">Registration No: {receiptData?.company.registrationNumber}</p>
                            </div>

                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold text-gray-900 bg-gray-100 py-2 px-4 rounded-lg inline-block">
                                    LIVESTOCK SALE RECEIPT
                                </h2>
                            </div>

                            {/* Receipt Details */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p><strong>Receipt No:</strong> {receiptData?.receiptNumber}</p>
                                    <p><strong>Piglets:</strong> {receiptData?.pigletCount}</p>
                                </div>
                                <div className="text-right">
                                    <p><strong>Date:</strong> {receiptData?.date}</p>
                                    <p><strong>Adults:</strong> {receiptData?.adultCount}</p>
                                </div>
                            </div>

                            {/* Buyer Information */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    BUYER INFORMATION
                                </h3>
                                <p><strong>Name:</strong> {receiptData?.buyer.name}</p>
                                <p><strong>Address:</strong> {receiptData?.buyer.address}</p>
                                <p><strong>Phone:</strong> {receiptData?.buyer.phone}</p>
                            </div>

                            {/* Pig Details */}
                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-4">LIVESTOCK DETAILS:</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-300">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Pig ID</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Breed</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Sex</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Weight (kg)</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Vaccinations</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receiptData?.pigs.map((pig, index) => (
                                                <tr key={index}>
                                                    <td className="border border-gray-300 px-4 py-2">{pig.pigId}</td>
                                                    <td className="border border-gray-300 px-4 py-2 capitalize">{pig.saleType}</td>
                                                    <td className="border border-gray-300 px-4 py-2">{pig.breed}</td>
                                                    <td className="border border-gray-300 px-4 py-2 capitalize">{pig.sex}</td>
                                                    <td className="border border-gray-300 px-4 py-2">{pig.weight.toFixed(1)}</td>
                                                    <td className="border border-gray-300 px-4 py-2">
                                                        {pig.vaccinationRecords.map(v => v.vaccineType).join(', ')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="grid grid-cols-2 gap-8 mt-12">
                                <div>
                                    <p className="mb-8"><strong>Manager:</strong> {receiptData?.manager}</p>
                                    <div className="border-t border-gray-400 pt-2">
                                        <p className="text-center text-sm text-gray-600">Manager Signature</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-8"><strong>Owner:</strong> {receiptData?.company.ownerName}</p>
                                    <div className="border-t border-gray-400 pt-2">
                                        <p className="text-center text-sm text-gray-600">Owner Signature</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2 text-amber-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span className="text-sm">This action will mark the pigs as sold in the database</span>
                                </div>
                                <button
                                    onClick={confirmSale}
                                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <FileText className="h-5 w-5" />
                                    <span>Confirm Sale & Update Database</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PigSales;