import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Loadingpage from './Loadingpage';
import Cookies from 'js-cookie';

const Logout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            Cookies.remove("userToken");
            setLoading(true);
            setTimeout(() => navigate("/signin"), 1500);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (loading) {
      return (
        <div className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] text-white p-6 animate-ultraSmoothFadeIn">
        <div className="max-w-lg mx-auto p-6 bg-[#121212] rounded-lg shadow text-white ">
          <p className="text-lg font-semibold flex  gap-2 items-center content-center ">You're now logged out. Redirecting… 
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                <path d="M2 12a10 10 0 0110-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
          </p>
        </div>
        </div>
            );
    }

    return (
        <section className='min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] text-white p-4 animate-ultraSmoothFadeIn'>
            <div className="w-full max-w-md bg-[#121212] p-8 rounded-xl shadow-lg flex flex-col justify-center content-center items-center gap-5">
                <h2 className='text-4xl'>To confirm logout</h2>
                <p className='text-xl'>Some data may be lost after logging out</p>
                <button
                    className='text-[16px] text-white bg-[#0e898e] p-2 rounded-md hover:bg-red-600 hover:text-white transition-all ease-in duration-300'
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div> 

        </section>
    );
};

export default Logout;