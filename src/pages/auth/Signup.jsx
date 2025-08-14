import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext.jsx";
import DarkModeToggle from "../../components/DarkModeToggle.jsx";

function Signup() {
   const [formData, setFormData] = useState({
      firstname: "",
      lastname: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
   });

   const [fieldErrors, setFieldErrors] = useState({});
   const [globalError, setGlobalError] = useState("");
   const [loading, setLoading] = useState(false);

   // State for toggling password visibility
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   const navigate = useNavigate();
   const { isDarkMode } = useTheme();

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      setGlobalError("");
   };

   const handleSignup = async (e) => {
      e.preventDefault();

      const {
         firstname,
         lastname,
         email,
         username,
         password,
         confirmPassword,
      } = formData;

      const newErrors = {};

      if (!firstname) newErrors.firstname = "First name is required.";
      if (!lastname) newErrors.lastname = "Last name is required.";
      if (!email) newErrors.email = "Email is required.";
      if (!username) newErrors.username = "Username is required.";
      if (!password) newErrors.password = "Password is required.";
      if (password !== confirmPassword)
         newErrors.confirmPassword = "Passwords do not match.";

      if (Object.keys(newErrors).length > 0) {
         setFieldErrors(newErrors);
         return;
      }

      setLoading(true);

      try {
         const response = await fetch("http://localhost:8080/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               firstName: firstname,
               lastName: lastname,
               username,
               email,
               password,
               confirmPassword,
            }),
         });

         const data = await response.json();

         if (response.status === 200) {
            toast.success("✅ Signup successful!", {
               position: "top-right",
               autoClose: 1000,
               theme: "colored",
            });
            setTimeout(() => {
               navigate("/login");
            }, 1000);
         } else if (response.status === 400 && data.errors) {
            setFieldErrors(data.errors);
         } else {
            toast.error(data.message || "❌ Signup failed.", {
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

   const inputClass = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
      isDarkMode
         ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
         : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
   }`;

   const errorText = (msg) => (
      <p className="text-red-500 text-sm mt-1">{msg}</p>
   );

   return (
      <div
         className={`flex items-center justify-center min-h-screen transition-colors duration-200 ${
            isDarkMode
               ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
               : "bg-gradient-to-br from-purple-100 to-blue-200"
         }`}
      >
         {/* Dark Mode Toggle - Positioned absolutely in top right */}
         <div className="absolute top-4 right-4 z-10">
            <DarkModeToggle />
         </div>

         <div
            className={`p-8 rounded-xl shadow-lg w-full max-w-md transition-colors duration-200 ${
               isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}
         >
            <h2
               className={`text-2xl font-bold text-center mb-6 transition-colors duration-200 ${
                  isDarkMode ? "text-purple-400" : "text-purple-700"
               }`}
            >
               Create an Account
            </h2>

            {globalError && (
               <p className="text-red-600 text-center text-sm mb-4">
                  {globalError}
               </p>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label
                        className={`block text-sm font-medium mb-1 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                     >
                        First Name
                     </label>
                     <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        className={inputClass}
                     />
                     {fieldErrors.firstname && errorText(fieldErrors.firstname)}
                  </div>
                  <div>
                     <label
                        className={`block text-sm font-medium mb-1 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                     >
                        Last Name
                     </label>
                     <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        className={inputClass}
                     />
                     {fieldErrors.lastname && errorText(fieldErrors.lastname)}
                  </div>
               </div>

               <div>
                  <label
                     className={`block text-sm font-medium mb-1 transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                     }`}
                  >
                     Email
                  </label>
                  <input
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleChange}
                     className={inputClass}
                  />
                  {fieldErrors.email && errorText(fieldErrors.email)}
               </div>

               <div>
                  <label
                     className={`block text-sm font-medium mb-1 transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                     }`}
                  >
                     Username
                  </label>
                  <input
                     type="text"
                     name="username"
                     value={formData.username}
                     onChange={handleChange}
                     className={inputClass}
                  />
                  {fieldErrors.username && errorText(fieldErrors.username)}
               </div>

               {/* Password input with eye icon */}
               <div>
                  <label
                     className={`block text-sm font-medium mb-1 transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                     }`}
                  >
                     Password
                  </label>
                  <div className="relative">
                     <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={inputClass}
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
                  {fieldErrors.password && errorText(fieldErrors.password)}
               </div>

               {/* Confirm Password input with eye icon */}
               <div>
                  <label
                     className={`block text-sm font-medium mb-1 transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                     }`}
                  >
                     Confirm Password
                  </label>
                  <div className="relative">
                     <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={inputClass}
                     />
                     <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                           isDarkMode
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-500 hover:text-gray-700"
                        }`}
                        tabIndex={-1}
                     >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                     </button>
                  </div>
                  {fieldErrors.confirmPassword &&
                     errorText(fieldErrors.confirmPassword)}
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                     isDarkMode
                        ? "bg-purple-700 hover:bg-purple-800 text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
               >
                  {loading ? "Signing up..." : "Sign Up"}
               </button>

               <div
                  className={`text-sm text-center mt-4 transition-colors duration-200 ${
                     isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
               >
                  Already have an account?{" "}
                  <button
                     type="button"
                     onClick={() => navigate("/login")}
                     className={`font-medium hover:underline transition-colors duration-200 ${
                        isDarkMode
                           ? "text-purple-400 hover:text-purple-300"
                           : "text-purple-600 hover:text-purple-700"
                     }`}
                  >
                     Login
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}

export default Signup;
