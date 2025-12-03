import React, { useState } from 'react';
// 1. استيراد مكتبات الفايربيز
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyD3KVbnryeDG3ZdrGORbtV4WytdM03djMI",
  authDomain: "nha-215.firebaseapp.com",
  projectId: "nha-215",
  storageBucket: "nha-215.firebasestorage.app",
  messagingSenderId: "496290907011",
  appId: "1:496290907011:web:a9e2347aef6c75ea52ecb6",
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const Jobviewer = () => {

    const [showForm, setshowForm] = useState(false);
    const [formError, setfomError] = useState({})
    const [loading, setloading] = useState(false);
    const [jobTitle, setjobTitle] = useState("");
    const [companyName, setcompanyName] = useState("");
    const [status, setstatus] = useState("");
    const [successfulJobAddition, setsuccessfulJobAddition] = useState(false);

    const closeModal = () => {
        setshowForm(false);
        setjobTitle("");
        setcompanyName("");
        setstatus("");
        setfomError({});
    }

    const handlesub = async (e) => {
        e.preventDefault();
    
        // --- Validation ---
        const errors = {};
        if (!jobTitle.trim()) errors.jobTitle = "Job title is required";
        if (!companyName.trim()) errors.companyName = "Company name is required";
        if (!status) errors.status = "Status is required";

        if (Object.keys(errors).length > 0) {
            setfomError(errors);
            return;
        }
        setfomError({});

        // --- Firebase Logic Starts Here ---
        setloading(true);

        try {
            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in to add a job! (Please implement Login first)");
                setloading(false);
                return;
            }

            const jobData = {
                userId: user.uid,
                jobTitle: jobTitle,
                companyName: companyName,
                status: status,
                createdAt: serverTimestamp() 
            };

            await addDoc(collection(db, "jobs"), jobData);
            console.log("Document written successfully");
            closeModal();   
            setsuccessfulJobAddition(true);

        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error adding job: " + error.message);
        } finally {
            setloading(false);
        }
    }

    if (successfulJobAddition === true) {
        setTimeout(() => {
            setsuccessfulJobAddition(false);
        }, 2000);
        return (
        <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] text-white p-6 animate-ultraSmoothFadeIn">
            <div className="max-w-md mx-auto p-6 bg-[#121212] rounded-lg shadow text-white">
                <h2 className="text-xl font-semibold mb-4 text-green-400">Successful adding of a job application</h2>
                <p className="text-gray-300 flex items-center content-center gap-1">Redirecting… 
                    <span>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                            <path d="M2 12a10 10 0 0110-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </span>
                </p>
            </div>
        </div>
        )
    }

  return ( <>
    <section className='min-h-[calc(100vh-72px)] p-16 bg-pri flex flex-col gap-3'>
        {showForm === true && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                <form 
                onSubmit={handlesub}
                onClick={(e) => e.stopPropagation()} 
                className='w-full max-w-md bg-[#121212] p-8 rounded-xl shadow-2xl flex flex-col gap-4 text-white relative'
                >
                    <h3 className="text-3xl font-bold text-[#20bec4ff] mb-2">Job applications</h3>
                    <p className="text-sm text-gray-400 mb-4">Enter your Job applications information</p>
                    <button 
                    type="button" 
                    className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors'
                    onClick={closeModal}
                    >
                        <i className="fa-solid fa-xmark text-xl"></i> 
                    </button>
                    <div className='flex flex-col gap-3'>
                        {/* Job Title Input Block */}
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="jobTitle" className='text-sm pl-1 font-medium text-gray-300'>Job title</label>
                            <input
                            className={`mt-1 block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200
                            ${formError.jobTitle ? 'border-red-500 focus:ring-red-500' : 'border-gray-500 focus:ring-[#0E898E]'}`}
                            id='jobTitle' 
                            type="text"
                            name='jobTitle'
                            placeholder='Enter the job title'
                            value={jobTitle}
                            onChange={(e) => {
                            setjobTitle(e.target.value);
                            if (formError.jobTitle) setfomError({...formError, jobTitle: null});}}
                            />
                            {formError.jobTitle && <span className="text-red-500 text-xs pl-1">{formError.jobTitle}</span>}
                        </div>

                        {/* Company Name Input Block */}
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="companyName" className='text-sm pl-1 font-medium text-gray-300'>Company name</label>
                            <input
                            className={`mt-1 block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200
                            ${formError.companyName ? 'border-red-500 focus:ring-red-500' : 'border-gray-500 focus:ring-[#0E898E]'}`}
                            id='companyName' 
                            type="text"
                            name='companyName'
                            placeholder='Enter the Company name'
                            value={companyName}
                            onChange={(e) => {setcompanyName(e.target.value);
                            if (formError.companyName) setfomError({...formError, companyName: null});
                            }}
                            />
                            {formError.companyName && <span className="text-red-500 text-xs pl-1">{formError.companyName}</span>}
                        </div>

                        {/* Status Select Block */}
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="status" className='text-sm pl-1 font-medium text-gray-300'>Status</label>
                            <select
                            className={`mt-1 block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200
                            ${formError.status ? 'border-red-500 focus:ring-red-500' : 'border-gray-500 focus:ring-[#0E898E]'}`}
                            id='status' 
                            name='status'
                            value={status}
                            onChange={(e) => {setstatus(e.target.value);
                            if (formError.status) setfomError({...formError, status: null});
                        }}
                        >
                            <option value="" disabled>Select status</option>
                            <option value="Applied">Applied</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Offered">Offered</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Accepted">Accepted</option>
                        </select>
                        {formError.status && <span className="text-red-500 text-xs pl-1">{formError.status}</span>}
                        </div>
                    </div>
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading} 
                        className={`w-full inline-flex justify-center items-center gap-2 rounded-md px-2 py-3 mt-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 bg-[#275053ff] hover:bg-[#0E898E] text-white shadow-md hover:shadow-green-500/40 transition duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        aria-busy={loading}
                    >
                        {loading ? (
                            <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {loading ? 'Saving...' : 'Add Application'} 
                    </button>
                </form>
                
                <div className="fixed inset-0 z-[-1]" onClick={closeModal}></div>
            </div>
        )}
        {/* Main Content */}
        <div className='flex items-center content-center gap-3'>
            <h2 className='text-white text-[30px]'>| Your job applications</h2>
            <button 
                className='text-[20px] text-white bg-[#0e898e] p-3 rounded-3xl hover:scale-110 hover:bg-[#172627] hover:text-[#0e898e] transition-all ease-in duration-300'
                onClick={() => {setshowForm(true)}}
            >
                Add job
            </button>
            <div></div>
        </div>
    </section>
  </>
  )
}

export default Jobviewer