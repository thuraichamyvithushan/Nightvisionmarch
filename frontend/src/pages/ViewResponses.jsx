import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const ViewResponses = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        shop: '',
        employee: ''
    });

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    const [requestToDelete, setRequestToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [user, filters.status]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = await user.getIdToken();
            const queryParams = new URLSearchParams();
            if (filters.shop) queryParams.append('shop', filters.shop);
            if (filters.employee) queryParams.append('employee', filters.employee);

            const response = await fetch(
                `${API_BASE_URL}/api/admin/purchase-requests?${queryParams}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const data = await response.json();
            if (response.ok) {
                setRequests(data);
            } else {
                setError(data.error || 'Failed to fetch requests');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const token = await user.getIdToken();
            const response = await fetch(
                `${API_BASE_URL}/api/admin/purchase-requests/${selectedRequest.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(editData)
                }
            );

            if (response.ok) {
                setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, ...editData } : r));
                setSelectedRequest({ ...selectedRequest, ...editData });
                setIsEditing(false);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update request');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        if (!requestToDelete) return;
        setIsDeleting(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(
                `${API_BASE_URL}/api/admin/purchase-requests/${requestToDelete}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                setRequests(requests.filter(r => r.id !== requestToDelete));
                setIsDeleteModalOpen(false);
                setRequestToDelete(null);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to delete request');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        fetchRequests();
    };

    const clearFilters = () => {
        setFilters({ shop: '', employee: '' });
        setTimeout(() => fetchRequests(), 0);
    };


    const renderModalField = (label, value, fieldName) => (
        <div className="py-4 border-b border-gray-50 last:border-0 flex flex-col sm:flex-row sm:items-start justify-between group gap-2">
            <span className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] sm:w-1/3 flex-shrink-0 pt-1">{label}</span>
            {isEditing && fieldName ? (
                <input
                    type="text"
                    value={editData[fieldName] || ''}
                    onChange={(e) => setEditData({ ...editData, [fieldName]: e.target.value })}
                    className="flex-grow bg-gray-50 border-b border-red-600 focus:outline-none py-1 px-2 font-bold text-sm text-gray-900 rounded"
                />
            ) : (
                <span className="text-gray-900 font-bold text-sm sm:text-right leading-relaxed break-words flex-grow">{value || '---'}</span>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in relative z-10 py-6 px-[10px] sm:px-6 lg:px-8">
            <header className="text-center sm:text-left">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-2">View Responses</h1>
                <p className="text-gray-600 text-lg font-medium">Track and manage all Huntsman Form submissions</p>
            </header>

            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150"></div>

                <h2 className="text-xl font-black text-gray-900 mb-8 tracking-tight flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Shop Name</label>
                        <input
                            type="text"
                            name="shop"
                            value={filters.shop}
                            onChange={handleFilterChange}
                            placeholder="e.g. JB Hi-Fi"
                            className="w-full bg-gray-50/50 border-b-2 border-gray-200 focus:border-red-600 focus:outline-none py-3 px-1 transition-all duration-300 font-bold text-gray-900 placeholder-gray-400 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Employee Name</label>
                        <input
                            type="text"
                            name="employee"
                            value={filters.employee}
                            onChange={handleFilterChange}
                            placeholder="e.g. John Doe"
                            className="w-full bg-gray-50/50 border-b-2 border-gray-200 focus:border-red-600 focus:outline-none py-3 px-1 transition-all duration-300 font-bold text-gray-900 placeholder-gray-400 rounded-lg"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                    <button
                        onClick={applyFilters}
                        className="flex-1 py-4 px-8 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
                        style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Apply Filters</span>
                    </button>
                    <button
                        onClick={clearFilters}
                        className="py-4 px-8 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 hover:text-gray-900 transition-all duration-300 shadow-sm"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-lg animate-slide-in">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700 font-bold uppercase tracking-tight">{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden relative">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 shadow-inner"></div>
                        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Fetching Data...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Name</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Phone</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Email</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Shop</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Serial</th>
                                    <th className="px-8 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Receipt</th>
                                    <th className="px-8 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Box Photo</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Raffle</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Experience</th>
                                    <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                    <th className="px-8 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-20 h-20 text-gray-100 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No requests found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((request) => (
                                        <tr key={request.id} className="hover:bg-red-50/30 transition-colors duration-200 group">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 mr-3">
                                                        {request.employeeName?.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{request.employeeName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-700">{request.phoneNumber}</span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-600 truncate max-w-[150px]" title={request.publicEmail}>
                                                    {request.publicEmail}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-900">{request.shopName}</span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className="text-sm font-bold text-red-700 bg-red-50 px-3 py-1 rounded-lg">{request.serialNumber}</span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-center">
                                                {request.receiptUrl ? (
                                                    <div className="flex justify-center">
                                                        <img
                                                            src={request.receiptUrl}
                                                            alt="Receipt"
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(request.receiptUrl, '_blank');
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-[10px] font-black uppercase">None</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-center">
                                                {request.boxPhotoUrl ? (
                                                    <div className="flex justify-center">
                                                        <img
                                                            src={request.boxPhotoUrl}
                                                            alt="Box Photo"
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(request.boxPhotoUrl, '_blank');
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-[10px] font-black uppercase">None</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${request.marketingInterest === 'Yes' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                                                    {request.marketingInterest}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-medium text-gray-600 line-clamp-2 max-w-[200px]" title={request.experience}>
                                                    {request.experience || '---'}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-500">
                                                {new Date(request.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedRequest(request); setIsViewModalOpen(true); }}
                                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-200"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => { setRequestToDelete(request.id); setIsDeleteModalOpen(true); }}
                                                        className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-500 text-xs font-black rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && (
                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                            Total Requests: {requests.length}
                        </span>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Sync Alpha</span>
                        </div>
                    </div>
                )}
            </div>

            {isViewModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative animate-slide-up">
                        <div className="p-10 sm:p-14">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{isEditing ? 'Edit Request' : 'Request Details'}</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{isEditing ? 'Update rebate and FOB details' : 'Full Submission Summary'}</p>
                                </div>
                                <button
                                    onClick={() => { setIsViewModalOpen(false); setIsEditing(false); }}
                                    className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                                    <div className="space-y-0">
                                        {renderModalField('Shop Name', selectedRequest.shopName)}
                                        {renderModalField('Name', selectedRequest.employeeName)}
                                        {renderModalField('Phone Number', selectedRequest.phoneNumber)}
                                        {renderModalField('Email', selectedRequest.publicEmail)}
                                        {renderModalField('Marketing Interest', selectedRequest.marketingInterest)}
                                        {selectedRequest.experience && renderModalField('Experience', selectedRequest.experience)}
                                    </div>
                                    <div className="space-y-0">
                                        {renderModalField('Serial Number', selectedRequest.serialNumber, 'serialNumber')}
                                        {renderModalField('Created At', new Date(selectedRequest.createdAt).toLocaleString())}
                                        {renderModalField('Last Updated', new Date(selectedRequest.updatedAt).toLocaleString())}
                                    </div>
                                </div>
                                {selectedRequest.receiptUrl && (
                                    <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                        <span className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] block mb-4">Receipt</span>
                                        <div className="relative group">
                                            <img
                                                src={selectedRequest.receiptUrl}
                                                alt="Receipt"
                                                className="w-full max-w-2xl h-auto rounded-2xl shadow-lg border border-white cursor-pointer hover:scale-[1.01] transition-transform duration-500"
                                                onClick={() => window.open(selectedRequest.receiptUrl, '_blank')}
                                            />
                                        </div>
                                    </div>
                                )}
                                {selectedRequest.boxPhotoUrl && (
                                    <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                        <span className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] block mb-4">Box Photo</span>
                                        <div className="relative group">
                                            <img
                                                src={selectedRequest.boxPhotoUrl}
                                                alt="Box Photo"
                                                className="w-full max-w-2xl h-auto rounded-2xl shadow-lg border border-white cursor-pointer hover:scale-[1.01] transition-transform duration-500"
                                                onClick={() => window.open(selectedRequest.boxPhotoUrl, '_blank')}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end space-x-4">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all duration-300 transform active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all duration-300 transform active:scale-95 shadow-lg"
                                        >
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 transform active:scale-95 shadow-lg"
                                        >
                                            Edit Details
                                        </button>
                                        <button
                                            onClick={() => setIsViewModalOpen(false)}
                                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-300 transform active:scale-95 shadow-lg"
                                        >
                                            Close
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Delete Request?</h3>
                            <p className="text-gray-500 text-sm mb-8 font-medium">This action cannot be undone. Are you sure you want to remove this record?</p>
                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className={`py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform active:scale-95 ${isDeleting ? 'opacity-70' : ''}`}
                                >
                                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewResponses;
