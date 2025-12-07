import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import navicon from "../assets/icon.png";

const MainNav = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [hideNav, setHideNav] = useState(false);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      let currentY = window.scrollY;

      if (currentY > lastY && currentY > 40) {
        setHideNav(true);
      } else {
        setHideNav(false);
      }

      setLastY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  return (
    <div
      className={`
        w-[92%]
        h-[60px]
        mx-auto
        px-4 md:px-10
        flex justify-between items-center
        rounded-2xl
        fixed top-4 left-1/2 -translate-x-1/2
        z-50
        backdrop-blur-xl bg-black/40 border border-white/10
        shadow-[0_8px_30px_rgba(0,0,0,0.3)]
        transition-all duration-300

        ${hideNav 
          ? "opacity-0 scale-95 pointer-events-none" 
          : "opacity-100 scale-100 pointer-events-auto"}
      `}
    >
      <img
        src={navicon}
        onClick={() => navigate("/")}
        className="w-8 h-8 md:w-10 md:h-10 cursor-pointer hover:scale-110 transition-all ease-in duration-300" 
        alt=""
      />

      {/* زرار الموبايل (Hamburger) 
        خليته يظهر هنا عشان الترتيب، بس الـ Position بتاعه Flex عادي 
      */}
      <div
        className="md:hidden text-white cursor-pointer order-last ml-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-7 h-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </div>

      <div
        className={`
          ${isOpen ? "flex" : "hidden"}
          md:flex flex-col md:flex-row
          gap-6 items-center
          absolute md:static top-[60px] left-0 w-full md:w-auto
          bg-black/90 md:bg-transparent
          backdrop-blur-xl md:backdrop-blur-none
          py-6 md:py-0
          transition-all
          border-b border-white/10 md:border-none rounded-b-2xl md:rounded-none
        `}
      >
        <nav className="flex flex-col md:flex-row gap-6 items-center text-white transition-all ease-in duration-300">
          {[
            ["Home", "/"],
            ["Profile", "/profile-page"],
            ["Job viewer", "/jobviewer"],
            ["Job Trends", "/dashboard"],
            ["Review CV", "/CVform"],
            ["Job Recommendations", "/jop"],
            ["Chatbot", "/Chatbot"],
          ].map(([label, link]) => (
            <NavLink
              key={label}
              to={link}
              onClick={() => setIsOpen(false)}
              className="
                text-[15px]
                transition-all ease-in duration-300
                hover:text-teal-300 hover:scale-105
              "
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* الزراير: ظاهرة دايماً (شلت hidden) وظبطت الحجم للموبايل */}
      {localStorage.getItem("userToken") ? (
        <button
          onClick={() => navigate("/logout")}
          className="
            block
            text-white text-[12px] md:text-[15px]
            px-3 py-1.5 md:px-4 md:py-2 
            rounded-xl
            bg-teal-500/90
            hover:bg-teal-400
            hover:scale-105
            transition-all ease-in duration-300
            shadow-[0_0_15px_rgba(0,255,255,0.4)]
          "
        >
          Logout
        </button>
      ) : (
        <div className="flex gap-2 md:gap-3 items-center">
          <button
            onClick={() => navigate("/signin")}
            className="
              text-white text-[12px] md:text-[15px]
              px-3 py-1.5 md:px-4 md:py-2 
              rounded-xl
              bg-white/10 border border-white/20
              hover:bg-white/20 hover:scale-105
              transition-all ease-in duration-300
              whitespace-nowrap
            "
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="
              text-[12px] md:text-[15px] text-black font-semibold
              px-3 py-1.5 md:px-4 md:py-2 
              rounded-xl
              bg-teal-300
              hover:bg-teal-200 hover:scale-105
              shadow-[0_0_20px_rgba(0,255,255,0.4)]
              transition-all ease-in duration-300
              whitespace-nowrap
            "
          >
            Get started
          </button>
        </div>
      )}
    </div>
  );
};

export default MainNav;