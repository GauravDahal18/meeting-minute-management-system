import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Header from "../../components/Header/Header.jsx";
import DarkModeToggle from "../../components/DarkModeToggle.jsx";

function Login() {
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const [formErrors, setFormErrors] = useState({ username: "", password: "" });
   const [error, setError] = useState("");
   const [showPassword, setShowPassword] = useState(false);

   const navigate = useNavigate();
   const { isDarkMode } = useTheme();
   const {
      login: authContextLogin,
      isAuthenticated,
      isAuthLoading,
      checkAuthStatus,
   } = useAuth();

   useEffect(() => {
      if (isAuthenticated && !isAuthLoading) {
         navigate("/home", { replace: true });
      }
   }, [isAuthenticated, isAuthLoading, navigate]);

   const handleLogin = async (event) => {
      event.preventDefault();
      setLoading(true);
      setError("");
      const newErrors = { username: "", password: "" };

      if (!username) newErrors.username = "Please enter your username.";
      if (!password) newErrors.password = "Please enter your password.";

      setFormErrors(newErrors);

      if (newErrors.username || newErrors.password) {
         setLoading(false);
         return;
      }

      const credentials = `${username}:${password}`;
      const encodedCredentials = btoa(credentials);
      const LOGIN_API_URL = `http://localhost:8080/api/login`;

      try {
         const response = await fetch(LOGIN_API_URL, {
            method: "GET",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Basic ${encodedCredentials}`,
            },
            credentials: "include",
         });

         const data = await response.json().catch(() => ({}));

         if (response.status === 200) {
            toast.success("✅ Login successful!", {
               position: "top-right",
               autoClose: 500,
               theme: "colored",
            });

            authContextLogin(); // update context
            checkAuthStatus(); // optional refresh

            // Delay navigation to let toast finish
            setTimeout(() => {
               navigate("/home", { replace: true });
            }, 1500);
         } else if (response.status === 401) {
            toast.error("❌ Invalid username or password.", {
               position: "top-right",
               autoClose: 4000,
               theme: "colored",
            });
         } else {
            toast.error(data.message || "❌ Login failed.", {
               position: "top-right",
               autoClose: 4000,
               theme: "colored",
            });
         }
      } catch (err) {
         console.error(err);
         toast.error("❌ Could not connect to the server.", {
            position: "top-right",
            autoClose: 4000,
            theme: "colored",
         });
      } finally {
         setLoading(false);
      }
   };

   if (isAuthLoading && !isAuthenticated) {
      return (
         <div
            className={`text-center mt-20 text-lg transition-colors duration-200 ${
               isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
         >
            Checking authentication status...
         </div>
      );
   }

   return (
      <div
         className={`min-h-screen flex flex-col transition-colors duration-200 ${
            isDarkMode
               ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
               : "bg-gradient-to-br from-blue-100 to-purple-200"
         }`}
      >
         {/* Dark Mode Toggle - Positioned absolutely in top right */}
         <div className="absolute top-4 right-4 z-10">
            <DarkModeToggle />
         </div>

         <div className="flex items-center justify-center px-4 py-14">
            <div
               className={`p-8 rounded-xl shadow-lg w-full max-w-md transition-colors duration-200 ${
                  isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
               }`}
            >
               <h2
                  className={`text-2xl font-bold text-center mb-6 transition-colors duration-200 ${
                     isDarkMode ? "text-blue-400" : "text-blue-800"
                  }`}
               >
                  Login
               </h2>
               <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                     <label
                        htmlFor="usernameInput"
                        className={`block text-sm font-medium mb-1 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                     >
                        Username
                     </label>
                     <input
                        type="text"
                        id="usernameInput"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => {
                           setUsername(e.target.value);
                           setFormErrors((prev) => ({ ...prev, username: "" }));
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                           isDarkMode
                              ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                     />
                     {formErrors.username && (
                        <p className="text-red-500 text-sm mt-1">
                           {formErrors.username}
                        </p>
                     )}
                  </div>
                  <div>
                     <label
                        htmlFor="passwordInput"
                        className={`block text-sm font-medium mb-1 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                     >
                        Password
                     </label>
                     <div className="relative">
                        <input
                           type={showPassword ? "text" : "password"}
                           id="passwordInput"
                           placeholder="Enter password"
                           value={password}
                           onChange={(e) => {
                              setPassword(e.target.value);
                              setFormErrors((prev) => ({
                                 ...prev,
                                 password: "",
                              }));
                           }}
                           className={`w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                              isDarkMode
                                 ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                 : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                           }`}
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword((prev) => !prev)}
                           className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                              isDarkMode
                                 ? "text-gray-400 hover:text-gray-300"
                                 : "text-gray-500 hover:text-gray-700"
                           }`}
                           tabIndex={-1}
                        >
                           {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                     </div>
                     {formErrors.password && (
                        <p className="text-red-500 text-sm mt-1">
                           {formErrors.password}
                        </p>
                     )}
                  </div>
                  {error && (
                     <p className="text-red-600 text-sm font-medium text-center">
                        {error}
                     </p>
                  )}

                  <button
                     type="submit"
                     disabled={loading}
                     className={`w-full py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                        isDarkMode
                           ? "bg-blue-700 hover:bg-blue-800 text-white"
                           : "bg-blue-800 hover:bg-blue-900 text-white"
                     }`}
                  >
                     {loading ? "Logging in..." : "Login"}
                  </button>
                  <div
                     className={`text-sm text-center mt-4 transition-colors duration-200 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                     }`}
                  >
                     Don't have an account?{" "}
                     <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        className={`font-medium hover:underline transition-colors duration-200 ${
                           isDarkMode
                              ? "text-blue-400 hover:text-blue-300"
                              : "text-blue-600 hover:text-blue-700"
                        }`}
                     >
                        Sign up
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
}

export default Login;
