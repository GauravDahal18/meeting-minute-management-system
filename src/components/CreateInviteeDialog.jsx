import React, { useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import axios from "axios";

const CreateInviteeDialog = ({ isOpen, onClose, onInviteeCreated }) => {
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
         <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center border-b p-4">
               <h2 className="text-xl font-bold text-gray-800">
                  Create New Invitee
               </h2>
               <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
               >
                  <X size={20} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               {/* First Name & Last Name side by side */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block mb-1 font-semibold text-gray-700">
                        First Name (English) *
                     </label>
                     <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter first name"
                        required
                     />
                  </div>

                  <div>
                     <label className="block mb-1 font-semibold text-gray-700">
                        Last Name (English) *
                     </label>
                     <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter last name"
                        required
                     />
                  </div>
               </div>

               {/* First Name (Nepali) & Last Name (Nepali) side by side */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block mb-1 font-semibold text-gray-700">
                        First Name (Nepali) *
                     </label>
                     <input
                        type="text"
                        value={firstNameNepali}
                        onChange={(e) => setFirstNameNepali(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                     <label className="block mb-1 font-semibold text-gray-700">
                        Last Name (Nepali) *
                     </label>
                     <input
                        type="text"
                        value={lastNameNepali}
                        onChange={(e) => setLastNameNepali(e.target.value)}
                        className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

               {/* Email */}
               <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                     Email (Optional)
                  </label>
                  <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="ram.shrestha@example.com"
                  />
               </div>

               {/* Institution - Typeable */}
               <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                     Institution *
                  </label>
                  <input
                     type="text"
                     value={institution}
                     onChange={(e) => setInstitution(e.target.value)}
                     className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="Pulchowk Campus, IOE"
                     required
                  />
               </div>

               {/* Post - Typeable in Nepali */}
               <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                     Post (Nepali) *
                  </label>
                  <input
                     type="text"
                     value={post}
                     onChange={(e) => setPost(e.target.value)}
                     className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="प्रोफेसर, डाक्टर"
                     required
                  />
               </div>

               {/* Note about required fields */}
               <div className="text-xs text-gray-500">
                  * Fields marked with an asterisk are required
               </div>

               {/* Buttons */}
               <div className="flex justify-between pt-4">
                  <button
                     type="button"
                     onClick={onClose}
                     className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-200 transition-colors"
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
