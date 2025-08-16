import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Trash2, Search, Edit, UserPlus } from "lucide-react";
import { BASE_URL } from "../utils/constants.js";
import { useTheme } from "../context/ThemeContext.jsx";
import CreateInviteeDialog from './CreateInviteeDialog';

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

   // Invitee management state
   const [allMembers, setAllMembers] = useState([]);
   const [availableMembers, setAvailableMembers] = useState([]);
   const [invitees, setInvitees] = useState([]);
   const [existingInvitees, setExistingInvitees] = useState([]);
   const [addedInviteeIds, setAddedInviteeIds] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [isSavingInvitees, setIsSavingInvitees] = useState(false);
   const [isCreateInviteeDialogOpen, setIsCreateInviteeDialogOpen] = useState(false);

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
               console.log("Agendas from backend:", data.mainBody?.agendas);
               console.log("Decisions from backend:", data.mainBody?.decisions);

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

               // Set existing invitees from the API response
               setExistingInvitees(data.mainBody?.invitees || []);

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

         // Set existing invitees from navigation state
         setExistingInvitees(meetingData.invitees || []);
         setCommittee(location.state.committee);
      } else {
         // Fetch meeting data if not provided in state
         fetchMeetingData();
      }
   }, [meetingId, committeeId, location.state, navigate]);

   // Fetch members function (moved outside useEffect to be reusable)
   const fetchMembers = async () => {
      try {
         // Fetch all members
         const allMembersResponse = await fetch(
            `${BASE_URL}/api/getAllMembers`,
            {
               method: "GET",
               credentials: "include",
            }
         );
         if (allMembersResponse.ok) {
            const allMembersData = await allMembersResponse.json();
            setAllMembers(allMembersData.mainBody || []);
         }

         // Fetch committee members
         const committeeResponse = await fetch(
            `${BASE_URL}/api/getCommitteeDetails?committeeId=${committeeId}`,
            {
               method: "GET",
               credentials: "include",
            }
         );
         if (committeeResponse.ok) {
            const committeeData = await committeeResponse.json();
            const members = committeeData?.mainBody?.members || [];
            setAvailableMembers(
               members.map((m) => ({
                  id: m.id ?? m.memberId ?? m.userId ?? Math.random(),
                  name: `${m.firstName} ${m.lastName}`,
                  role: m.role || "",
               }))
            );
         }
      } catch (error) {
         console.error("Failed to load members:", error);
      }
   };

   // Fetch members for invitee management
   useEffect(() => {
      fetchMembers();
   }, [committeeId]);

   // Calculate invitees (all members minus committee members minus existing invitees)
   useEffect(() => {
      if (allMembers.length > 0 && availableMembers.length > 0) {
         const committeeMemberIds = availableMembers.map((m) => m.id);
         const existingInviteeIds = existingInvitees.map(
            (m) => m.memberId || m.id || m.userId
         );

         const availableInvitees = allMembers
            .filter((member) => {
               const memberId = member.id ?? member.memberId ?? member.userId;
               const isCommitteeMember = committeeMemberIds.includes(memberId);
               const isExistingInvitee = existingInviteeIds.includes(memberId);

               return !isCommitteeMember && !isExistingInvitee;
            })
            .map((m) => ({
               id: m.id ?? m.memberId ?? m.userId ?? Math.random(),
               name: `${m.firstName} ${m.lastName}`,
               role: m.role || "",
            }));

         setInvitees(availableInvitees);
      }
   }, [allMembers, availableMembers, existingInvitees]);

   // Filter invitees based on search term
   const filteredInvitees = invitees.filter((member) =>
      member.name.toLowerCase().startsWith(searchTerm.toLowerCase())
   );

   // Invitee management functions
   const addInvitee = (id) => {
      if (!addedInviteeIds.includes(id)) {
         setAddedInviteeIds((prev) => [...prev, id]);
      }
      setSearchTerm("");
   };

   const removeInvitee = (id) => {
      setAddedInviteeIds((prev) =>
         prev.filter((inviteeId) => inviteeId !== id)
      );
   };

   const handleSaveInvitees = async () => {
      try {
         setIsSavingInvitees(true);
         const response = await fetch(
            `${BASE_URL}/api/addInviteesToMeeting?committeeId=${committeeId}&meetingId=${meetingId}`,
            {
               method: "POST",
               credentials: "include",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(addedInviteeIds),
            }
         );

         if (response.ok) {
            toast.success("Invitees added successfully");

            // Move newly added invitees to existing invitees list
            const newlyAddedInvitees = addedInviteeIds
               .map((id) => {
                  const invitee = invitees.find((m) => m.id === id);
                  if (invitee) {
                     return {
                        memberId: invitee.id,
                        firstName: invitee.name.split(" ")[0] || "",
                        lastName:
                           invitee.name.split(" ").slice(1).join(" ") || "",
                        name: invitee.name,
                        role: invitee.role || null,
                     };
                  }
                  return null;
               })
               .filter(Boolean);

            // Add to existing invitees
            setExistingInvitees((prev) => [...prev, ...newlyAddedInvitees]);

            // Clear added invitees after successful save
            setAddedInviteeIds([]);
         } else {
            const errorData = await response.json().catch(() => null);
            toast.error(errorData?.message || "Failed to add invitees");
         }
      } catch (error) {
         console.error("Error adding invitees:", error);
         toast.error("An error occurred while adding invitees");
      } finally {
         setIsSavingInvitees(false);
      }
   };

   const handleRemoveExistingInvitee = async (invitee) => {
      console.log("handleRemoveExistingInvitee called with:", invitee);
      try {
         const memberId = invitee.memberId || invitee.id || invitee.userId;
         console.log("Removing invitee with memberId:", memberId);

         const response = await fetch(
            `${BASE_URL}/api/removeInviteeFromMeeting?committeeId=${committeeId}&meetingId=${meetingId}&memberId=${memberId}`,
            {
               method: "POST",
               credentials: "include",
            }
         );

         console.log("Remove invitee response:", response.status, response.ok);

         if (response.ok) {
            toast.success("Invitee removed successfully");
            // Remove from existing invitees
            setExistingInvitees((prev) =>
               prev.filter(
                  (inv) => (inv.memberId || inv.id || inv.userId) !== memberId
               )
            );
         } else {
            const errorData = await response.json().catch(() => null);
            toast.error(errorData?.message || "Failed to remove invitee");
         }
      } catch (error) {
         console.error("Error removing invitee:", error);
         toast.error("An error occurred while removing invitee");
      }
   };

   const handleInviteeCreated = () => {
      // Refresh member lists when a new invitee is created
      fetchMembers();
      setIsCreateInviteeDialogOpen(false);
      toast.success("Invitee created successfully!");
   };

   const handleSave = async () => {
      try {
         setIsLoading(true);
         console.log("Sending meeting data:", JSON.stringify(meeting, null, 2));
         console.log("Agendas being sent:", meeting.agendas);
         console.log("Decisions being sent:", meeting.decisions);

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
         agendas: [...prev.agendas, { agenda: "" }], // New agenda without ID will be treated as new by backend
      }));
   };

   const handleRemoveAgenda = (index) => {
      console.log(`Removing agenda at index ${index}`);
      console.log(`Total agendas before removal: ${meeting.agendas.length}`);
      console.log(
         `This is ${
            meeting.agendas.length === 1
               ? "the LAST agenda"
               : "not the last agenda"
         }`
      );

      setMeeting((prev) => {
         const removedAgenda = prev.agendas[index];
         console.log("Removing agenda:", removedAgenda);
         const updatedAgendas = prev.agendas.filter((_, i) => i !== index);
         console.log("Remaining agendas after removal:", updatedAgendas);
         console.log(`Agendas count after removal: ${updatedAgendas.length}`);

         return {
            ...prev,
            agendas: updatedAgendas,
         };
      });
   };

   const handleAgendaChange = (index, value) => {
      console.log(`Changing agenda at index ${index} to: "${value}"`);
      setMeeting((prev) => {
         const updatedAgendas = prev.agendas.map((agenda, i) =>
            i === index ? { ...agenda, agenda: value } : agenda
         );
         console.log("Updated agendas:", updatedAgendas);
         return {
            ...prev,
            agendas: updatedAgendas,
         };
      });
   };

   const handleAddDecision = () => {
      setMeeting((prev) => ({
         ...prev,
         decisions: [...prev.decisions, { decision: "" }], // New decision without ID will be treated as new by backend
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
                  Loading meeting details...
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
            <div className="max-w-6xl mx-auto">
               <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
               >
                  <ArrowLeft size={16} />
                  Back
               </button>

               <div
                  className={`rounded-xl shadow-lg border p-6 transition-colors duration-200 ${
                     isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                  }`}
               >
                  <div
                     className={`mb-6 border-b pb-4 transition-colors duration-200 ${
                        isDarkMode ? "border-gray-700" : "border-gray-200"
                     }`}
                  >
                     <h2
                        className={`text-2xl font-bold transition-colors duration-200 ${
                           isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                     >
                        Edit Meeting
                     </h2>
                     <p
                        className={`text-sm mt-1 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                     >
                        Edit meeting details and manage invitees
                     </p>
                  </div>

                  <form className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
                     {/* Left: Invitees Selection */}
                     <div className="lg:col-span-1 space-y-4">
                        <div
                           className={`border rounded-lg p-4 space-y-4 transition-colors duration-200 ${
                              isDarkMode ? "border-gray-600" : "border-gray-400"
                           }`}
                        >
                           <div className="flex items-center justify-between gap-4">
                              <h3
                                 className={`text-lg font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-200"
                                       : "text-gray-800"
                                 }`}
                              >
                                 Select Invitees ({filteredInvitees.length})
                              </h3>
                              <button
                                 type="button"
                                 onClick={() => setIsCreateInviteeDialogOpen(true)}
                                 className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                              >
                                 <UserPlus className="h-3.5 w-3.5" />
                                 Create Invitee
                              </button>
                           </div>

                           {/* Search Box */}
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <Search
                                    className={`h-5 w-5 transition-colors duration-200 ${
                                       isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                    }`}
                                 />
                              </div>
                              <input
                                 type="text"
                                 placeholder="Search invitees..."
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                                 className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                       : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                 }`}
                              />
                           </div>

                           {/* Invitees List */}
                           <div
                              className={`border rounded-lg p-4 max-h-64 overflow-y-auto transition-colors duration-200 ${
                                 isDarkMode
                                    ? "border-gray-600"
                                    : "border-gray-200"
                              }`}
                           >
                              <ul className="space-y-3">
                                 {filteredInvitees
                                    .filter(
                                       (invitee) =>
                                          !addedInviteeIds.includes(invitee.id)
                                    )
                                    .map((invitee) => (
                                       <li
                                          key={invitee.id}
                                          className={`flex justify-between items-center p-3 border rounded-lg transition-colors ${
                                             isDarkMode
                                                ? "border-gray-600 hover:bg-gray-700"
                                                : "border-gray-200 hover:bg-gray-50"
                                          }`}
                                       >
                                          <span
                                             className={`transition-colors duration-200 ${
                                                isDarkMode
                                                   ? "text-gray-300"
                                                   : "text-gray-700"
                                             }`}
                                          >
                                             {invitee.name}
                                          </span>
                                          <button
                                             type="button"
                                             onClick={() =>
                                                addInvitee(invitee.id)
                                             }
                                             className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                                                isDarkMode
                                                   ? "bg-blue-900/40 text-blue-300 hover:bg-blue-800/60"
                                                   : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                             }`}
                                          >
                                             <span className="text-xl leading-none relative -top-[1px]">
                                                +
                                             </span>
                                          </button>
                                       </li>
                                    ))}
                                 {filteredInvitees.filter(
                                    (invitee) =>
                                       !addedInviteeIds.includes(invitee.id)
                                 ).length === 0 && (
                                    <li
                                       className={`text-center py-4 transition-colors duration-200 ${
                                          isDarkMode
                                             ? "text-gray-400"
                                             : "text-gray-500"
                                       }`}
                                    >
                                       {searchTerm
                                          ? `No invitees found matching "${searchTerm}"`
                                          : "All available members have been added"}
                                    </li>
                                 )}
                              </ul>
                           </div>

                           {/* Added Invitees Display */}
                           {addedInviteeIds.length > 0 && (
                              <div className="mt-6">
                                 <div className="flex justify-between items-center border-b pb-2 mb-3">
                                    <h4
                                       className={`text-md font-medium transition-colors duration-200 ${
                                          isDarkMode
                                             ? "text-gray-300"
                                             : "text-gray-600"
                                       }`}
                                    >
                                       Added Invitees
                                    </h4>
                                    <button
                                       type="button"
                                       onClick={handleSaveInvitees}
                                       disabled={
                                          isSavingInvitees ||
                                          addedInviteeIds.length === 0
                                       }
                                       className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                    >
                                       {isSavingInvitees ? "Saving..." : "Save"}
                                    </button>
                                 </div>
                                 <div
                                    className={`border rounded-lg p-3 max-h-32 overflow-y-auto transition-colors duration-200 ${
                                       isDarkMode
                                          ? "border-gray-600"
                                          : "border-gray-100"
                                    }`}
                                 >
                                    <ul className="space-y-1">
                                       {addedInviteeIds.map((id) => {
                                          const invitee = invitees.find(
                                             (m) => m.id === id
                                          );
                                          const inviteeName =
                                             invitee?.name || "Unknown";
                                          return (
                                             <li
                                                key={id}
                                                className="flex justify-between items-center py-1 px-2"
                                             >
                                                <span
                                                   className={`font-normal text-sm transition-colors duration-200 ${
                                                      isDarkMode
                                                         ? "text-gray-300"
                                                         : "text-gray-700"
                                                   }`}
                                                >
                                                   {inviteeName}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                   <button
                                                      onClick={() => {
                                                         const confirmEdit =
                                                            window.confirm(
                                                               "Are you sure you want to edit this member? Your progress in this form will be lost."
                                                            );
                                                         if (confirmEdit) {
                                                            navigate(
                                                               `/member/${id}/edit`
                                                            );
                                                         }
                                                      }}
                                                      className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                                                      title="Edit member"
                                                   >
                                                      <Edit size={14} />
                                                   </button>
                                                   <button
                                                      onClick={() =>
                                                         removeInvitee(id)
                                                      }
                                                      className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                                                      title="Remove from meeting"
                                                   >
                                                      <Trash2 size={14} />
                                                   </button>
                                                </div>
                                             </li>
                                          );
                                       })}
                                    </ul>
                                 </div>
                              </div>
                           )}

                           {/* Current Invitees Display */}
                           <div className="mt-6">
                              <h4
                                 className={`text-md font-medium border-b pb-2 mb-3 transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-300 border-gray-600"
                                       : "text-gray-600 border-gray-200"
                                 }`}
                              >
                                 Current Invitees ({existingInvitees.length})
                              </h4>
                              <div
                                 className={`border rounded-lg p-3 max-h-48 overflow-y-auto transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700"
                                       : "border-gray-100 bg-gray-50"
                                 }`}
                              >
                                 <ul className="space-y-1">
                                    {existingInvitees.length > 0 ? (
                                       existingInvitees.map(
                                          (invitee, index) => (
                                             <li
                                                key={invitee.id || index}
                                                className="flex justify-between items-center py-1 px-2"
                                             >
                                                <div className="flex justify-between items-center flex-1">
                                                   <span
                                                      className={`font-normal text-sm transition-colors duration-200 ${
                                                         isDarkMode
                                                            ? "text-gray-300"
                                                            : "text-gray-600"
                                                      }`}
                                                   >
                                                      {invitee.firstName &&
                                                      invitee.lastName
                                                         ? `${invitee.firstName} ${invitee.lastName}`
                                                         : invitee.name ||
                                                           "Unknown Invitee"}
                                                   </span>
                                                   {invitee.role && (
                                                      <span
                                                         className={`font-normal text-xs transition-colors duration-200 ${
                                                            isDarkMode
                                                               ? "text-gray-500"
                                                               : "text-gray-400"
                                                         }`}
                                                      >
                                                         {invitee.role}
                                                      </span>
                                                   )}
                                                </div>
                                                <button
                                                   type="button"
                                                   onClick={() =>
                                                      handleRemoveExistingInvitee(
                                                         invitee
                                                      )
                                                   }
                                                   className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors cursor-pointer ml-2"
                                                   title="Remove from meeting"
                                                >
                                                   <Trash2 size={14} />
                                                </button>
                                             </li>
                                          )
                                       )
                                    ) : (
                                       <li
                                          className={`text-center py-4 text-sm transition-colors duration-200 ${
                                             isDarkMode
                                                ? "text-gray-500"
                                                : "text-gray-400"
                                          }`}
                                       >
                                          No existing invitees found
                                       </li>
                                    )}
                                 </ul>
                              </div>
                           </div>

                           {/* Committee Members Display */}
                           <div className="mt-6">
                              <h4
                                 className={`text-md font-medium border-b pb-2 mb-3 transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-300 border-gray-600"
                                       : "text-gray-600 border-gray-200"
                                 }`}
                              >
                                 Committee Members ({availableMembers.length})
                              </h4>
                              <div
                                 className={`border rounded-lg p-3 transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700"
                                       : "border-gray-100 bg-gray-50"
                                 }`}
                              >
                                 <ul className="space-y-1">
                                    {availableMembers.map((member) => (
                                       <li
                                          key={member.id}
                                          className="flex justify-between items-center py-1 px-2"
                                       >
                                          <div className="flex justify-between items-center flex-1">
                                             <span
                                                className={`font-normal text-sm transition-colors duration-200 ${
                                                   isDarkMode
                                                      ? "text-gray-400"
                                                      : "text-gray-500"
                                                }`}
                                             >
                                                {member.name}
                                             </span>
                                             {member.role && (
                                                <span
                                                   className={`font-normal text-xs transition-colors duration-200 ${
                                                      isDarkMode
                                                         ? "text-gray-500"
                                                         : "text-gray-400"
                                                   }`}
                                                >
                                                   {member.role}
                                                </span>
                                             )}
                                          </div>
                                       </li>
                                    ))}
                                    {availableMembers.length === 0 && (
                                       <li
                                          className={`text-center py-4 text-sm transition-colors duration-200 ${
                                             isDarkMode
                                                ? "text-gray-500"
                                                : "text-gray-400"
                                          }`}
                                       >
                                          No committee members found
                                       </li>
                                    )}
                                 </ul>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Right: Meeting Details */}
                     <div className="lg:col-span-2">
                        <div
                           className={`border rounded-lg p-6 space-y-6 transition-colors duration-200 ${
                              isDarkMode ? "border-gray-600" : "border-gray-400"
                           }`}
                        >
                           <div>
                              <label
                                 className={`block mb-2 font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-300"
                                       : "text-gray-700"
                                 }`}
                              >
                                 Committee
                              </label>
                              <select
                                 className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-200"
                                       : "border-gray-300 bg-white text-gray-700"
                                 }`}
                                 disabled
                              >
                                 <option>
                                    {committee?.name || "My Own Committee"}
                                 </option>
                              </select>
                           </div>

                           <div>
                              <label
                                 className={`block mb-2 font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-300"
                                       : "text-gray-700"
                                 }`}
                              >
                                 Meeting Title *
                              </label>
                              <input
                                 type="text"
                                 placeholder="e.g., Monthly Progress Meeting"
                                 value={meeting.title}
                                 onChange={(e) =>
                                    setMeeting((prev) => ({
                                       ...prev,
                                       title: e.target.value,
                                    }))
                                 }
                                 className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                       : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"
                                 }`}
                                 required
                              />
                           </div>

                           <div>
                              <label
                                 className={`block mb-2 font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-300"
                                       : "text-gray-700"
                                 }`}
                              >
                                 Description
                              </label>
                              <textarea
                                 placeholder="e.g., Review of project milestones and next steps"
                                 value={meeting.description}
                                 onChange={(e) =>
                                    setMeeting((prev) => ({
                                       ...prev,
                                       description: e.target.value,
                                    }))
                                 }
                                 className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                       : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"
                                 }`}
                                 rows={3}
                              />
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                 <label
                                    className={`block mb-2 font-semibold transition-colors duration-200 ${
                                       isDarkMode
                                          ? "text-green-400"
                                          : "text-green-600"
                                    }`}
                                 >
                                    Date *
                                 </label>
                                 <input
                                    type="date"
                                    required
                                    value={meeting.heldDate}
                                    onChange={(e) =>
                                       setMeeting((prev) => ({
                                          ...prev,
                                          heldDate: e.target.value,
                                       }))
                                    }
                                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                       isDarkMode
                                          ? "border-gray-600 bg-gray-700 text-gray-200"
                                          : "border-gray-300 bg-white text-gray-700"
                                    }`}
                                 />
                              </div>

                              <div>
                                 <label
                                    className={`block mb-2 font-semibold transition-colors duration-200 ${
                                       isDarkMode
                                          ? "text-green-400"
                                          : "text-green-600"
                                    }`}
                                 >
                                    Time *
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
                                    className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                       isDarkMode
                                          ? "border-gray-600 bg-gray-700 text-gray-200"
                                          : "border-gray-300 bg-white text-gray-700"
                                    }`}
                                    required
                                 />
                              </div>
                           </div>

                           <div>
                              <label
                                 className={`block mb-2 font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-green-400"
                                       : "text-green-600"
                                 }`}
                              >
                                 Meeting Place *
                              </label>
                              <input
                                 type="text"
                                 placeholder="e.g., Conference Room B"
                                 value={meeting.heldPlace}
                                 onChange={(e) =>
                                    setMeeting((prev) => ({
                                       ...prev,
                                       heldPlace: e.target.value,
                                    }))
                                 }
                                 className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                       : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"
                                 }`}
                                 required
                              />
                           </div>

                           {/* Agenda Section */}
                           <div>
                              <label
                                 className={`block mb-2 font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-green-400"
                                       : "text-green-600"
                                 }`}
                              >
                                 Agenda Items
                              </label>
                              <div className="space-y-3">
                                 {meeting.agendas.map((agenda, idx) => (
                                    <div key={idx} className="flex gap-2">
                                       <textarea
                                          placeholder={`Agenda item ${idx + 1}`}
                                          value={agenda.agenda}
                                          onChange={(e) =>
                                             handleAgendaChange(
                                                idx,
                                                e.target.value
                                             )
                                          }
                                          className={`flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                             isDarkMode
                                                ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                                : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"
                                          }`}
                                          rows={2}
                                       />
                                       {meeting.agendas.length > 1 && (
                                          <button
                                             type="button"
                                             onClick={() =>
                                                handleRemoveAgenda(idx)
                                             }
                                             className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                                          >
                                             <Trash2 size={14} />
                                          </button>
                                       )}
                                    </div>
                                 ))}
                              </div>
                              <button
                                 type="button"
                                 onClick={handleAddAgenda}
                                 className={`flex items-center gap-2 text-sm font-medium transition-colors mt-2 ${
                                    isDarkMode
                                       ? "text-blue-400 hover:text-blue-300"
                                       : "text-blue-600 hover:text-blue-800"
                                 }`}
                              >
                                 <Plus size={16} /> Add agenda item
                              </button>
                           </div>

                           {/* Decisions Section */}
                           <div>
                              <label
                                 className={`block mb-2 font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-green-400"
                                       : "text-green-600"
                                 }`}
                              >
                                 Decisions Made
                              </label>
                              <div className="space-y-3">
                                 {meeting.decisions.map((decision, idx) => (
                                    <div key={idx} className="flex gap-2">
                                       <textarea
                                          placeholder={`Decision ${idx + 1}`}
                                          value={decision.decision}
                                          onChange={(e) =>
                                             handleDecisionChange(
                                                idx,
                                                e.target.value
                                             )
                                          }
                                          className={`flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                             isDarkMode
                                                ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                                : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"
                                          }`}
                                          rows={2}
                                       />
                                       {meeting.decisions.length > 1 && (
                                          <button
                                             type="button"
                                             onClick={() =>
                                                handleRemoveDecision(idx)
                                             }
                                             className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                                          >
                                             <Trash2 size={14} />
                                          </button>
                                       )}
                                    </div>
                                 ))}
                              </div>
                              <button
                                 type="button"
                                 onClick={handleAddDecision}
                                 className={`flex items-center gap-2 text-sm font-medium transition-colors mt-2 ${
                                    isDarkMode
                                       ? "text-blue-400 hover:text-blue-300"
                                       : "text-blue-600 hover:text-blue-800"
                                 }`}
                              >
                                 <Plus size={16} /> Add decision
                              </button>
                           </div>

                           <div className="flex justify-end gap-3 pt-6">
                              <button
                                 type="button"
                                 onClick={() =>
                                    navigate(`/committee/${committeeId}`)
                                 }
                                 className={`rounded-lg px-4 py-2 text-sm border transition-colors ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                                       : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                 }`}
                              >
                                 Cancel
                              </button>
                              <button
                                 type="button"
                                 onClick={handleSave}
                                 disabled={isLoading || !meeting.title.trim()}
                                 className="rounded-lg px-4 py-2 text-sm text-white transition-colors bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                 {isLoading ? "Updating..." : "Update Meeting"}
                              </button>
                           </div>
                        </div>
                     </div>
                  </form>
               </div>
            </div>
         </div>

         {/* Create Invitee Dialog */}
         <CreateInviteeDialog
            isOpen={isCreateInviteeDialogOpen}
            onClose={() => setIsCreateInviteeDialogOpen(false)}
            onInviteeCreated={handleInviteeCreated}
            committeeId={committeeId}
         />
      </div>
   );
};

export default EditMeeting;
