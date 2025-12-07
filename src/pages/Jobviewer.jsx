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
import Loadingpage from "./Loadingpage";


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
    const [formError, setfomError] = useState({});
    const [loading, setloading] = useState(false);

    const [jobTitle, setjobTitle] = useState("");
    const [companyName, setcompanyName] = useState("");
    const [status, setstatus] = useState("");

    const [successfulJobAddition, setsuccessfulJobAddition] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [user, setUser] = useState(null);

    const [jobToDelete, setJobToDelete] = useState(null);
    const [editId, setEditId] = useState(null);


    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                const jobsRef = collection(db, "jobs");
                const q = query(jobsRef, where("userId", "==", currentUser.uid));

                const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                    const jobsList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

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


    const closeModal = () => {
        setshowForm(false);
        setjobTitle("");
        setcompanyName("");
        setstatus("");
        setfomError({});
        setEditId(null);
    };

    const openEditModal = (job) => {
        setEditId(job.id);
        setjobTitle(job.jobTitle);
        setcompanyName(job.companyName);
        setstatus(job.status);
        setshowForm(true);
    };

    const promptDelete = (id) => {
        setJobToDelete(id);
    };

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
    };

    const cancelDelete = () => {
        setJobToDelete(null);
    };

    const handlesub = async (e) => {
        e.preventDefault();

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

            if (editId) {
                const jobDoc = doc(db, "jobs", editId);
                await updateDoc(jobDoc, {
                    jobTitle,
                    companyName,
                    status,
                });
                console.log("Document updated successfully");
            } else {
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

            closeModal();
            setsuccessfulJobAddition(true);

        } catch (error) {
            console.error("Error saving document: ", error);
            alert("Error: " + error.message);
        } finally {
            setloading(false);
        }
    };

    if (successfulJobAddition === true) {
        setTimeout(() => {
            setsuccessfulJobAddition(false);
        }, 1000);
        return (
            <div className="absolute inset-0 flex items-center bg-gradient-to-br from-[#071414] to-[#052a2a] text-white p-4 animate-ultraSmoothFadeIn z-10">
                <div className="max-w-md mx-auto p-6 bg-[#0f1414] rounded-xl shadow-lg text-white flex flex-col  border border-[#123d3d]">
                    <h2 className="text-xl font-semibold mb-4 text-green-400">
                        {editId ? "Updated Successfully!" : "Added Successfully!"}
                    </h2>
                    <div className="flex gap-2 text-gray-300 items-center content-center">
                        Redirecting
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                            <path d="M2 12a10 10 0 0110-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <>
            <section className="min-h-screen p-8 md:p-16 bg-gradient-to-br from-[#071213] to-[#062f2f] flex flex-col gap-8 relative pt-36">
                {/* Delete Modal */}
                {jobToDelete && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-gradient-to-b from-[#0f1414] to-[#071215] p-6 rounded-xl shadow-2xl border border-red-900/30 flex flex-col gap-4 text-white relative text-center"
                        >
                            <div className="mx-auto bg-red-900/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                                <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500"></i>
                            </div>

                            <h3 className="text-2xl font-bold text-white">Delete Application?</h3>
                            <p className="text-gray-400 text-sm">This action cannot be undone.</p>

                            <div className="flex gap-3 mt-4">
                                <button onClick={cancelDelete} className="flex-1 py-3 px-4 rounded-lg bg-[#0b1010] hover:bg-[#0d1313] text-gray-300 font-medium transition-colors border border-gray-800">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-900/20 transition-colors">Delete</button>
                            </div>
                        </div>
                        <div className="fixed inset-0 z-[-1]" onClick={cancelDelete}></div>
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showForm === true && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                        <form
                            onSubmit={handlesub}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-gradient-to-b from-[#071014] to-[#0b1b1b] p-8 rounded-2xl shadow-2xl flex flex-col gap-4 text-white relative border border-gray-800"
                        >
                            <h3 className="text-3xl font-bold text-[#20bec4] mb-2">{editId ? "Update Job" : "New Application"}</h3>
                            <p className="text-sm text-gray-400 mb-4">{editId ? "Update existing application details." : "Track a new job opportunity."}</p>

                            <button
                                type="button"
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                                onClick={closeModal}
                            >
                                <i className="fa-solid fa-xmark text-xl"></i>
                            </button>

                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm pl-1 font-medium text-gray-300">Job Title</label>
                                    <input
                                        className={`mt-1 block w-full rounded-md bg-[#0f1313] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${formError.jobTitle ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-[#0E898E]'}`}
                                        type="text"
                                        placeholder='e.g. Frontend Developer'
                                        value={jobTitle}
                                        onChange={(e) => {
                                            setjobTitle(e.target.value);
                                            if (formError.jobTitle) setfomError({ ...formError, jobTitle: null });
                                        }}
                                    />
                                    {formError.jobTitle && <span className="text-red-500 text-xs pl-1">{formError.jobTitle}</span>}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm pl-1 font-medium text-gray-300">Company Name</label>
                                    <input
                                        className={`mt-1 block w-full rounded-md bg-[#0f1313] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${formError.companyName ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-[#0E898E]'}`}
                                        type="text"
                                        placeholder='e.g. Google'
                                        value={companyName}
                                        onChange={(e) => {
                                            setcompanyName(e.target.value);
                                            if (formError.companyName) setfomError({ ...formError, companyName: null });
                                        }}
                                    />
                                    {formError.companyName && <span className="text-red-500 text-xs pl-1">{formError.companyName}</span>}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm pl-1 font-medium text-gray-300">Status</label>
                                    <select
                                        className={`mt-1 block w-full rounded-md bg-[#0f1313] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${formError.status ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-[#0E898E]'}`}
                                        value={status}
                                        onChange={(e) => {
                                            setstatus(e.target.value);
                                            if (formError.status) setfomError({ ...formError, status: null });
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

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full inline-flex justify-center items-center gap-2 rounded-md px-2 py-3 mt-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 bg-[#1f6b64] hover:bg-[#0e898e] text-white shadow-md transition duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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

                {/* Header */}
                <div className="flex items-center justify-between border-b-[1px] border-[#0e898e]/20 pb-6 mt-12">

                    <h2 className="text-white text-[24px] md:text-[30px] font-bold tracking-wide"><span className="text-[#20bec4]">|</span> Your Applications</h2>
                    <button
                        className="text-[16px] md:text-[18px] font-medium text-white bg-[#0e898e] px-6 py-2 rounded-full hover:bg-[#172627] hover:text-[#0e898e] border border-transparent hover:border-[#0e898e] transition-all duration-300 shadow-lg hover:shadow-[#0e898e]/20"
                        onClick={() => setshowForm(true)}
                    >
                        + Add Job
                    </button>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                            <article key={job.id} className="bg-gradient-to-b from-[#071014] to-[#0b1313] p-6 rounded-xl border border-[#0e898e]/10 hover:border-[#0e898e] shadow-xl transition-all ease-in duration-300 hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{job.jobTitle}</h3>
                                        <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                                            <i className="fa-regular fa-building"></i>
                                            {job.companyName}
                                        </p>
                                    </div>

                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                    ${job.status === 'Accepted' || job.status === 'Offered' ? 'bg-green-900/30 text-green-300 border border-green-800' :
                                            job.status === 'Rejected' ? 'bg-red-900/30 text-red-300 border border-red-800' :
                                                job.status === 'Interviewing' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' :
                                                    'bg-blue-900/30 text-blue-300 border border-blue-800'}`}>
                                        {job.status}
                                    </span>
                                </div>

                                <div className="pt-4 mt-2 border-t border-[#0b1b1b] flex justify-between items-center">
                                    <div className="text-xs text-gray-400">
                                        <span className="flex items-center gap-2">
                                            <i className="fa-regular fa-clock"></i>
                                            {job.createdAt?.seconds
                                                ? new Date(job.createdAt.seconds * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : 'Just now'}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-gray-400 text-xs gap-1">
                                        <button onClick={() => openEditModal(job)} title="Edit" className=" hover:scale-110 transition-all ease-in duration-300 inline-block">
                                            <i className="fa-solid fa-gear"></i>
                                        </button>
                                        <button onClick={() => promptDelete(job.id)} title="Delete" className=" hover:scale-110 transition-all ease-in duration-300 text-red-400 inline-block">
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="col-span-full h-[520px] flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-solid border-[#0e898e]/10 rounded-xl">
                            <i className="fa-solid fa-folder-open text-5xl mb-4 text-[#0e898e]"></i>
                            <p className="text-lg">No applications found.</p>
                            <p className="text-sm mt-2">Click "Add Job" to start tracking your applications.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default Jobviewer;