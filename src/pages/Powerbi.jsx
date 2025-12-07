import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loadingpage from "./Loadingpage";

const Powerbi = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  return (
<div className="relative w-full min-h-screen pt-[100px] flex flex-col justify-center items-center bg-gray-50">
      {loading && <Loadingpage />}

      <iframe
        className="w-full md:w-full h-[80vh] md:h-[calc(100vh-72px)] md:pt-12 block shadow-lg"
        title="MarketTrendsDEPI"
        src="https://app.powerbi.com/view?r=eyJrIjoiMGMzNzY4YzctYzk2OS00M2I2LWI5NjAtNTRmNTU3NzU3NTczIiwidCI6IjIwODJkZTQ2LTFhZmEtNGI2NC1hNDQwLTY1NThmODBlOTg0MCIsImMiOjh9"
        frameBorder="0"
        allowFullScreen={true}
        onLoad={() => setLoading(false)}
      />

      {!loading && (
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute z-10 top-[110px] left-2 md:left-4 text-sm md:text-[16px] text-white bg-[#0e898e] p-2 md:p-3 rounded-[24px] hover:scale-110 transition-all ease-in duration-300"
        >
          Back
        </button>
      )}
    </div>
  );
};

export default Powerbi;