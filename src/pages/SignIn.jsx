import React, { useReducer, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Cookies from "js-cookie";

const getFirebaseErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'This email is already in use.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/invalid-email':
      return 'Invalid email format.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

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

      const token = await userCredential.user.getIdToken();
      Cookies.set("userToken", token, { expires: 7, secure: true, sameSite: 'strict' });

      dispatch({ type: "SET_SUCCESS" });
      setTimeout(() => navigate("/"), 1500);
      
    } catch (err) {
      console.error("Firebase Error Code:", err.code);
      const friendlyErrorMessage = getFirebaseErrorMessage(err.code);
      
      dispatch({
        type: "SET_SERVER_ERROR",
        error: friendlyErrorMessage,
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

        {/* Server Error Message Display */}
        {serverError && (
          <div id="server-error" role="alert" className="mb-4 text-sm font-medium text-red-200 bg-red-900/30 border border-red-800 p-3 rounded flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
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
            className={`mt-1 block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0E898E] transition-all duration-200 ${
              touched.email && errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-700"
            }`}
            placeholder="you@example.com"
            aria-invalid={!!(touched.email && errors.email)}
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email}</p>
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
              className={`block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0E898E] transition-all duration-200 ${
                touched.password && errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-700"
              }`}
              placeholder="Your password"
            />
            <button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_SHOW_PASSWORD" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#20bec4ff] hover:text-green-300 transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {touched.password && errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password}</p>
          )}
        </label>

        <div className="flex items-center content-center justify-between">
          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className={`w-[250px] inline-flex justify-center items-center gap-2 rounded-md px-2 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300
            ${loading || Object.keys(errors).length > 0
              ? "bg-[#275053ff] bg-opacity-40 text-white cursor-not-allowed"
              : "bg-[#275053ff] hover:bg-[#0E898E] text-white shadow-md hover:shadow-[#0E898E]/40"
            }`}
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                <path d="M2 12a10 10 0 0110-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            {loading ? "Signing In..." : "Sign In"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-[12px] text-gray-400 hover:text-[#20bec4ff] hover:underline transition-colors"
          >
            Create an account
          </button>
        </div>
      </form>
    </div>
  );
}