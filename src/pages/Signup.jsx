import React, { useReducer, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import Cookies from "js-cookie";

const getFirebaseErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

const initialState = {
  values: { name: "", email: "", password: "", confirm: "" },
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
        serverError: null, // Clear server error on typing
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
  if (!values.name.trim()) errs.name = "Name is required.";
  if (!values.email) errs.email = "Email is required.";
  else if (!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = "Enter a valid email.";

  if (!values.password) errs.password = "Password is required.";
  else if (values.password.length < 8)
    errs.password = "Password must be at least 8 characters.";

  if (!values.confirm) errs.confirm = "Please confirm your password.";
  else if (values.password !== values.confirm) errs.confirm = "Passwords do not match.";

  return errs;
}

function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  const label = ["Very weak", "Weak", "Fair", "Strong"][Math.min(score, 3)];
  return { score, label };
}

export default function SignUpForm() {
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
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      Cookies.set("userToken", token, { expires: 7, secure: true, sameSite: 'strict' });
      dispatch({ type: "SET_SUCCESS" });
      setTimeout(() => navigate("/"), 1500);
      
    } catch (err) {
      console.error("Signup Error:", err.code); // Debugging purpose
      
      const friendlyMessage = getFirebaseErrorMessage(err.code);

      dispatch({
        type: "SET_SERVER_ERROR",
        error: friendlyMessage,
      });

      if (err.code === 'auth/email-already-in-use' && emailRef.current) {
        emailRef.current.focus();
      }
    }
  };

  const { score, label } = passwordStrength(values.password);

  if (success) {
    return (
      <div className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] text-white p-6 animate-ultraSmoothFadeIn">
        <div className="max-w-md mx-auto p-6 bg-[#121212] rounded-lg shadow text-white">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">Account created 🎉</h2>
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
        <h1 className="text-3xl font-bold text-[#20bec4ff] mb-2">Create your account</h1>
        <p className="text-sm text-gray-400 mb-6">Join us — it only takes a minute.</p>

        {/* Server Error Message */}
        {serverError && (
          <div id="server-error" role="alert" className="mb-4 text-sm font-medium text-red-200 bg-red-900/30 border border-red-800 p-3 rounded flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
            {serverError}
          </div>
        )}

        {/* Name */}
        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-300">Full name</span>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-1 block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0E898E] transition-all duration-200 ${
              touched.name && errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-700"
            }`}
            placeholder="Your full name"
            aria-invalid={!!(touched.name && errors.name)}
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name}</p>
          )}
        </label>

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
        <label className="block mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Password</span>
            <span className="text-xs text-gray-400">min 8 characters</span>
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
              placeholder="Choose a strong password"
            />
            <button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_SHOW_PASSWORD" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#20bec4ff] hover:text-green-300 transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div id="pw-strength" className="mt-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`h-1.5 w-8 rounded transition-colors duration-300 ${score > i ? "bg-[#20bec4ff]" : "bg-gray-700"}`}></span>
                ))}
              </div>
              <span>{label}</span>
            </div>
          </div>

          {touched.password && errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password}</p>
          )}
        </label>

        {/* Confirm */}
        <label className="block mb-6">
          <span className="text-sm font-medium text-gray-300">Confirm password</span>
          <input
            name="confirm"
            type={showPassword ? "text" : "password"}
            value={values.confirm}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-1 block w-full rounded-md bg-[#1c1c1c] border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0E898E] transition-all duration-200 ${
              touched.confirm && errors.confirm ? "border-red-500 focus:ring-red-500" : "border-gray-700"
            }`}
            placeholder="Repeat your password"
          />
          {touched.confirm && errors.confirm && (
            <p className="mt-1 text-xs text-red-400">{errors.confirm}</p>
          )}
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className={`flex-1 inline-flex justify-center items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#20bec4ff] transition-all duration-300
              ${loading || Object.keys(errors).length > 0 ? "bg-[#275053ff] text-white cursor-not-allowed" : "bg-[#28b5b9ff] text-[#121212] hover:bg-[#60e9eeff] shadow-md hover:shadow-[#60e9eeff]/20"}`}
            aria-busy={loading}
          >
            {loading && (
              <svg className="h-5 w-5 animate-spin text-[#121212]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {loading ? "Creating..." : "Create account"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="text-[12px] text-gray-400 hover:text-[#20bec4ff] hover:underline transition-colors"
          >
            Already registered?
          </button>
        </div>
      </form>
    </div>
  );
}