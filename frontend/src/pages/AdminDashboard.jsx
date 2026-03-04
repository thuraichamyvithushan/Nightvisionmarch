import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';



const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
            <header className="text-center sm:text-left">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
                <p className="text-gray-600 text-lg font-medium">Huntsman Form System - Australia</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div
                    onClick={() => navigate('/dashboard/responses')}
                    className="bg-white/95 backdrop-blur-lg p-10 rounded-[2.5rem] shadow-2xl border border-white/20 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_60px_rgba(220,38,38,0.15)] flex flex-col items-center justify-center text-center group relative overflow-hidden"
                >
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/5 rounded-full -ml-16 -mb-16 transition-transform duration-500 group-hover:scale-150"></div>
                    <div className="p-5 rounded-3xl mb-6 shadow-xl transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">View Responses</h2>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-sm">View and manage all submitted purchase request forms.</p>
                </div>

                <div
                    onClick={() => navigate('/dashboard/admins')}
                    className="bg-white/95 backdrop-blur-lg p-10 rounded-[2.5rem] shadow-2xl border border-white/20 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_60px_rgba(220,38,38,0.15)] flex flex-col items-center justify-center text-center group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-500/5 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150"></div>
                    <div className="p-5 rounded-3xl mb-6 shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Manage Admins</h2>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-sm">Control access, approve new users, and manage staff roles.</p>
                </div>
            </div>
        </div >
    );
};

export default AdminDashboard;
