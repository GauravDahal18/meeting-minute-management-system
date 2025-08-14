import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X, Plus, ArrowLeft, Search, Trash2, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext.jsx";

import { getCommittees } from "../utils/GetAllCommittes";
import { getCommitteeDetails } from "../utils/GetCommitteeMembers";
import CreateInviteeDialog from "./CreateInviteeDialog";
import axios from "axios";

const CreateMeetingDialog = () => {
   const navigate = useNavigate();
   const { committeeId } = useParams();
   const { isAuthenticated, isAuthLoading } = useAuth();
   const { isDarkMode } = useTheme();

   // const [meetingDate, setMeetingDate] = useState(
   //   format(new Date(), "yyyy-MM-dd")
   // );
   // const [heldTime, setHeldTime] = useState("14:30:00");
   // const [meetingPlace, setMeetingPlace] = useState("");
   // const [title, setTitle] = useState("");
   // const [description, setDescription] = useState("");
   // const [decisions, setDecisions] = useState([""]);
   // const [agenda, setAgenda] = useState([""]);

   const [meetingDate, setMeetingDate] = useState(
      format(new Date(), "yyyy-MM-dd")
   );
   const [heldTime, setHeldTime] = useState("14:30:00");
   const [meetingPlace, setMeetingPlace] = useState("Pulchowk Campus");
   const [title, setTitle] = useState("Annual Planning Meeting");
   const [description, setDescription] = useState(
      "This meeting will discuss next year’s programs and budget plans."
   );
   const [decisions, setDecisions] = useState([
      "आगामी आर्थिक वर्षको प्रस्तावित बजेट योजनालाई आवश्यक संशोधनसहित स्वीकृत गर्ने।",
      "टिमको क्षमता र विविधता बढाउन नयाँ सदस्य भर्ती प्रक्रिया सुरु गर्ने।",
      "अगामी बैठकअघि प्रस्तावित परियोजनाहरू मूल्यांकन र स्वीकृत गर्न समिति गठन गर्ने।",
      "सञ्चालन दक्षता सुधार गर्न आधुनिक प्रविधि र उपकरणको प्रयोग सुरु गर्ने निर्णय गर्ने।",
   ]);
   const [agenda, setAgenda] = useState([
      "आगामी वर्षको वार्षिक कार्ययोजना प्रस्तुत र छलफल गर्ने।",
      "हालको बजेटको समीक्षा र नयाँ परियोजनाका लागि स्रोतको सुनिश्चितता गर्ने।",
      "समुदायसँगको पहुँच सुधार गर्न नयाँ कार्यक्रम प्रस्ताव प्रस्तुत गर्ने।",
      "गत वर्षको प्रदर्शन मूल्यांकन र सुधारका क्षेत्रहरू पहिचान गर्ने।",
   ]);

   const [allCommittees, setAllCommittees] = useState([]);
   const [availableMembers, setAvailableMembers] = useState([]);
   // newly added
   const [allMembers, setAllMembers] = useState([]);
   const [invitees, setInvitees] = useState([]);
   // Remove attendee logic, use addedInviteeIds for tracking
   const [addedInviteeIds, setAddedInviteeIds] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedInviteeId, setSelectedInviteeId] = useState("");
   const [isCreateInviteeDialogOpen, setIsCreateInviteeDialogOpen] =
      useState(false);

   const [loading, setLoading] = useState(true);

   console.log(
      "inviteee ids:",
      invitees.map((i) => i.id)
   );

   console.log("invitees are:", invitees);
   console.log("all members of the committee :", allMembers);

   useEffect(() => {
      console.log("CreateMeeting: Component mounted", { committeeId });
      if (!committeeId) {
         console.error("CreateMeeting: No committeeId provided");
         navigate("/home");
         return;
      }
      return () => {
         console.log("CreateMeeting: Component unmounted");
      };
   }, [committeeId, navigate]);

   useEffect(() => {
      (async () => {
         try {
            setAllCommittees(await getCommittees());

            // Fetch all members for invitees
            const response = await axios.get(
               "http://localhost:8080/api/getAllMembers",
               { withCredentials: true }
            );
            if (response.status === 200) {
               console.log("All members fetched:", response.data.mainBody);
               setAllMembers(response.data.mainBody);
            }
         } catch (err) {
            console.error("Failed to load committees or members:", err);
         }
      })();
   }, []);

   useEffect(() => {
      if (!committeeId) return;

      (async () => {
         try {
            const data = await getCommitteeDetails(committeeId);
            const members = data?.mainBody?.members || [];
            setAvailableMembers(
               members.map((m) => ({
                  id: m.id ?? m.memberId ?? m.userId ?? Math.random(),
                  name: `${m.firstName} ${m.lastName}`,
                  role: m.role || "",
               }))
            );
         } catch (err) {
            console.error("Failed to load committee members:", err);
         } finally {
            setLoading(false);
         }
      })();
   }, [committeeId]);

   // Calculate invitees (all members minus committee members)
   useEffect(() => {
      if (allMembers.length > 0 && availableMembers.length > 0) {
         const committeeMemberIds = availableMembers.map((m) => m.id);
         const availableInvitees = allMembers
            .filter((member) => {
               const memberId = member.id ?? member.memberId ?? member.userId;
               return !committeeMemberIds.includes(memberId);
            })
            .map((m) => ({
               id: m.id ?? m.memberId ?? m.userId ?? Math.random(),
               name: `${m.firstName} ${m.lastName}`,
               role: m.role || "",
            }));
         setInvitees(availableInvitees);
      }
   }, [allMembers, availableMembers]);

   // Filter invitees based on search term
   const filteredInvitees = invitees.filter((member) =>
      member.name.toLowerCase().startsWith(searchTerm.toLowerCase())
   );

   // Auto-select first invitee when searching
   useEffect(() => {
      if (searchTerm && filteredInvitees.length > 0) {
         setSelectedInviteeId(filteredInvitees[0].id);
      }
   }, [searchTerm, filteredInvitees]);

   console.log("CreateMeeting: Component rendering", { committeeId });

   // Don't render if no committeeId
   if (!committeeId) {
      return null;
   }

   const addDecisionRow = () => setDecisions((d) => [...d, ""]);
   const updateDecision = (idx, val) =>
      setDecisions((prev) => prev.map((d, i) => (i === idx ? val : d)));
   const removeDecision = (idx) =>
      setDecisions((prev) => prev.filter((_, i) => i !== idx));

   const addAgendaRow = () => setAgenda((a) => [...a, ""]);
   const updateAgenda = (idx, val) =>
      setAgenda((prev) => prev.map((a, i) => (i === idx ? val : a)));
   const removeAgenda = (idx) =>
      setAgenda((prev) => prev.filter((_, i) => i !== idx));

   const addInvitee = (id) => {
      if (!addedInviteeIds.includes(id)) {
         setAddedInviteeIds((prev) => [...prev, id]);
      }
      setSearchTerm("");
      setSelectedInviteeId("");
   };

   const removeInvitee = (id) => {
      setAddedInviteeIds((prev) =>
         prev.filter((inviteeId) => inviteeId !== id)
      );
   };

   const handleInviteeCreated = (newInvitee) => {
      // Extract the new invitee's ID and automatically add them to the selected invitees
      if (newInvitee && newInvitee.mainBody && newInvitee.mainBody.memberId) {
         const newInviteeId = newInvitee.mainBody.memberId;
         const firstName = newInvitee.mainBody.firstName;
         const lastName = newInvitee.mainBody.lastName;

         // Add the new invitee to the selected invitees list
         if (!addedInviteeIds.includes(newInviteeId)) {
            setAddedInviteeIds((prev) => [...prev, newInviteeId]);
            toast.success(
               `${firstName} ${lastName} created and added to meeting`
            );
         }
      }

      // Refresh the list of members to include the newly created invitee
      (async () => {
         try {
            const response = await axios.get(
               "http://localhost:8080/api/getAllMembers",
               { withCredentials: true }
            );
            if (response.status === 200) {
               setAllMembers(response.data.mainBody);
            }
         } catch (err) {
            console.error("Failed to refresh members list:", err);
         }
      })();
   };

   // Test authentication status
   const testAuth = async () => {
      try {
         const response = await fetch("http://localhost:8080/isAuthenticated", {
            method: "GET",
            credentials: "include",
         });
         console.log("Auth test response:", response.status, response.ok);
         return response.ok;
      } catch (error) {
         console.error("Auth test error:", error);
         return false;
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      // Check authentication status
      if (!isAuthenticated) {
         toast.error("You are not authenticated. Please log in again.");
         console.error("CreateMeeting: User not authenticated");
         return;
      }

      // Test authentication before proceeding
      const authOk = await testAuth();
      if (!authOk) {
         toast.error(
            "Authentication verification failed. Please log in again."
         );
         console.error("CreateMeeting: Authentication verification failed");
         return;
      }

      // Debug: Check cookies and session storage
      console.log("Cookies:", document.cookie);
      console.log("Session storage:", Object.keys(sessionStorage));
      console.log("Local storage:", Object.keys(localStorage));

      if (
         !committeeId ||
         !title.trim() ||
         !description.trim() ||
         !meetingPlace.trim()
      ) {
         toast.error("Please fill all required fields.");
         return;
      }

      // Filter out empty decisions and agenda items
      const filteredDecisions = decisions.filter((d) => d.trim());
      const filteredAgenda = agenda.filter((a) => a.trim());

      const payload = {
         title: title.trim(),
         description: description.trim(),
         heldDate: meetingDate,
         heldTime,
         heldPlace: meetingPlace.trim(),
         inviteeIds: addedInviteeIds,
         decisions: filteredDecisions,
         agendas: filteredAgenda,
      };

      console.log("Creating meeting with payload:", payload);
      console.log("Authentication status:", { isAuthenticated, isAuthLoading });
      console.log("Committee ID:", committeeId);
      console.log(
         "API endpoint:",
         `http://localhost:8080/api/createMeeting?committeeId=${committeeId}`
      );

      try {
         // Try the alternative endpoint structure first
         const response = await axios.post(
            `http://localhost:8080/api/createMeeting?committeeId=${committeeId}`,
            payload,
            {
               headers: {
                  "Content-Type": "application/json",
                  // Add Authorization header if needed
                  // "Authorization": `Bearer ${localStorage.getItem('token')}` // Uncomment if using JWT
               },
               withCredentials: true,
            }
         );

         if (response.status !== 200 && response.status !== 201) {
            throw new Error("Failed to create meeting.");
         }

         toast.success("Meeting created successfully!");
         navigate(-1);
      } catch (error) {
         console.error("Create meeting error:", error);
         console.error("Error response:", error.response);
         console.error("Error status:", error.response?.status);
         console.error("Error data:", error.response?.data);
         console.error("Error headers:", error.response?.headers);

         if (error.response?.status === 403) {
            toast.error(
               "Access forbidden. You may not have permission to create meetings for this committee."
            );
            console.error("403 Forbidden - Possible causes:");
            console.error("1. User not authenticated properly");
            console.error("2. User doesn't have permission for this committee");
            console.error("3. Session expired");
            console.error("4. Wrong API endpoint");
         } else if (error.response?.status === 401) {
            toast.error("Authentication failed. Please log in again.");
         } else {
            toast.error(
               error.response?.data?.message ||
                  error.message ||
                  "An error occurred while creating the meeting."
            );
         }
      }
   };

   const handleCancel = () => navigate(-1);

   const handleBackToCommittees = () => {
      navigate(-1);
   };

   if (loading || isAuthLoading) return null;

   return (
      <div
         className={`min-h-screen flex flex-col transition-colors duration-200 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-50"
         }`}
      >
         <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
               <button
                  onClick={handleBackToCommittees}
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
                        Create Meeting
                     </h2>
                     <p
                        className={`text-sm mt-1 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                     >
                        Fill in meeting details and select invitees
                     </p>
                     {!isAuthenticated && (
                        <p className="text-sm text-red-500 mt-1">
                           ⚠️ Authentication required
                        </p>
                     )}
                  </div>

                  <form
                     className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start"
                     onSubmit={handleSubmit}
                  >
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
                                 onClick={() =>
                                    setIsCreateInviteeDialogOpen(true)
                                 }
                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1.5"
                              >
                                 <UserPlus size={15} /> Create Invitee
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
                                 {filteredInvitees.length === 0 &&
                                    searchTerm && (
                                       <li
                                          className={`text-center py-4 transition-colors duration-200 ${
                                             isDarkMode
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                          }`}
                                       >
                                          No invitees found matching "
                                          {searchTerm}"
                                       </li>
                                    )}
                                 {filteredInvitees.length === 0 &&
                                    !searchTerm && (
                                       <li
                                          className={`text-center py-4 transition-colors duration-200 ${
                                             isDarkMode
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                          }`}
                                       >
                                          All external members are already
                                          committee members
                                       </li>
                                    )}
                              </ul>
                           </div>

                           {/* Added Invitees Display */}
                           {addedInviteeIds.length > 0 && (
                              <div className="mt-6">
                                 <h4
                                    className={`text-md font-medium border-b pb-2 mb-3 transition-colors duration-200 ${
                                       isDarkMode
                                          ? "text-gray-300 border-gray-600"
                                          : "text-gray-600 border-gray-200"
                                    }`}
                                 >
                                    Added Invitees
                                 </h4>
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
                                                <button
                                                   onClick={() =>
                                                      removeInvitee(id)
                                                   }
                                                   className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors cursor-pointer"
                                                >
                                                   <Trash2 size={14} />
                                                </button>
                                             </li>
                                          );
                                       })}
                                    </ul>
                                 </div>
                              </div>
                           )}

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
                                 className={`border rounded-lg p-3 max-h-48 overflow-y-auto transition-colors duration-200 ${
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
                                 value={committeeId}
                                 onChange={() => {}}
                                 className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-200"
                                       : "border-gray-300 bg-white text-gray-700"
                                 }`}
                                 disabled
                              >
                                 <option value="">
                                    -- Select committee --
                                 </option>
                                 {allCommittees.map((c) => (
                                    <option key={c.id} value={c.id}>
                                       {c.name}
                                    </option>
                                 ))}
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
                                 value={title}
                                 onChange={(e) => setTitle(e.target.value)}
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
                                 Description *
                              </label>
                              <textarea
                                 placeholder="e.g., Review of project milestones and next steps"
                                 value={description}
                                 onChange={(e) =>
                                    setDescription(e.target.value)
                                 }
                                 className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                       : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"
                                 }`}
                                 required
                                 rows={3}
                              />
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                 <label
                                    className={`block mb-2 font-semibold transition-colors duration-200 ${
                                       isDarkMode
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                    }`}
                                 >
                                    Date *
                                 </label>
                                 <input
                                    type="date"
                                    required
                                    value={meetingDate}
                                    onChange={(e) =>
                                       setMeetingDate(e.target.value)
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
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                    }`}
                                 >
                                    Time *
                                 </label>
                                 <input
                                    type="time"
                                    value={heldTime}
                                    onChange={(e) =>
                                       setHeldTime(e.target.value)
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
                                       ? "text-gray-300"
                                       : "text-gray-700"
                                 }`}
                              >
                                 Meeting Place *
                              </label>
                              <input
                                 type="text"
                                 placeholder="e.g., Conference Room B"
                                 value={meetingPlace}
                                 onChange={(e) =>
                                    setMeetingPlace(e.target.value)
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
                                       ? "text-gray-300"
                                       : "text-gray-700"
                                 }`}
                              >
                                 Agenda Items
                              </label>
                              <div className="space-y-3">
                                 {agenda.map((item, idx) => (
                                    <div key={idx} className="flex gap-2">
                                       <textarea
                                          placeholder={`Agenda item ${idx + 1}`}
                                          value={item}
                                          onChange={(e) =>
                                             updateAgenda(idx, e.target.value)
                                          }
                                          className={`flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                             isDarkMode
                                                ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                                : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"
                                          }`}
                                          rows={2}
                                       />
                                       {agenda.length > 1 && (
                                          <button
                                             type="button"
                                             onClick={() => removeAgenda(idx)}
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
                                 onClick={addAgendaRow}
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
                                       ? "text-gray-300"
                                       : "text-gray-700"
                                 }`}
                              >
                                 Decisions Made
                              </label>
                              <div className="space-y-3">
                                 {decisions.map((decision, idx) => (
                                    <div key={idx} className="flex gap-2">
                                       <textarea
                                          placeholder={`Decision ${idx + 1}`}
                                          value={decision}
                                          onChange={(e) =>
                                             updateDecision(idx, e.target.value)
                                          }
                                          className={`flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                             isDarkMode
                                                ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                                : "border-gray-300 bg-white text-gray-700 placeholder-gray-500"
                                          }`}
                                          rows={2}
                                       />
                                       {decisions.length > 1 && (
                                          <button
                                             type="button"
                                             onClick={() => removeDecision(idx)}
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
                                 onClick={addDecisionRow}
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
                                 onClick={handleCancel}
                                 className={`rounded-lg px-4 py-2 text-sm border transition-colors ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                                       : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                 }`}
                              >
                                 Cancel
                              </button>
                              <button
                                 type="submit"
                                 disabled={!isAuthenticated}
                                 className={`rounded-lg px-4 py-2 text-sm text-white transition-colors ${
                                    isAuthenticated
                                       ? "bg-blue-600 hover:bg-blue-700"
                                       : "bg-gray-400 cursor-not-allowed"
                                 }`}
                              >
                                 {!isAuthenticated
                                    ? "Authentication Required"
                                    : "Create Meeting"}
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
         />
      </div>
   );
};

export default CreateMeetingDialog;
