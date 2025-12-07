import React, { useReducer, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; 


const initialState = {
  values: { email: "", password: "" },
  errors: {},
  touched: {},
  loading: false,
  serverError: null,
  success: false,
  showPassword: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        serverError: null,
      };
    case "SET_TOUCHED":
      return { ...state, touched: { ...state.touched, [action.field]: true } };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_SERVER_ERROR":
      return { ...state, serverError: action.error, loading: false };
    case "SET_SUCCESS":
      return { ...state, success: true, loading: false };
    case "TOGGLE_SHOW_PASSWORD":
      return { ...state, showPassword: !state.showPassword };
    default:
      return state;
  }
}


function validate(values) {
  const errs = {};
  if (!values.email) errs.email = "Email is required.";
  else if (!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = "Enter a valid email.";

  if (!values.password) errs.password = "Password is required.";
  return errs;
}

export default function SignInForm() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { values, errors, touched, loading, serverError, success, showPassword } = state;
  const emailRef = useRef(null);
  const navigate = useNavigate("");

  React.useEffect(() => {
    const e = validate(values);
    dispatch({ type: "SET_ERRORS", errors: e });
  }, [values]);

  const handleChange = (e) => {
    dispatch({ type: "SET_FIELD", field: e.target.name, value: e.target.value });
  };

  const handleBlur = (e) => {
    dispatch({ type: "SET_TOUCHED", field: e.target.name });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eObj = validate(values);
    if (Object.keys(eObj).length) {
      dispatch({ type: "SET_ERRORS", errors: eObj });
      const first = Object.keys(eObj)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el) el.focus();
      return;
    }

    dispatch({ type: "SET_LOADING", loading: true });
    try {
      
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);

      // Generate Token
      const token = await userCredential.user.getIdToken();
      console.log("Generated Token:", token);

      // Store Token in localStorage
      localStorage.setItem("userToken", token);


      setTimeout(() => navigate("/"), 1500);
      dispatch({ type: "SET_SUCCESS" });
      // Redirect here if needed
    } catch (err) {
      dispatch({
        type: "SET_SERVER_ERROR",
        error: err.message || "Login failed. Try again.",
      });
      if (emailRef.current) emailRef.current.focus();
    }
  };

  if (success) {
    return (
      <div className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] text-white p-4 animate-ultraSmoothFadeIn">
      <div className="max-w-md mx-auto p-6 bg-[#121212] rounded-lg shadow text-white">
        <h2 className="text-2xl font-semibold mb-4 text-green-400">Welcome back👋</h2>
        <p className="text-gray-300 flex items-center content-center gap-1">You're now logged in. Redirecting… 
          <span>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
              <path d="M2 12a10 10 0 0110-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </p>
      </div>
      </div>
    );
  }

  return (
  <div className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] text-white p-4 animate-ultraSmoothFadeIn">


      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md bg-[#121212] p-8 rounded-xl shadow-lg"
        aria-describedby={serverError ? "server-error" : undefined}
      >
        <h1 className="text-3xl font-bold text-[#20bec4ff] mb-2">Sign In</h1>
        <p className="text-sm text-gray-400 mb-6">Enter your email and password</p>

        {serverError && (
          <div id="server-error" role="alert" className="mb-4 text-sm text-red-400 bg-red-900 bg-opacity-20 p-3 rounded">
            {serverError}
          </div>
        )}

        {/* Email */}
        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-300">Email</span>
          <input
            ref={emailRef}
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-1 block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0E898E] ${touched.email && errors.email ? "border-red-500" : "border-gray-700"
              }`}
            placeholder="you@example.com"
            aria-invalid={!!(touched.email && errors.email)}
            aria-describedby={touched.email && errors.email ? "error-email" : undefined}
          />
          {touched.email && errors.email && (
            <p id="error-email" className="mt-1 text-xs text-red-400">{errors.email}</p>
          )}
        </label>

        {/* Password */}
        <label className="block mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Password</span>
          </div>

          <div className="relative mt-1">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0E898E] ${touched.password && errors.password ? "border-red-500" : "border-gray-700"
                }`}
              placeholder="Your password"
              aria-invalid={!!(touched.password && errors.password)}
              aria-describedby={touched.password && errors.password ? "error-password" : undefined}
            />
            <button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_SHOW_PASSWORD" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#20bec4ff] hover:text-green-300"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {touched.password && errors.password && (
            <p id="error-password" className="mt-1 text-xs text-red-400">{errors.password}</p>
          )}
        </label>

        <div className="flex items-center content-center justify-between">
        {/* Submit */}
        <button
          type="submit"
          disabled={loading || Object.keys(errors).length > 0}
          className={`w-[250px] inline-flex justify-center items-center gap-2 rounded-md px-2 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400
            ${loading || Object.keys(errors).length > 0
              ? "bg-[#275053ff] bg-opacity-40 text-white cursor-not-allowed"
              : "bg-[#275053ff] hover:bg-[#0E898E] text-white shadow-md hover:shadow-green-500/40 transition duration-300"
            }`}
            aria-busy={loading}
            >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
              <path d="M2 12a10 10 0 0110-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          ) : null}
          Sign In
        </button>
        {/* SingUp */}
        <button
        onClick={() => navigate("/signup")}
        className="text-[12px] text-gray-400 hover:text-[#20bec4ff] hover:underline"
        >
        To create an account!
        </button>
        </div>
      </form>
    </div>
  );
}
