import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle, Briefcase, Sparkles, FileText, Bot, LineChart } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#091818] to-[#0b3434] text-white">
      
      
      <header className="px-10 lg:px-20 py-32 flex flex-col lg:flex-row items-center justify-between gap-14">
        
        
        <div className="flex flex-col items-start gap-6 max-w-2xl">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
            Find The Best Job  
            <span className="text-[#20bec4] block">Powered by AI.</span>
          </h1>

          <p className="text-lg text-white/80 leading-relaxed">
            Upload your resume, analyze your skills, explore matching jobs, simulate interviews, 
            and track market trends — all in one smart platform.
          </p>

          <button 
            onClick={() => navigate("/Jop")}
            className="bg-[#20bec4] text-black px-6 py-3 text-lg rounded-xl hover:bg-[#169ba0] transition-all ease-in duration-300 flex items-center gap-2"
          >
            Start Exploring
            <ChevronRight size={20} />
          </button>

          
          <div className="flex flex-wrap gap-4 mt-4 text-white/80">
            <span className="flex items-center gap-2"><CheckCircle size={18} className="text-[#20bec4]" /> CV Analyzer</span>
            <span className="flex items-center gap-2"><CheckCircle size={18} className="text-[#20bec4]" /> Job Recommender</span>
            <span className="flex items-center gap-2"><CheckCircle size={18} className="text-[#20bec4]" /> Interview Bot</span>
            <span className="flex items-center gap-2"><CheckCircle size={18} className="text-[#20bec4]" /> Market Insights</span>
          </div>
        </div>

       
        <div className="relative w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl shadow-2xl text-center">
            <Sparkles className="mx-auto text-[#20bec4]" size={44} />
            <h3 className="text-2xl font-semibold mt-4">Smart AI Platform</h3>
            <p className="text-white/70 mt-2">Designed to boost your career in seconds.</p>
          </div>
        </div>

      </header>

                                                                                   
      <div className="px-10 lg:px-20 py-20">
        <h2 className="text-4xl font-bold mb-12">Our Features</h2>

        <div className="grid md:grid-cols-3 gap-10">
          
          <div className="bg-white/5 p-7 rounded-2xl border border-white/10 hover:-translate-y-2 transition-all ease-in duration-300 shadow-lg">
            <FileText size={40} className="text-[#20bec4]" />
            <h3 className="text-xl font-semibold mt-4 mb-2">CV Reviewer</h3>
            <p className="text-white/70 text-sm">
              Analyze your resume instantly and highlight your strengths + missing improvements.
            </p>
          </div>

          <div className="bg-white/5 p-7 rounded-2xl border border-white/10 hover:-translate-y-2 transition-all ease-in duration-300 shadow-lg">
            <Briefcase size={40} className="text-[#20bec4]" />
            <h3 className="text-xl font-semibold mt-4 mb-2">Job Matching</h3>
            <p className="text-white/70 text-sm">
              Get top job recommendations based on your exact skills and experience.
            </p>
          </div>

          <div className="bg-white/5 p-7 rounded-2xl border border-white/10 hover:-translate-y-2 transition-all ease-in duration-300 shadow-lg">
            <Bot size={40} className="text-[#20bec4]" />
            <h3 className="text-xl font-semibold mt-4 mb-2">Interview Simulator</h3>
            <p className="text-white/70 text-sm">
              Practice interviews with a real AI chatbot that prepares you for HR & technical rounds.
            </p>
          </div>

          <div className="bg-white/5 p-7 rounded-2xl border border-white/10 hover:-translate-y-2 transition-all ease-in duration-300 shadow-lg">
            <LineChart size={40} className="text-[#20bec4]" />
            <h3 className="text-xl font-semibold mt-4 mb-2">Job Market Trends</h3>
            <p className="text-white/70 text-sm">
              Explore hiring trends, in-demand skills, and hot job categories.
            </p>
          </div>

          <div className="bg-white/5 p-7 rounded-2xl border border-white/10 hover:-translate-y-2 transition-all ease-in duration-300 shadow-lg">
            <Sparkles size={40} className="text-[#20bec4]" />
            <h3 className="text-xl font-semibold mt-4 mb-2">Skill Insights</h3>
            <p className="text-white/70 text-sm">
              Find what skills you need to improve to reach your dream job.
            </p>
          </div>

          <div className="bg-white/5 p-7 rounded-2xl border border-white/10 hover:-translate-y-2 transition-all ease-in duration-300 shadow-lg">
            <ChevronRight size={40} className="text-[#20bec4]" />
            <h3 className="text-xl font-semibold mt-4 mb-2">More Coming Soon</h3>
            <p className="text-white/70 text-sm">
              More AI-powered features to help job seekers succeed.
            </p>
          </div>

        </div>
      </div>

    </section>
  );
};

export default Home;