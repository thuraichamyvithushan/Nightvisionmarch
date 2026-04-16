import React from 'react';
import { Link } from 'react-router-dom';
import bannerImg from '../assets/baner.png';

const OfferClosed = () => {
    return (
        <div className="min-h-screen bg-transparent py-8 px-[10px] sm:px-6 lg:px-8 font-sans relative z-10 flex items-center justify-center">
            <div className="max-w-3xl w-full space-y-4">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 relative">
                    <div className="w-full">
                        <img src={bannerImg} alt="Banner" className="w-full h-auto object-cover" />
                    </div>

                    <div className="p-8 sm:p-12 text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Offer is Currently Closed
                        </h1>

                        <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
                            Thank you for your interest in Night Vision. The offer period has ended.
                        </p>

                        <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col items-center justify-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-800">Stay Connected</h2>
                            <p className="text-base text-gray-600 text-center">
                                Please stay tuned for future promotions and product launches.
                            </p>
                            <a
                                href="https://nightvision.com.au"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Visit Our Website
                            </a>
                            <p className="text-sm font-semibold text-gray-500 mt-2">
                                Night Vision - Premium Performance Gear
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferClosed;
