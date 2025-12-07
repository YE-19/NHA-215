import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import EgyptGrowthChart from "../components/EgyptGrowthChart";

const Dashboard = () => {
  const targets = [6.6, 45.29, 38.24, 18.71];
  const [values, setValues] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const intervals = values.map((_, index) => {
      return setInterval(() => {
        setValues((prevValues) => {
          const newValues = [...prevValues];
          if (newValues[index] >= targets[index]) {
            clearInterval(intervals[index]);
            newValues[index] = targets[index];
          } else {
            newValues[index] += 1;
          }
          return newValues;
        });
      }, 20);
    });

    return () => intervals.forEach((interval) => clearInterval(interval));
  }, []);

  const navigate = useNavigate();

  return (
<section className="relative min-h-[calc(100vh-72px)] bg-pri px-4 pb-4 pt-[80px] md:px-16 md:pb-16 md:pt-[100px] md:min-h-[1100px]">
      <div className="bg-[#0e1617] rounded-3xl p-4 md:p-6 md:m-5 ">
        <h2 className="text-white text-[22px] md:text-[30px] md:mt-3 pl-1 pb-3">
          |Key Labor Market Indicators
        </h2>
        
        {/* Progress Bars Section */}
        <div className="flex items-center bg-[#0A1010] content-center justify-center md:justify-evenly w-full rounded-3xl flex-wrap gap-4 py-6 md:py-0">
          
          {/* Item 1 */}
          <div className="w-[140px] sm:w-[200px] lg:w-[250px] p-2 md:p-4 flex flex-col content-center items-center gap-3">
            <CircularProgressbar
              value={values[0]}
              text={`${values[0]}%`}
              styles={buildStyles({
                pathColor: "#0E898E",
                textColor: "#ffffff",
                trailColor: "#222",
                textSize: "16px",
              })}
            />
            <span className="text-white text-[14px] md:text-[19px] text-center">
              Unemployment
            </span>
          </div>

          {/* Item 2 */}
          <div className="w-[140px] sm:w-[200px] lg:w-[250px] p-2 md:p-4 flex flex-col content-center items-center gap-3">
            <CircularProgressbar
              value={values[1]}
              text={`${values[1]}%`}
              styles={buildStyles({
                pathColor: "#0E898E",
                textColor: "#ffffff",
                trailColor: "#222",
                textSize: "16px",
              })}
            />
            <span className="text-white text-[14px] md:text-[19px] text-center">
              Labor Force Participation
            </span>
          </div>

          {/* Item 3 */}
          <div className="w-[140px] sm:w-[200px] lg:w-[250px] p-2 md:p-4 flex flex-col content-center items-center gap-3">
            <CircularProgressbar
              value={values[2]}
              text={`${values[2]}%`}
              styles={buildStyles({
                pathColor: "#0E898E",
                textColor: "#ffffff",
                trailColor: "#222",
                textSize: "16px",
              })}
            />
            <span className="text-white text-[14px] md:text-[19px] text-center">
              Employment
            </span>
          </div>

          {/* Item 4 */}
          <div className="w-[140px] sm:w-[200px] lg:w-[250px] p-2 md:p-4 flex flex-col content-center items-center gap-3">
            <CircularProgressbar
              value={values[3]}
              text={`${values[3]}%`}
              styles={buildStyles({
                pathColor: "#0E898E",
                textColor: "#ffffff",
                trailColor: "#222",
                textSize: "16px",
              })}
            />
            <span className="text-white text-[14px] md:text-[19px] text-center">
              Youth Unemployment
            </span>
          </div>
        </div>

        <h2 className="text-white text-[22px] md:text-[30px] pl-1 py-3">
          |Economic Growth of Egypt
        </h2>
        
        <EgyptGrowthChart />
        
        <button
          onClick={() => navigate("/powerbi")}
          className="w-full md:w-auto text-[16px] md:text-[18px] text-white bg-[#0e898e] my-4 p-3 md:p-4 rounded-[24px] hover:scale-105 md:hover:scale-110 hover:bg-[#0e1617] hover:text-[#0e898e] transition-all ease-in duration-300"
        >
          View Market Trends
        </button>
      </div>
    </section>
  );
};

export default Dashboard;
