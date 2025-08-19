import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext.jsx";
import { BASE_URL } from "../utils/constants.js";

const statusOptions = ["ACTIVE", "INACTIVE"];

const UpdateCommittee = () => {
   const { isDarkMode } = useTheme();
   const navigate = useNavigate();
   const { committeeId } = useParams();

   const [loading, setLoading] = useState(true);
   const [initial, setInitial] = useState(null);

   const [name, setName] = useState("");
   const [description, setDescription] = useState("");
   const [status, setStatus] = useState(statusOptions[0]);
   const [maximumNumberOfMeetings, setMaximumNumberOfMeetings] = useState("");

   useEffect(() => {
      (async () => {
         try {
            const res = await fetch(
               `${BASE_URL}/api/getCommitteeDetails?committeeId=${committeeId}`,
               { method: "GET", credentials: "include" }
            );
            if (!res.ok)
               throw new Error(`Failed to load committee ${committeeId}`);
            const data = await res.json();
            const c = data?.mainBody || {};
            const init = {
               id: Number(committeeId),
               name: c.name || "",
               description: c.description || "",
               status: c.status || statusOptions[0],
               maximumNumberOfMeetings:
                  c.maximumNumberOfMeetings || c.maxNoOfMeetings || "",
            };
            setInitial(init);
            setName(init.name);
            setDescription(init.description);
            setStatus(init.status);
            setMaximumNumberOfMeetings(init.maximumNumberOfMeetings);
         } catch (e) {
            console.error(e);
            toast.error("Failed to load committee details");
            navigate(-1);
         } finally {
            setLoading(false);
         }
      })();
   }, [committeeId, navigate]);

   const handleBackToCommittees = () => navigate(-1);

   const buildPayload = useMemo(() => {
      return () => {
         const payload = { id: Number(committeeId) };
         if (!initial) return payload;

         const trimmedName = name.trim();
         const trimmedDesc = description.trim();
         const maxMeetNum =
            maximumNumberOfMeetings === ""
               ? ""
               : Number(maximumNumberOfMeetings);

         if (trimmedName && trimmedName !== initial.name)
            payload.name = trimmedName;
         if (trimmedDesc && trimmedDesc !== initial.description)
            payload.description = trimmedDesc;
         if (status && status !== initial.status) payload.status = status;
         if (
            maxMeetNum !== "" &&
            Number.isInteger(maxMeetNum) &&
            maxMeetNum > 0 &&
            maxMeetNum !== initial.maximumNumberOfMeetings
         ) {
            payload.maximumNumberOfMeetings = maxMeetNum;
         }
         return payload;
      };
   }, [
      committeeId,
      description,
      initial,
      maximumNumberOfMeetings,
      name,
      status,
   ]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!initial) return;

      // Basic validations
      if (!name.trim()) {
         toast.error("Please enter a committee name");
         return;
      }

      if (!description.trim()) {
         toast.error("Please enter a committee description/aim");
         return;
      }

      const payload = buildPayload();

      // If only id present and nothing changed, warn and exit
      if (Object.keys(payload).length <= 1) {
         toast.info("No changes to update");
         return;
      }

      try {
         const response = await axios.post(
            `${BASE_URL}/api/updateCommitteeDetails`,
            payload,
            {
               headers: { "Content-Type": "application/json" },
               withCredentials: true,
            }
         );
         if (response.status === 200 || response.status === 201) {
            toast.success("Committee updated successfully");
            navigate(`/committee/${committeeId}`);
         } else {
            toast.error("Failed to update committee");
         }
      } catch (error) {
         console.error("Update committee error:", error);
         toast.error(
            error.response?.data?.message || "An error occurred during update"
         );
      }
   };

   if (loading) {
      return (
         <div
            className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
               isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
         >
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
               <p
                  className={`transition-colors duration-200 ${
                     isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
               >
                  {/* Loading committee details... */}
               </p>
            </div>
         </div>
      );
   }

   return (
      <div
         className={`min-h-screen flex flex-col transition-colors duration-200 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-50"
         }`}
      >
         <div className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
               <button
                  onClick={handleBackToCommittees}
                  className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
               >
                  <ArrowLeft size={16} /> Back
               </button>

               <div
                  className={`rounded-xl shadow-lg border p-6 space-y-6 transition-colors duration-200 ${
                     isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                  }`}
               >
                  <div
                     className={`border-b pb-3 transition-colors duration-200 ${
                        isDarkMode ? "border-gray-600" : "border-gray-200"
                     }`}
                  >
                     <h2
                        className={`text-2xl font-bold transition-colors duration-200 ${
                           isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                     >
                        Update Committee
                     </h2>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                     <div>
                        <label
                           className={`block mb-1 font-semibold transition-colors duration-200 ${
                              isDarkMode ? "text-green-400" : "text-green-600"
                           }`}
                        >
                           Name <span className="text-red-500">*</span>
                        </label>
                        <input
                           className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                              isDarkMode
                                 ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                 : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                           }`}
                           placeholder="Committee name"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           required
                        />
                     </div>

                     <div>
                        <label
                           className={`block mb-1 font-semibold transition-colors duration-200 ${
                              isDarkMode ? "text-green-400" : "text-green-600"
                           }`}
                        >
                           Description/Aim{" "}
                           <span className="text-red-500">*</span>
                        </label>
                        <textarea
                           className={`w-full border p-2 rounded min-h-[90px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                              isDarkMode
                                 ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                 : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                           }`}
                           placeholder="Description is for the minutes"
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                           required
                        />
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label
                              className={`block mb-1 font-semibold transition-colors duration-200 ${
                                 isDarkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                           >
                              Status
                           </label>
                           <select
                              className={`w-full border p-2 rounded transition-colors duration-200 ${
                                 isDarkMode
                                    ? "border-gray-600 bg-gray-700 text-gray-200"
                                    : "border-gray-300 bg-white text-gray-900"
                              }`}
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                           >
                              {statusOptions.map((s) => (
                                 <option key={s} value={s}>
                                    {s}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label
                              className={`block mb-1 font-semibold transition-colors duration-200 ${
                                 isDarkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                           >
                              Maximum No. of Meetings
                           </label>
                           <input
                              type="number"
                              min="1"
                              step="1"
                              className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                 isDarkMode
                                    ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                              }`}
                              placeholder="e.g., 12"
                              value={maximumNumberOfMeetings}
                              onChange={(e) =>
                                 setMaximumNumberOfMeetings(e.target.value)
                              }
                           />
                        </div>
                     </div>

                     <div className="flex justify-end gap-3 pt-2">
                        <button
                           type="button"
                           onClick={() => navigate(-1)}
                           className={`border px-4 py-2 rounded transition-colors duration-200 ${
                              isDarkMode
                                 ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                                 : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"
                           }`}
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                           Update
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
};

export default UpdateCommittee;
