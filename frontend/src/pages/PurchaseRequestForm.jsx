import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import bannerImg from '../assets/baner.png';

const PurchaseRequestForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/products`);
                const data = await response.json();
                if (response.ok) {
                    setProducts(data.map(p => p.name));
                }
            } catch (err) {
                console.error("Failed to load products", err);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();

        if (user) {
            setFormData(prev => ({
                ...prev,
                publicEmail: user.email || '',
                employeeName: user.displayName || user.name || ''
            }));
        }
    }, [user]);

    const [formData, setFormData] = useState({
        employeeName: '',
        phoneNumber: '',
        publicEmail: '',
        serialNumber: '',
        shopName: '',
        experience: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [boxPhotoFile, setBoxPhotoFile] = useState(null);
    const [boxPhotoPreview, setBoxPhotoPreview] = useState(null);

    const handleReceiptChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setReceiptPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleBoxPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBoxPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setBoxPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const isPublic = !user;
            const endpoint = isPublic
                ? `${API_BASE_URL}/api/public/purchase-requests`
                : `${API_BASE_URL}/api/admin/purchase-requests`;

            const formDataToSubmit = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSubmit.append(key, formData[key]);
            });

            if (receiptFile) {
                formDataToSubmit.append('receipt', receiptFile);
            }
            if (boxPhotoFile) {
                formDataToSubmit.append('boxPhoto', boxPhotoFile);
            }

            const headers = {};
            if (!isPublic) {
                const token = await user.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: formDataToSubmit
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit request');
            }

            setSuccess('Receipt submitted successfully! You are now eligible for the FREE Hikmicro M15 Trail Camera.');
            setFormData({
                employeeName: '',
                phoneNumber: '',
                publicEmail: '',
                serialNumber: '',
                shopName: '',
                experience: ''
            });
            setReceiptFile(null);
            setReceiptPreview(null);
            setBoxPhotoFile(null);
            setBoxPhotoPreview(null);

            window.scrollTo(0, 0);

        } catch (err) {
            setError(err.message);
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent py-8 px-[10px] sm:px-6 lg:px-8 font-sans relative z-10">
            <div className="max-w-3xl mx-auto space-y-4">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 relative">
                    <div className="w-full">
                        <img src={bannerImg} alt="Banner" className="w-full h-auto object-cover" />
                    </div>

                    <div className="p-6 sm:p-10">
                        <h1 className="text-3xl sm:text-4xl font-normal text-gray-900 mb-4">Receipt Submission</h1>
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                            Fill this form and submit your receipt to get a FREE Hikmicro M15 Trail Camera
                        </p>
                        <p className="text-xs text-gray-500 italic">
                            The name, email, and photo associated with your Google account will be recorded when you upload files and submit this form
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-8 border-red-600 animate-slide-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-8 border-green-600 animate-slide-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-green-700 font-medium">{success}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="employeeName"
                            required
                            value={formData.employeeName}
                            onChange={handleChange}
                            className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your answer"
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Phone Number <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            required
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your answer"
                        />
                    </div>

                    {/* Email Address */}
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Email Address <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="email"
                            name="publicEmail"
                            required
                            value={formData.publicEmail}
                            onChange={handleChange}
                            className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your answer"
                        />
                    </div>

                    {/* Receipt Upload */}
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-2">
                            Upload the receipt of your purchase <span className="text-red-600">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-6">Upload 1 supported file: PDF or image. Max 10 MB.</p>
                        <div className="flex flex-col items-start gap-4">
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                required
                                onChange={handleReceiptChange}
                                className="block w-full text-sm text-gray-500
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-full file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-red-50 file:text-red-700
                                          hover:file:bg-red-100
                                          transition-all duration-300"
                            />
                            {receiptPreview && (
                                <div className="relative mt-4 group">
                                    <img
                                        src={receiptPreview}
                                        alt="Receipt Preview"
                                        className="w-full max-w-md h-auto rounded-lg shadow-md border border-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Serial Number */}
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Enter the serial number of the product you purchased <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="serialNumber"
                            required
                            value={formData.serialNumber}
                            onChange={handleChange}
                            className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your answer"
                        />
                    </div>

                    {/* Box Photo Upload */}
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-2">
                            Upload the photo of the box, which includes the serial number <span className="text-red-600">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-6">Upload 1 supported file: PDF, document, or image. Max 10 MB.</p>
                        <div className="flex flex-col items-start gap-4">
                            <input
                                type="file"
                                accept="image/*,application/pdf,.doc,.docx"
                                required
                                onChange={handleBoxPhotoChange}
                                className="block w-full text-sm text-gray-500
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-full file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-red-50 file:text-red-700
                                          hover:file:bg-red-100
                                          transition-all duration-300"
                            />
                            {boxPhotoPreview && (
                                <div className="relative mt-4 group">
                                    <img
                                        src={boxPhotoPreview}
                                        alt="Box Photo Preview"
                                        className="w-full max-w-md h-auto rounded-lg shadow-md border border-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setBoxPhotoFile(null); setBoxPhotoPreview(null); }}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shop Name */}
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-6">
                            Shop Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="shopName"
                            required
                            value={formData.shopName}
                            onChange={handleChange}
                            className="w-full sm:w-2/3 border-b border-gray-300 focus:border-red-600 focus:outline-none py-2 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your answer"
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 group focus-within:shadow-md transition-shadow">
                        <label className="block text-base font-medium text-gray-900 mb-4">
                            Tell us your best Hikmicro experience (150 words minimum) <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            name="experience"
                            required
                            value={formData.experience}
                            onChange={handleChange}
                            rows="6"
                            className="w-full border border-gray-300 rounded-xl focus:border-red-600 focus:outline-none p-4 transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-400 group-focus-within:border-red-600"
                            placeholder="Your answer"
                        ></textarea>
                    </div>

                    <div className="flex items-center justify-between py-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-10 py-3 text-white font-bold rounded-xl shadow-md transition-all duration-300 transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-lg'}`}
                            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}
                        >
                            {loading ? 'Sending...' : 'Submit'}
                        </button>
                        <div className="hidden sm:block text-[10px] text-gray-400 uppercase tracking-widest font-black">
                            Night Vision Secure Form
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseRequestForm;
