import React from 'react';
import { Link } from 'react-router-dom';
import bannerImg from '../assets/baner.png';

const OfferClosed = () => {
    return (
         <div className="min-h-screen bg-transparent py-8 px-[10px] sm:px-6 lg:px-8 font-sans relative z-10 animate-fade-in">
            <div className="max-w-3xl mx-auto space-y-4">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 relative">
                    <div className="w-full">
                        <img src={bannerImg} alt="Banner" className="w-full h-auto object-cover" />
                    </div>

                    <div className="p-10 sm:p-16 text-center">
                        <div className="inline-block p-4 rounded-full bg-[#e0f2fe] mb-8 border border-[#bae6fd]">
                            <svg
      className="w-12 h-12 text-[#0284c7]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tight uppercase">
                            Offer is Currently <span className="text-[#0284c7]">Closed</span>
                        </h1>

                        <div className="w-20 h-1.5 bg-[#0284c7] mx-auto rounded-full mb-8"></div>

                        <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto mb-10 font-medium">
                            Thank you for your interest in Night Vision. The offer period has ended.
                        </p>

                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 mb-10">
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Stay Connected</p>
                            <p className="text-gray-900 font-medium">Please stay tuned for future promotions and product launches.</p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => window.location.href = 'https://www.nightvision.com.au/'}
                                className="px-10 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all transform hover:-translate-y-0.5 active:scale-95 w-full sm:w-auto"
                            >
                                Visit Our Website
                            </button>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 text-center">
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                            Night Vision - Premium Performance Gear
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferClosed;
