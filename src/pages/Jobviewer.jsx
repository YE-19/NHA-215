import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    addDoc,
    updateDoc, 
    serverTimestamp, 
    query, 
    where, 
    onSnapshot, 
    deleteDoc, 
    doc
} from "firebase/firestore";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyD3KVbnryeDG3ZdrGORbtV4WytdM03djMI",
  authDomain: "nha-215.firebaseapp.com",
  projectId: "nha-215",
  storageBucket: "nha-215.firebasestorage.app",
  messagingSenderId: "496290907011",
  appId: "1:496290907011:web:a9e2347aef6c75ea52ecb6",
};

// --- Initialize Services ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const Jobviewer = () => {

    // --- State Management ---
    const [showForm, setshowForm] = useState(false);
    const [formError, setfomError] = useState({});
    const [loading, setloading] = useState(false);
    
    // Form States
    const [jobTitle, setjobTitle] = useState("");
    const [companyName, setcompanyName] = useState("");
    const [status, setstatus] = useState("");
    
    // Data & User States
    const [successfulJobAddition, setsuccessfulJobAddition] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [user, setUser] = useState(null);
    
    // Action States (Delete & Edit)
    const [jobToDelete, setJobToDelete] = useState(null);
    const [editId, setEditId] = useState(null); // ✅ Stores ID of job being edited

    // --- Fetching Data Logic ---
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            
            if (currentUser) {
                const jobsRef = collection(db, "jobs");
                const q = query(
                    jobsRef, 
                    where("userId", "==", currentUser.uid)
                );

                const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                    const jobsList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    
                    // Sorting: Oldest First
                    const sortedJobs = jobsList.sort((a, b) => {
                         const dateA = a.createdAt?.seconds || 0;
                         const dateB = b.createdAt?.seconds || 0;
                         return dateA - dateB;
                    });

                    setJobs(sortedJobs);
                });

                return () => unsubscribeSnapshot();
            } else {
                setJobs([]);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // --- Helper Functions ---
    const closeModal = () => {
        setshowForm(false);
        setjobTitle("");
        setcompanyName("");
        setstatus("");
        setfomError({});
        setEditId(null); 
    }

    // --- Edit Logic ---
    const openEditModal = (job) => {
        setEditId(job.id);             // Set the ID we are editing
        setjobTitle(job.jobTitle);     // Fill inputs with existing data
        setcompanyName(job.companyName);
        setstatus(job.status);
        setshowForm(true);             // Open the modal
    }

    // --- Delete Logic ---
    const promptDelete = (id) => {
        setJobToDelete(id);
    }

    const confirmDelete = async () => {
        if (!jobToDelete) return;
        try {
            const jobDoc = doc(db, "jobs", jobToDelete);
            await deleteDoc(jobDoc);
            setJobToDelete(null); 
        } catch (error) {
            console.error("Error deleting job:", error);
            alert("Failed to delete job.");
        }
    }

    const cancelDelete = () => {
        setJobToDelete(null); 
    }

    // --- Submit Logic (Add & Edit) ---
    const handlesub = async (e) => {
        e.preventDefault();
    
        // 1. Validation
        const errors = {};
        if (!jobTitle.trim()) errors.jobTitle = "Job title is required";
        if (!companyName.trim()) errors.companyName = "Company name is required";
        if (!status) errors.status = "Status is required";

        if (Object.keys(errors).length > 0) {
            setfomError(errors);
            return;
        }
        setfomError({});
        setloading(true);

        try {
            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in!");
                setloading(false);
                return;
            }

            // 2. Determine Action (Update vs Add)
            if (editId) {
                // ✅ Update Logic
                const jobDoc = doc(db, "jobs", editId);
                await updateDoc(jobDoc, {
                    jobTitle,
                    companyName,
                    status,
                    // Note: We typically don't update 'createdAt'
                });
                console.log("Document updated successfully");
            } else {
                // ✅ Add Logic
                const jobData = {
                    userId: user.uid,
                    jobTitle,
                    companyName,
                    status,
                    createdAt: serverTimestamp()
                };
                await addDoc(collection(db, "jobs"), jobData);
                console.log("Document added successfully");
            }
            
            // 3. Success Handling
            closeModal();   
            setsuccessfulJobAddition(true); 

        } catch (error) {
            console.error("Error saving document: ", error);
            alert("Error: " + error.message);
        } finally {
            setloading(false);
        }
    }

    // --- Success Screen Component ---
    if (successfulJobAddition === true) {
        setTimeout(() => {
            setsuccessfulJobAddition(false);
        }, 1000);
        return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] text-white p-4 animate-ultraSmoothFadeIn z-10">
            <div className="max-w-md mx-auto p-6 bg-[#121212] rounded-lg shadow text-white flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4 text-green-400">
                    {editId ? "Updated Successfully!" : "Added Successfully!"}
                </h2>
                <div className="flex items-center gap-2 text-gray-300">
                    Redirecting
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                        <path d="M2 12a10 10 0 0110-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        </div>
        )
    }

  return ( <>
    <section className='min-h-[calc(100vh-72px)] p-8 md:p-16 bg-pri flex flex-col gap-6 relative'>
        
        {/* --- Delete Confirmation Modal --- */}
        {jobToDelete && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fadeIn">
                <div 
                onClick={(e) => e.stopPropagation()} 
                className='w-full max-w-sm bg-[#121212] p-6 rounded-xl shadow-2xl border border-red-900/30 flex flex-col gap-4 text-white relative text-center'
                >
                    <div className="mx-auto bg-red-900/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                        <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500"></i>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white">Delete Application?</h3>
                    <p className="text-gray-400 text-sm">
                    This action cannot be undone.
                    </p>

                    <div className="flex gap-3 mt-4">
                        <button onClick={cancelDelete} className="flex-1 py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors">Cancel</button>
                        <button onClick={confirmDelete} className="flex-1 py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-900/20 transition-colors">Delete</button>
                    </div>
                </div>
                <div className="fixed inset-0 z-[-1]" onClick={cancelDelete}></div>
            </div>
        )}

        {/* --- Main Form Modal (Add & Edit) --- */}
        {showForm === true && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                <form 
                onSubmit={handlesub}
                onClick={(e) => e.stopPropagation()} 
                className='w-full max-w-md bg-[#121212] p-8 rounded-xl shadow-2xl flex flex-col gap-4 text-white relative border border-gray-800'
                >
                    {/* Dynamic Title */}
                    <h3 className="text-3xl font-bold text-[#20bec4ff] mb-2">
                        {editId ? "Update Job" : "New Application"}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                        {editId ? "Update existing application details." : "Track a new job opportunity."}
                    </p>
                    
                    <button 
                    type="button" 
                    className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors'
                    onClick={closeModal}
                    >
                        <i className="fa-solid fa-xmark text-xl"></i> 
                    </button>

                    <div className='flex flex-col gap-3'>
                        {/* Job Title */}
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="jobTitle" className='text-sm pl-1 font-medium text-gray-300'>Job Title</label>
                            <input
                            className={`mt-1 block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200
                            ${formError.jobTitle ? 'border-red-500 focus:ring-red-500' : 'border-gray-500 focus:ring-[#0E898E]'}`}
                            type="text"
                            placeholder='e.g. Frontend Developer'
                            value={jobTitle}
                            onChange={(e) => {
                                setjobTitle(e.target.value);
                                if (formError.jobTitle) setfomError({...formError, jobTitle: null});
                            }}
                            />
                            {formError.jobTitle && <span className="text-red-500 text-xs pl-1">{formError.jobTitle}</span>}
                        </div>

                        {/* Company Name */}
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="companyName" className='text-sm pl-1 font-medium text-gray-300'>Company Name</label>
                            <input
                            className={`mt-1 block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200
                            ${formError.companyName ? 'border-red-500 focus:ring-red-500' : 'border-gray-500 focus:ring-[#0E898E]'}`}
                            type="text"
                            placeholder='e.g. Google'
                            value={companyName}
                            onChange={(e) => {
                                setcompanyName(e.target.value);
                                if (formError.companyName) setfomError({...formError, companyName: null});
                            }}
                            />
                            {formError.companyName && <span className="text-red-500 text-xs pl-1">{formError.companyName}</span>}
                        </div>

                        {/* Status */}
                        <div className='flex flex-col gap-1'>
                            <label htmlFor="status" className='text-sm pl-1 font-medium text-gray-300'>Status</label>
                            <select
                            className={`mt-1 block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200
                            ${formError.status ? 'border-red-500 focus:ring-red-500' : 'border-gray-500 focus:ring-[#0E898E]'}`}
                            value={status}
                            onChange={(e) => {
                                setstatus(e.target.value);
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
                    
                    {/* Dynamic Submit Button */}
                    <button
                        type="submit"
                        disabled={loading} 
                        className={`w-full inline-flex justify-center items-center gap-2 rounded-md px-2 py-3 mt-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 bg-[#275053ff] hover:bg-[#0E898E] text-white shadow-md hover:shadow-green-500/40 transition duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {loading ? 'Saving...' : (editId ? 'Update Application' : 'Add Application')} 
                    </button>
                </form>
                <div className="fixed inset-0 z-[-1]" onClick={closeModal}></div>
            </div>
        )}

        {/* --- Header Section --- */}
        <div className='flex items-center justify-between border-b-[2px] border-[#0e898e] pb-6'>
            <h2 className='text-white text-[24px] md:text-[30px] font-bold tracking-wide'>
                <span className="text-[#0e898e]">|</span> Your Applications
            </h2>
            <button 
                className='text-[16px] md:text-[18px] font-medium text-white bg-[#0e898e] px-6 py-2 rounded-full hover:bg-[#172627] hover:text-[#0e898e] border border-transparent hover:border-[#0e898e] transition-all duration-300 shadow-lg hover:shadow-[#0e898e]/20'
                onClick={() => {setshowForm(true)}}
            >
                + Add Job
            </button>
        </div>

        {/* --- Jobs Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.length > 0 ? (
                jobs.map((job) => (
                    <div 
                        key={job.id} 
                        className="bg-[#121212] p-6 rounded-xl border border-gray-800 hover:border-[#0e898e] transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-[#0e898e] transition-colors">
                                    {job.jobTitle}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                                    <i className="fa-regular fa-building"></i>
                                    {job.companyName}
                                </p>
                            </div>
                            
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                                ${job.status === 'Accepted' || job.status === 'Offered' ? 'bg-green-900/50 text-green-400 border border-green-800' : 
                                  job.status === 'Rejected' ? 'bg-red-900/50 text-red-400 border border-red-800' : 
                                  job.status === 'Interviewing' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
                                  'bg-blue-900/50 text-blue-400 border border-blue-800'}`}>
                                {job.status}
                            </span>
                        </div>
                        
                        <div className='pt-4 mt-2 border-t border-gray-800 flex justify-between'>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <i className="fa-regular fa-clock"></i>
                                    {job.createdAt?.seconds 
                                        ? new Date(job.createdAt.seconds * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                        : 'Just now'}
                                </span>
                            </div>
                            <div className="flex  items-center text-xs gap-1 text-gray-500">
                                {/* ✅ Edit Button */}
                                <button 
                                className='hover:text-gray-200 text-gray-600 inline-block transition-all ease-in duration-300'
                                onClick={() => openEditModal(job)}
                                title="Edit Application"
                                >
                                    <i className="fa-solid fa-gear"></i>
                                </button>
                                {/* ✅ Delete Button */}
                                <button 
                                className='hover:text-red-500 text-gray-600 inline-block transition-all ease-in duration-300'
                                onClick={() => promptDelete(job.id)} 
                                title="Delete Application"
                                >
                                    <i className="fa-solid fa-trash-can "></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                // --- Empty State ---
                <div className="col-span-full h-[520px] flex flex-col items-center justify-center py-20 text-gray-500 border-[2px] border-solid border-gray-800 rounded-xl">
                    <i className="fa-solid fa-folder-open text-4xl mb-4 text-gray-700"></i>
                    <p className="text-lg">No applications found.</p>
                    <p className="text-sm">Click "Add Job" to start tracking.</p>
                </div>
            )}
        </div>

    </section>
  </>
  )
}

export default Jobviewer