import React, { useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext.jsx";

const CreateInviteeDialog = ({ isOpen, onClose, onInviteeCreated }) => {
   const { isDarkMode } = useTheme();
   // Form fields
   const [firstName, setFirstName] = useState("");
   const [lastName, setLastName] = useState("");
   const [firstNameNepali, setFirstNameNepali] = useState("");
   const [lastNameNepali, setLastNameNepali] = useState("");
   const [email, setEmail] = useState("");
   const [institution, setInstitution] = useState("");
   const [post, setPost] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [showErrors, setShowErrors] = useState(false);

   if (!isOpen) return null;

   const handleSubmit = async (e) => {
      e.preventDefault();

      const isMissing =
         !firstName.trim() ||
         !lastName.trim() ||
         !firstNameNepali.trim() ||
         !lastNameNepali.trim() ||
         !institution.trim() ||
         !post.trim();

      if (isMissing) {
         setShowErrors(true);
         toast.error("Please fill all required fields");
         return;
      }

      setIsLoading(true);

      const payload = {
         firstName: firstName.trim(),
         lastName: lastName.trim(),
         firstNameNepali: firstNameNepali.trim(),
         lastNameNepali: lastNameNepali.trim(),
         institution: institution.trim(),
         post: post.trim(),
      };

      // Only include email if it's provided
      if (email.trim()) {
         payload.email = email.trim();
      }

      try {
         const response = await axios.post(
            "http://localhost:8080/api/createInvitee",
            payload,
            {
               headers: { "Content-Type": "application/json" },
               withCredentials: true,
            }
         );

         if (response.status === 200 || response.status === 201) {
            // Only notify parent component about successful creation with the complete response
            // The parent will handle the toast notification
            if (onInviteeCreated && typeof onInviteeCreated === "function") {
               // Pass the full response data which contains memberId and other details
               onInviteeCreated(response.data);
            }
            // Reset form
            setFirstName("");
            setLastName("");
            setFirstNameNepali("");
            setLastNameNepali("");
            setEmail("");
            setInstitution("");
            setPost("");
            setShowErrors(false);
            // Close dialog
            onClose();
         } else {
            toast.error("Failed to create invitee. Please try again.");
         }
      } catch (error) {
         console.error("Create invitee error:", error);
         toast.error(
            error.response?.data?.message ||
               "An error occurred. Please try again."
         );
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
         <div
            className={`rounded-lg shadow-xl w-full max-w-2xl transition-colors duration-200 ${
               isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
         >
            <div
               className={`flex justify-between items-center border-b p-4 transition-colors duration-200 ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
               }`}
            >
               <h2
                  className={`text-xl font-bold transition-colors duration-200 ${
                     isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
               >
                  Create New Invitee
               </h2>
               <button
                  onClick={onClose}
                  className={`transition-colors ${
                     isDarkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-500 hover:text-gray-700"
                  }`}
               >
                  <X size={20} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               {/* First Name & Last Name side by side */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label
                        className={`block mb-1 font-semibold transition-colors duration-200 ${
                           isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                     >
                        First Name *
                     </label>
                     <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                           isDarkMode
                              ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                              : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder="Enter first name"
                        required
                     />
                  </div>

                  <div>
                     <label
                        className={`block mb-1 font-semibold transition-colors duration-200 ${
                           isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                     >
                        Last Name *
                     </label>
                     <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                           isDarkMode
                              ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                              : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder="Enter last name"
                        required
                     />
                  </div>
               </div>

               {/* Separator line */}
               <div
                  className={`border-t pt-4 transition-colors duration-200 ${
                     isDarkMode ? "border-gray-600" : "border-gray-300"
                  }`}
               >
                  <p
                     className={`text-xs mb-4 transition-colors duration-200 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                     }`}
                  >
                     The following fields will be used in meeting minutes
                  </p>

                  {/* First Name (Nepali) & Last Name (Nepali) side by side */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div>
                        <label
                           className={`block mb-1 font-semibold transition-colors duration-200 ${
                              isDarkMode ? "text-green-400" : "text-green-600"
                           }`}
                        >
                           First Name (Nepali) *
                        </label>
                        <input
                           type="text"
                           value={firstNameNepali}
                           onChange={(e) => setFirstNameNepali(e.target.value)}
                           className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                              isDarkMode
                                 ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                 : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                           }`}
                           placeholder="राम"
                           required
                        />
                        {showErrors && !firstNameNepali.trim() && (
                           <p className="text-xs text-red-600 mt-1">
                              Required for minute generation
                           </p>
                        )}
                     </div>

                     <div>
                        <label
                           className={`block mb-1 font-semibold transition-colors duration-200 ${
                              isDarkMode ? "text-green-400" : "text-green-600"
                           }`}
                        >
                           Last Name (Nepali) *
                        </label>
                        <input
                           type="text"
                           value={lastNameNepali}
                           onChange={(e) => setLastNameNepali(e.target.value)}
                           className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                              isDarkMode
                                 ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                 : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                           }`}
                           placeholder="श्रेष्ठ"
                           required
                        />
                        {showErrors && !lastNameNepali.trim() && (
                           <p className="text-xs text-red-600 mt-1">
                              Required for minute generation
                           </p>
                        )}
                     </div>
                  </div>

                  {/* Post - Moved after Nepali names */}
                  <div>
                     <label
                        className={`block mb-1 font-semibold transition-colors duration-200 ${
                           isDarkMode ? "text-green-400" : "text-green-600"
                        }`}
                     >
                        Post (Nepali) *
                     </label>
                     <input
                        type="text"
                        value={post}
                        onChange={(e) => setPost(e.target.value)}
                        list="post-suggestions-invitee"
                        className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                           isDarkMode
                              ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                              : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder="डा., प्रा."
                        required
                     />
                     <datalist id="post-suggestions-invitee">
                        <option value="डा." />
                        <option value="प्रा." />
                     </datalist>
                  </div>
               </div>

               {/* Separator line */}
               <div
                  className={`border-t pt-4 transition-colors duration-200 ${
                     isDarkMode ? "border-gray-600" : "border-gray-300"
                  }`}
               />

               {/* Email */}
               <div>
                  <label
                     className={`block mb-1 font-semibold transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                     }`}
                  >
                     Email (Optional)
                  </label>
                  <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                        isDarkMode
                           ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                           : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                     }`}
                     placeholder="ram.shrestha@example.com"
                  />
               </div>

               {/* Institution - Typeable */}
               <div>
                  <label
                     className={`block mb-1 font-semibold transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                     }`}
                  >
                     Institution *
                  </label>
                  <input
                     type="text"
                     value={institution}
                     onChange={(e) => setInstitution(e.target.value)}
                     className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                        isDarkMode
                           ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                           : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                     }`}
                     placeholder="Pulchowk Campus, IOE"
                     required
                  />
               </div>

               {/* Note about required fields */}
               <div
                  className={`text-xs transition-colors duration-200 ${
                     isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
               ></div>

               {/* Buttons */}
               <div className="flex justify-between pt-4">
                  <button
                     type="button"
                     onClick={onClose}
                     className={`px-4 py-2 border rounded transition-colors ${
                        isDarkMode
                           ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                           : "border-gray-600 bg-white text-gray-700 hover:bg-gray-200"
                     }`}
                     disabled={isLoading}
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                     disabled={isLoading}
                  >
                     {isLoading ? "Creating..." : "Create"}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default CreateInviteeDialog;
