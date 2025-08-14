import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { BASE_URL } from "../utils/constants.js";
import { useTheme } from "../context/ThemeContext.jsx";

const EditMeeting = () => {
   const { committeeId, meetingId } = useParams();
   const location = useLocation();
   const navigate = useNavigate();
   const { isDarkMode } = useTheme();

   const [meeting, setMeeting] = useState({
      meetingId: meetingId,
      title: "",
      description: "",
      heldDate: "",
      heldTime: "",
      heldPlace: "",
      decisions: [],
      agendas: [],
   });

   const [isLoading, setIsLoading] = useState(false);
   const [committee, setCommittee] = useState(null);

   // Helper function to format date to YYYY-MM-DD
   const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      try {
         // Handle different date formats
         let date;
         if (dateString.includes(",")) {
            // Handle format like "2025,8,15"
            const parts = dateString.split(",").map((p) => parseInt(p.trim()));
            date = new Date(parts[0], parts[1] - 1, parts[2]); // month is 0-indexed
         } else if (dateString.includes("/")) {
            // Handle format like "8/15/2025" or "15/8/2025"
            date = new Date(dateString);
         } else {
            // Try to parse as-is
            date = new Date(dateString);
         }

         if (isNaN(date.getTime())) return "";

         const year = date.getFullYear();
         const month = String(date.getMonth() + 1).padStart(2, "0");
         const day = String(date.getDate()).padStart(2, "0");
         return `${year}-${month}-${day}`;
      } catch (error) {
         console.error("Error formatting date:", error);
         return "";
      }
   };

   // Helper function to format time to HH:MM
   const formatTimeForInput = (timeString) => {
      console.log(
         "formatTimeForInput input:",
         timeString,
         "type:",
         typeof timeString
      );
      if (!timeString) return "";
      try {
         // Convert to string if it's not already
         const timeStr = String(timeString);

         // Handle format like "15,38"
         if (timeStr.includes(",")) {
            const parts = timeStr.split(",").map((p) => parseInt(p.trim()));
            const hours = String(parts[0]).padStart(2, "0");
            const minutes = String(parts[1]).padStart(2, "0");
            const result = `${hours}:${minutes}`;
            console.log("formatTimeForInput comma format result:", result);
            return result;
         }
         // Handle format like "15:38" (already correct)
         if (timeStr.includes(":")) {
            const parts = timeStr.split(":");
            const hours = String(parseInt(parts[0])).padStart(2, "0");
            const minutes = String(parseInt(parts[1])).padStart(2, "0");
            const result = `${hours}:${minutes}`;
            console.log("formatTimeForInput colon format result:", result);
            return result;
         }
         // Handle format like "1538" (no separator)
         if (timeStr.length === 4 && /^\d{4}$/.test(timeStr)) {
            const hours = timeStr.substring(0, 2);
            const minutes = timeStr.substring(2, 4);
            const result = `${hours}:${minutes}`;
            console.log("formatTimeForInput 4-digit format result:", result);
            return result;
         }
         console.log("formatTimeForInput no format matched, returning empty");
         return "";
      } catch (error) {
         console.error("Error formatting time:", error);
         return "";
      }
   };

   useEffect(() => {
      const fetchMeetingData = async () => {
         try {
            setIsLoading(true);
            const response = await fetch(
               `${BASE_URL}/api/getMeetingDetails?committeeId=${committeeId}&meetingId=${meetingId}`,
               {
                  method: "GET",
                  credentials: "include",
               }
            );

            if (response.ok) {
               const data = await response.json();
               console.log("Full API response:", data);
               console.log("heldTime value:", data.mainBody?.heldTime);
               console.log("heldDate value:", data.mainBody?.heldDate);

               setMeeting({
                  meetingId: meetingId,
                  title: data.mainBody?.title || "",
                  description: data.mainBody?.description || "",
                  heldDate: formatDateForInput(data.mainBody?.heldDate || ""),
                  heldTime: formatTimeForInput(data.mainBody?.heldTime || ""),
                  heldPlace: data.mainBody?.heldPlace || "",
                  decisions: data.mainBody?.decisions || [],
                  agendas: data.mainBody?.agendas || [],
               });

               console.log(data);
            } else {
               toast.error("Failed to fetch meeting details");
               navigate(`/committee/${committeeId}`);
            }
         } catch (error) {
            console.error("Error fetching meeting:", error);
            toast.error("An error occurred while fetching meeting details");
            navigate(`/committee/${committeeId}`);
         } finally {
            setIsLoading(false);
         }
      };

      // Get data from navigation state or fetch from API
      if (location.state?.meeting) {
         const meetingData = location.state.meeting;
         setMeeting({
            meetingId: meetingId,
            title: meetingData.title || "",
            description: meetingData.description || "",
            heldDate: formatDateForInput(meetingData.heldDate || ""),
            heldTime: formatTimeForInput(meetingData.heldTime || ""),
            heldPlace: meetingData.heldPlace || "",
            decisions: meetingData.decisions || [],
            agendas: meetingData.agendas || [],
         });
         setCommittee(location.state.committee);
      } else {
         // Fetch meeting data if not provided in state
         fetchMeetingData();
      }
   }, [meetingId, committeeId, location.state, navigate]);

   const handleSave = async () => {
      try {
         setIsLoading(true);
         const response = await fetch(`${BASE_URL}/api/updateMeetingDetails`, {
            method: "POST",
            credentials: "include",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(meeting),
         });

         if (response.ok) {
            toast.success("Meeting updated successfully");
            navigate(`/committee/${committeeId}`);
         } else {
            const errorData = await response.json().catch(() => null);
            toast.error(errorData?.message || "Failed to update meeting");
         }
      } catch (error) {
         console.error("Error updating meeting:", error);
         toast.error("An error occurred while updating the meeting");
      } finally {
         setIsLoading(false);
      }
   };

   const handleAddAgenda = () => {
      setMeeting((prev) => ({
         ...prev,
         agendas: [...prev.agendas, { agenda: "" }],
      }));
   };

   const handleRemoveAgenda = (index) => {
      setMeeting((prev) => ({
         ...prev,
         agendas: prev.agendas.filter((_, i) => i !== index),
      }));
   };

   const handleAgendaChange = (index, value) => {
      setMeeting((prev) => ({
         ...prev,
         agendas: prev.agendas.map((agenda, i) =>
            i === index ? { ...agenda, agenda: value } : agenda
         ),
      }));
   };

   const handleAddDecision = () => {
      setMeeting((prev) => ({
         ...prev,
         decisions: [...prev.decisions, { decision: "" }],
      }));
   };

   const handleRemoveDecision = (index) => {
      setMeeting((prev) => ({
         ...prev,
         decisions: prev.decisions.filter((_, i) => i !== index),
      }));
   };

   const handleDecisionChange = (index, value) => {
      setMeeting((prev) => ({
         ...prev,
         decisions: prev.decisions.map((decision, i) =>
            i === index ? { ...decision, decision: value } : decision
         ),
      }));
   };

   if (isLoading) {
      return (
         <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-50"
         }`}>
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
               <p className={`transition-colors duration-200 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
               }`}>Loading meeting details...</p>
            </div>
         </div>
      );
   }

   return (
      <div className={`min-h-screen transition-colors duration-200 ${
         isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
         <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
               <button
                  onClick={() => navigate(`/committee/${committeeId}`)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
               >
                  <ArrowLeft size={20} />
                  Back
               </button>
               <h1 className={`text-3xl font-bold transition-colors duration-200 ${
                  isDarkMode ? "text-gray-200" : "text-gray-900"
               }`}>
                  Edit Meeting
               </h1>
               {committee && (
                  <p className={`mt-2 transition-colors duration-200 ${
                     isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                     Committee: {committee.name}
                  </p>
               )}
            </div>

            {/* Form */}
            <div className={`rounded-lg shadow-sm p-6 transition-colors duration-200 ${
               isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
               <form className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                           Meeting Title *
                        </label>
                        <input
                           type="text"
                           value={meeting.title}
                           onChange={(e) =>
                              setMeeting((prev) => ({
                                 ...prev,
                                 title: e.target.value,
                              }))
                           }
                           className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                              isDarkMode 
                                 ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400" 
                                 : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                           }`}
                           placeholder="Enter meeting title"
                           required
                        />
                     </div>

                     <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                           Held Place
                        </label>
                        <input
                           type="text"
                           value={meeting.heldPlace}
                           onChange={(e) =>
                              setMeeting((prev) => ({
                                 ...prev,
                                 heldPlace: e.target.value,
                              }))
                           }
                           className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                              isDarkMode 
                                 ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400" 
                                 : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                           }`}
                           placeholder="Meeting location"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                           Date
                        </label>
                        <input
                           type="date"
                           value={meeting.heldDate}
                           onChange={(e) =>
                              setMeeting((prev) => ({
                                 ...prev,
                                 heldDate: e.target.value,
                              }))
                           }
                           className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                              isDarkMode 
                                 ? "border-gray-600 bg-gray-700 text-gray-200" 
                                 : "border-gray-300 bg-white text-gray-900"
                           }`}
                        />
                     </div>

                     <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                           Time
                        </label>
                        <input
                           type="time"
                           value={meeting.heldTime}
                           onChange={(e) =>
                              setMeeting((prev) => ({
                                 ...prev,
                                 heldTime: e.target.value,
                              }))
                           }
                           className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                              isDarkMode 
                                 ? "border-gray-600 bg-gray-700 text-gray-200" 
                                 : "border-gray-300 bg-white text-gray-900"
                           }`}
                        />
                     </div>
                  </div>

                  <div>
                     <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                     }`}>
                        Description
                     </label>
                     <textarea
                        rows={4}
                        value={meeting.description}
                        onChange={(e) =>
                           setMeeting((prev) => ({
                              ...prev,
                              description: e.target.value,
                           }))
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                           isDarkMode 
                              ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400" 
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder="Meeting description"
                     />
                  </div>

                  {/* Agendas Section */}
                  <div>
                     <div className="mb-4">
                        <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}>
                           Agendas
                        </h3>
                        <div className="space-y-3">
                           {meeting.agendas.map((agenda, index) => (
                              <div key={index} className="flex gap-3">
                                 <input
                                    type="text"
                                    value={agenda.agenda}
                                    onChange={(e) =>
                                       handleAgendaChange(index, e.target.value)
                                    }
                                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                       isDarkMode 
                                          ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400" 
                                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                    }`}
                                    placeholder={`Agenda ${index + 1}`}
                                 />
                                 <button
                                    type="button"
                                    onClick={() => handleRemoveAgenda(index)}
                                    className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           ))}
                           {meeting.agendas.length === 0 && (
                              <p className={`text-center py-8 rounded-lg transition-colors duration-200 ${
                                 isDarkMode 
                                    ? "text-gray-400 bg-gray-700" 
                                    : "text-gray-500 bg-gray-50"
                              }`}>
                                 No agendas added yet. Click "Add agenda item"
                                 to get started.
                              </p>
                           )}
                        </div>
                        <button
                           type="button"
                           onClick={handleAddAgenda}
                           className="flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors mt-2"
                        >
                           <Plus size={16} /> Add agenda item
                        </button>
                     </div>
                  </div>

                  {/* Spacer between Agendas and Decisions */}
                  <div className="my-6"></div>

                  {/* Decisions Section */}
                  <div>
                     <div className="mb-4">
                        <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}>
                           Decisions
                        </h3>
                        <div className="space-y-3">
                           {meeting.decisions.map((decision, index) => (
                              <div key={index} className="flex gap-3">
                                 <input
                                    type="text"
                                    value={decision.decision}
                                    onChange={(e) =>
                                       handleDecisionChange(
                                          index,
                                          e.target.value
                                       )
                                    }
                                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                       isDarkMode 
                                          ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400" 
                                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                    }`}
                                    placeholder={`Decision ${index + 1}`}
                                 />
                                 <button
                                    type="button"
                                    onClick={() => handleRemoveDecision(index)}
                                    className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           ))}
                           {meeting.decisions.length === 0 && (
                              <p className={`text-center py-8 rounded-lg transition-colors duration-200 ${
                                 isDarkMode 
                                    ? "text-gray-400 bg-gray-700" 
                                    : "text-gray-500 bg-gray-50"
                              }`}>
                                 No decisions added yet. Click "Add decision" to
                                 get started.
                              </p>
                           )}
                        </div>
                        <button
                           type="button"
                           onClick={handleAddDecision}
                           className="flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors mt-2"
                        >
                           <Plus size={16} /> Add decision
                        </button>
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-end pt-8">
                     <button
                        type="button"
                        onClick={() => navigate(`/committee/${committeeId}`)}
                        className={`px-6 py-3 rounded-lg transition-colors ${
                           isDarkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading || !meeting.title.trim()}
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                        {isLoading ? "Updating..." : "Update Meeting"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

export default EditMeeting;
