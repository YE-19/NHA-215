import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'


const ProtectedRoute = ({ children }) => {
    
    const navigate = useNavigate("");
    const token = localStorage.getItem("userToken");

    if (!token) {
        setTimeout(() => {
            navigate("/signin")
        }, 1500)
        return (
        <div className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] text-white p-4 animate-ultraSmoothFadeIn">
            <div className="max-w-md mx-auto p-6 bg-[#121212] rounded-lg shadow text-white">
                <h2 className="text-xl font-semibold mb-4 text-green-400">You must log in first to use this page.</h2>
                <div className='flex items-center content-center gap-2 text-[16px]'>
                    <p className="text-gray-300">Redirecting…</p>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                        <path d="M2 12a10 10 0 0110-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        </div>
        )
    }

    return (children)
}

export default ProtectedRoute