import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"

const MainNav = () => {

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem("userToken"); 

  return (
    <div className="w-screen h-[72px] px-4 md:px-[50px] bg-sec flex justify-between items-center content-center relative z-50">
      <p className='text-white text-[25px] font-bold cursor-pointer' onClick={() => navigate("/")}>ICA</p>
      
      <div className="md:hidden text-white cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>

      <div className={`${isOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-center gap-8 absolute md:static top-[72px] left-0 w-full md:w-auto bg-sec md:bg-transparent pb-8 md:pb-0 transition-all duration-300 ease-in-out`}>
        <nav className="flex flex-col md:flex-row text-white gap-8 items-center">
            <NavLink to='/' className='nav-t'> Home</NavLink>
            <NavLink to='/profile-page' className='nav-t'> Profile</NavLink>
            <NavLink to='/About' className='nav-t'> About</NavLink>
            <NavLink to='/dashboard' className='nav-t'> Dashboard</NavLink>
            <NavLink to='/CVform' className='nav-t'> Review CV</NavLink>
            <NavLink to='/jop' className='nav-t'> Job Recommendations</NavLink>
            <NavLink to='/Chatbot' className='nav-t'> Chatbot</NavLink>

        </nav>
      </div>

<button
  onClick={() => navigate("/logout")}
  className={`text-[16px] text-white hover:bg-[#0e898e] p-4 rounded-[24px] hover:scale-110 bg-[#172627] hover:text-red-600 hover:font-semibold transition-all ease-in duration-300 ${token ? "block" : "hidden"}`}
>
  Logout
</button>


<div className={`gap-4 ${!token ? "flex" : "hidden"}`}>
  <button
    onClick={() => navigate("/signin")}
    className="text-[16px] text-white hover:bg-[#0e898e] p-4 rounded-[24px] hover:scale-110 bg-[#172627] hover:text-[#172627] hover:font-semibold transition-all ease-in duration-300"
  >
    Sign In
  </button>
  <button
    onClick={() => navigate("/signup")}
    className="text-[16px] text-white hover:bg-[#0e898e] p-4 rounded-[24px] hover:scale-110 bg-[#172627] hover:text-[#172627] hover:font-semibold transition-all ease-in duration-300"
  >
    Sign Up
  </button>
</div>
    </div>
  )
}

export default MainNav