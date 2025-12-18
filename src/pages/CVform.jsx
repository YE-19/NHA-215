import React, { useReducer, useRef, useState, useCallback } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Loadingpage from "./Loadingpage";

const ACCEPTED_TYPES = [
  "application/pdf",
];

const initialState = {
  file: null,
  loading: false,
  analyzing: false,
  serverError: null,
  analysis: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FILE":
      return { ...state, file: action.file, serverError: null };
    case "REMOVE_FILE":
      return { ...state, file: null, serverError: null };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ANALYZING":
      return { ...state, analyzing: action.analyzing };
    case "SET_ANALYSIS":
      return {
        ...state,
        analysis: action.data,
        loading: false,
        analyzing: false,
      };
    case "SET_SERVER_ERROR":
      return {
        ...state,
        serverError: action.error,
        loading: false,
        analyzing: false,
      };
    default:
      return state;
  }
}

export default function CVFormUploader() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { file, loading, analyzing, serverError, analysis } = state;
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const validateAndSet = useCallback((f) => {
    if (!f) return false;
    
    if (f.type !== "application/pdf") {
      dispatch({
        type: "SET_SERVER_ERROR",
        error: "Only PDF files are allowed.",
      });
      dispatch({ type: "REMOVE_FILE" });
      if (fileRef.current) fileRef.current.value = "";
      return false;
    }
    
    dispatch({ type: "SET_FILE", file: f });
    return true;
  }, []);

  const handleFiles = (files) => {
    const f = files?.[0];
    if (f) validateAndSet(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onChoose = () => fileRef.current?.click();
  const onFileChange = (e) => handleFiles(e.target.files);
  const removeFile = () => {
    dispatch({ type: "REMOVE_FILE" });
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      dispatch({ type: "SET_SERVER_ERROR", error: "Please upload a PDF file." });
      return;
    }

    dispatch({ type: "SET_LOADING", loading: true });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://yaraa03-resume-ats-api.hf.space/ats-score",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        let errorMsg = "Analysis failed. Please try again.";
        
        try {
            const errorData = await response.json();
            if (errorData.detail) errorMsg = errorData.detail;
            else if (errorData.message) errorMsg = errorData.message;
        } catch (e) {
        }

        if (response.status === 503) {
            errorMsg = "Service is waking up. Please try again in a minute.";
        } else if (response.status === 413) {
            errorMsg = "File size is too large.";
        } else if (response.status >= 500) {
            errorMsg = "Server error. Please try again later.";
        }

        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log("API Response:", result);

      dispatch({ type: "SET_ANALYZING", analyzing: true });

      setTimeout(() => {
        dispatch({ type: "SET_ANALYSIS", data: result });
      }, 900);

    } catch (err) {
      console.error("Submission Error:", err);
      dispatch({
        type: "SET_SERVER_ERROR",
        error: err.message || "Network error. Check your connection.",
      });
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };


  if (analysis) {
    const {
      overall = 0,
      subscores = {},
      warnings = [],
      missing_or_weak_sections = [],
      top_recommendations = [],
    } = analysis;
    const scoreColor = overall >= 80 ? "#10b981" : overall >= 60 ? "#f59e0b" : "#ef4444";

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#010d0d] to-[#023437] flex items-center justify-center p-6 pt-[100px]">
        <div className="max-w-6xl w-full space-y-10">
          <div className="bg-gradient-to-b from-[#071014] to-[#081618] rounded-3xl p-12 border border-[#123d3d] text-center shadow-lg">
            <h3 className="text-5xl font-bold text-[#20bec4] mb-8">ATS Overall Score</h3>

            <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
              <div className="w-64 h-64 mx-auto">
                <CircularProgressbar
                  value={overall}
                  text={`${overall}%`}
                  styles={buildStyles({
                    pathColor: scoreColor,
                    textColor: "#fff",
                    trailColor: "#0b1a1a",
                    textSize: "16px",
                  })}
                />
              </div>

              <div className="space-y-4 max-w-md text-left">
                <h4 className="text-xl font-semibold text-white">Summary</h4>
                <p className="text-gray-300">{analysis.summary || "No summary provided."}</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {Object.entries(subscores).map(([k, v]) => (
                    <div key={k} className="bg-[#0b1a1a] p-4 rounded-xl border border-[#123d3d]">
                      <p className="text-gray-400 capitalize text-sm">{k.replace(/_/g, " ")}</p>
                      <p className="text-white text-2xl font-bold mt-2">{v}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="bg-[#071014] rounded-2xl p-8 border border-[#123d3d]">
              <h3 className="text-2xl font-bold text-[#20bec4] mb-5">Warnings</h3>
              {warnings.map((w, i) => (
                <p key={i} className="text-yellow-300 flex items-center gap-3 mt-2">• {w}</p>
              ))}
            </div>
          )}

          {missing_or_weak_sections.length > 0 && (
            <div className="bg-[#071014] rounded-2xl p-8 border border-[#123d3d]">
              <h3 className="text-2xl font-bold text-[#20bec4] mb-5">Missing / Weak Sections</h3>
              {missing_or_weak_sections.map((s, i) => (
                <p key={i} className="text-red-400 flex items-center gap-3 mt-2">• {s}</p>
              ))}
            </div>
          )}

          {top_recommendations.length > 0 && (
            <div className="bg-[#071014] rounded-2xl p-8 border border-[#123d3d]">
              <h3 className="text-2xl font-bold text-[#20bec4] mb-5">Top Recommendations</h3>
              {top_recommendations.map((r, i) => (
                <p key={i} className="text-green-400 flex items-center gap-3 mt-2">• {r}</p>
              ))}
            </div>
          )}

          <button
            onClick={() => dispatch({ type: "SET_ANALYSIS", data: null })}
            className="w-full py-5 bg-gradient-to-r from-[#20bec4] to-[#0ea6a9] hover:from-[#0ea6a9] text-black font-bold rounded-2xl"
          >
            Analyze Another CV
          </button>
        </div>
      </div>
    );
  }

  if (loading || analyzing) {
    return <Loadingpage />;
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#010d0d] to-[#023437] flex items-center justify-center p-6 pt-[100px]">
      <div className="w-full max-w-5xl">
        <div className="rounded-3xl bg-[#010d0d]/80 p-10 shadow-2xl border border-[#0c3c3a]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Upload card */}
            <div className="bg-gradient-to-b from-[#071014] to-[#0b1b1b] rounded-2xl p-8 border border-[#123d3d] shadow-lg">
              <h2 className="text-3xl font-bold text-[#20bec4] mb-4">Upload Your Resume</h2>
              <p className="text-gray-300 mb-6">Drag & drop your file or click to choose. Accepted: PDF only.</p>

              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`rounded-xl p-8 text-center border-2 border-dashed transition ${dragOver ? 'border-[#20bec4] bg-white/5' : 'border-[#123d3d] bg-transparent'}`}
              >
                {/* 4. تعديل الـ Input ليقبل PDF فقط */}
                <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onFileChange} />
                <button onClick={onChoose} className="px-8 py-3 bg-gradient-to-r from-[#20bec4] to-[#0ea6a9] rounded-lg text-black font-semibold hover:scale-105 transition">Choose file</button>
                <p className="text-gray-400 mt-4">or drag & drop here</p>
              </div>

              {file && (
                <div className="mt-4 flex items-center justify-between bg-white/5 p-3 rounded-md border border-[#123d3d]">
                  <div>
                    <div className="text-sm text-white font-medium">{file.name}</div>
                    <div className="text-xs text-gray-300">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={removeFile} className="text-red-400 hover:text-red-500">Remove</button>
                  </div>
                </div>
              )}

              {/* Server Error Message */}
              {serverError && (
                 <div className="mt-4 p-3 rounded bg-red-900/30 border border-red-800 text-red-300 text-sm">
                   {serverError}
                 </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !file}
                className="mt-6 w-full py-4 rounded-xl text-black font-bold bg-gradient-to-r from-[#20bec4] to-[#0ea6a9] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Analyze My CV
              </button>
            </div>

            {/* Right: Info / placeholder */}
            <div className="p-6 rounded-2xl bg-[#071014] border border-[#123d3d] shadow-inner text-white">
              <h3 className="text-2xl font-semibold mb-3">What you'll get</h3>
              <ul className="space-y-3 text-gray-300">
                <li>• ATS compatibility score</li>
                <li>• Section-level feedback & warnings</li>
                <li>• Skill & gap extraction</li>
                <li>• Actionable recommendations</li>
              </ul>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white/90">Quick tips</h4>
                <ol className="mt-2 text-gray-400 list-decimal list-inside space-y-1">
                  <li>Use clear section headers</li>
                  <li>Keep formatting simple (PDF recommended)</li>
                  <li>Include measurable results in experience</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}