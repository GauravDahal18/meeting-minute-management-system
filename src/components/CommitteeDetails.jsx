import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
   ArrowLeft,
   Plus,
   Search,
   Trash2,
   Eye,
   Edit,
   UserPlus,
   FileDown,
} from "lucide-react";
import { BASE_URL } from "../utils/constants.js";
import { toast } from "react-toastify";
import CreateMemberDialog from "./CreateMemberDialog";
import COMMITTEE_ROLES from "../utils/roleConstants";
import { useTheme } from "../context/ThemeContext.jsx";

const CommitteeDetails = () => {
   const { committeeId } = useParams();
   const navigate = useNavigate();
   const { isDarkMode } = useTheme();
   const [committee, setCommittee] = useState(null);
   const [members, setMembers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [searchResults, setSearchResults] = useState([]);
   const [searchLoading, setSearchLoading] = useState(false);
   const [showSearchResults, setShowSearchResults] = useState(false);
   const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
   const [isCreateMemberDialogOpen, setIsCreateMemberDialogOpen] =
      useState(false);
   const [customRoles, setCustomRoles] = useState({});

   const [allMembers, setAllMembers] = useState([]);

   useEffect(() => {
      const fetchCommitteeDetails = async () => {
         try {
            const response = await fetch(
               `${BASE_URL}/api/getCommitteeDetails?committeeId=${committeeId}`,
               {
                  method: "GET",
                  credentials: "include",
               }
            );

            if (response.ok) {
               const data = await response.json();
               setCommittee(data.mainBody);
               // Ensure we store the complete member objects
               const committeeMembersList = data.mainBody.members || [];
               setMembers(committeeMembersList);

               console.log("Initial committee members:", committeeMembersList);

               // Also clear search results when committee data changes
               // This prevents stale data from appearing in search results
               setSearchResults([]);
               setShowSearchResults(false);

               // Fetch all members to compare with committee members
               fetchAllMembers(committeeMembersList);
            } else {
               setError(`HTTP error! status: ${response.status}`);
            }
         } catch (error) {
            console.error("Error fetching committee details:", error);
            setError(error.message);
         } finally {
            setLoading(false);
         }
      };

      const fetchAllMembers = async (committeeMembersList) => {
         try {
            const response = await fetch(`${BASE_URL}/api/getAllMembers`, {
               method: "GET",
               credentials: "include",
            });

            if (response.ok) {
               const data = await response.json();
               setAllMembers(data.mainBody || []);
               console.log("Fetched all members:", data.mainBody?.length || 0);
            } else {
               console.error("Error fetching all members:", response.status);
            }
         } catch (error) {
            console.error("Error fetching all members:", error);
         }
      };

      fetchCommitteeDetails();
   }, [committeeId]);

   const debouncedSearch = useCallback(
      (() => {
         let timeoutId;
         return (searchTerm) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
               if (searchTerm.trim().length >= 2) {
                  searchMembersByName(searchTerm.trim());
               } else {
                  setSearchResults([]);
                  setShowSearchResults(false);
               }
            }, 300);
         };
      })(),
      [members, allMembers] // Add dependencies
   );

   const searchMembersByName = (name) => {
      setSearchLoading(true);
      try {
         console.log("DETAILED DEBUG INFO:");
         console.log("All members:", allMembers);
         console.log("Current committee members:", members);

         // Create a Set of member IDs that are already in the committee
         const existingMemberIdsSet = new Set();

         // Collect all possible member IDs from committee members
         members.forEach((member) => {
            // Store IDs in the set
            if (member.memberId) {
               existingMemberIdsSet.add(String(member.memberId));
            }
            if (member.id) {
               existingMemberIdsSet.add(String(member.id));
            }
            if (member.userId) {
               existingMemberIdsSet.add(String(member.userId));
            }
         });

         console.log(
            "Existing member IDs Set:",
            Array.from(existingMemberIdsSet)
         );

         // Filter all members to find those that match the search and aren't in the committee
         const filteredResults = allMembers.filter((member) => {
            // Check if member is in committee
            const memberId = String(member.memberId || member.id);
            const isInCommittee = existingMemberIdsSet.has(memberId);

            // Check if member matches search term
            const matchesSearch =
               `${member.firstName} ${member.lastName}`
                  .toLowerCase()
                  .includes(name.toLowerCase()) ||
               (member.institution || "")
                  .toLowerCase()
                  .includes(name.toLowerCase()) ||
               (member.post || "").toLowerCase().includes(name.toLowerCase());

            // Include in results if matches search and NOT in committee
            return matchesSearch && !isInCommittee;
         });

         console.log(
            "Total search results after filtering:",
            filteredResults.length
         );

         setSearchResults(filteredResults);
         setShowSearchResults(true);
      } catch (error) {
         console.error("Error searching members:", error);
         setSearchResults([]);
      } finally {
         setSearchLoading(false);
      }
   };

   const handleSearchChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      if (value.trim().length === 0) {
         setSearchResults([]);
         setShowSearchResults(false);
      } else {
         debouncedSearch(value);
      }
   };

   const clearSearch = () => {
      setSearchTerm("");
      setSearchResults([]);
      setShowSearchResults(false);
   };

   const handleAddMemberClick = (member, dropdownId) => {
      const dropdown = document.getElementById(dropdownId);
      const customRoleInput = document.getElementById(
         `custom-role-${member.id}`
      );

      // If there's a custom role and it's not empty, use it; otherwise use dropdown value
      const customRoleValue = customRoleInput
         ? customRoleInput.value.trim()
         : "";
      const selectedRole =
         customRoleValue || (dropdown ? dropdown.value : "Member");

      // Make sure the first letter is capitalized for consistency
      const formattedRole =
         selectedRole === "custom" ? customRoleValue : selectedRole;

      handleAddMemberToCommittee(member, formattedRole);

      // Reset search bar after adding member
      setSearchTerm("");
      setSearchResults([]);
      setShowSearchResults(false);
   };

   const handleBackToCommittees = () => {
      navigate("/home");
   };

   const handleCreateMeeting = () => {
      navigate(`/committee/${committeeId}/createMeeting`);
   };

   const handleAddMember = () => {
      setIsCreateMemberDialogOpen(true);
   };

   const handleMemberCreated = (newMemberData) => {
      // Refresh committee details to include the new member
      (async () => {
         try {
            // Fetch updated committee details
            const response = await fetch(
               `${BASE_URL}/api/getCommitteeDetails?committeeId=${committeeId}`,
               {
                  method: "GET",
                  credentials: "include",
               }
            );

            if (response.ok) {
               const data = await response.json();
               setCommittee(data.mainBody);
               setMembers(data.mainBody.members || []);

               // Also refresh the full members list
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

               toast.success(
                  `${newMemberData.mainBody?.firstName || "Member"} ${
                     newMemberData.mainBody?.lastName || ""
                  } created successfully and added to the committee`
               );
            }
         } catch (error) {
            console.error("Failed to refresh committee details:", error);
         }
      })();
   };

   const handleDeleteMember = (memberId) => {
      console.log("Delete member:", memberId);
   };

   const handleDeleteCommittee = async () => {
      setShowDeleteConfirmation(true);
   };

   const confirmDeleteCommittee = async () => {
      setShowDeleteConfirmation(false);

      try {
         const response = await fetch(
            `${BASE_URL}/api/deleteCommittee?committeeId=${committeeId}`,
            {
               method: "POST",
               credentials: "include",
               headers: {
                  "Content-Type": "application/json",
               },
            }
         );

         if (response.ok) {
            toast.success("Committee deleted successfully");
            navigate("/home");
         } else {
            const errorData = await response.json().catch(() => null);
            toast.error(errorData?.message || "Failed to delete committee");
         }
      } catch (error) {
         console.error("Error deleting committee:", error);
         toast.error("An error occurred while deleting the committee");
      }
   };

   const cancelDeleteCommittee = () => {
      setShowDeleteConfirmation(false);
   };

   const handleViewMeeting = async (meetingId) => {
      const previewUrl = `${BASE_URL}/api/previewMeetingMinute?committeeId=${committeeId}&meetingId=${meetingId}`;
      console.log(previewUrl);
      // try {
      //   const response = await fetch(previewUrl, {
      //     method: "GET",
      //     credentials: "include",
      //     headers: { Accept: "text/html" },
      //   });
      //   if (!response.ok) {
      //     const data = await response.json().catch(() => null);
      //     toast.error(data?.message || "Failed to open preview");
      //     return;
      //   }
      //   const html = await response.text();
      //   const win = window.open("", "_blank");
      //   if (win) {
      //     win.document.open();
      //     win.document.write(html);
      //     win.document.close();
      //   } else {
      //     const blob = new Blob([html], { type: "text/html" });
      //     const blobUrl = URL.createObjectURL(blob);
      //     window.location.href = blobUrl;
      //   }
      // } catch (e) {
      //   console.error("Preview error:", e);
      //   toast.error("Unable to open preview");
      // }
      console.log("Hello:");
      window.open(previewUrl, "_blank");
   };

   const handleDownloadMeeting = (meetingId) => {
      const downloadUrl = `${BASE_URL}/api/previewMeetingMinute?committeeId=${committeeId}&meetingId=${meetingId}&lang=nepali&download=docx`;
      // Simply open the download URL in a new window
      window.open(downloadUrl, "_blank");
   };

   const handleEditMeeting = async (meetingId) => {
      try {
         // Get current meeting data
         const response = await fetch(
            `${BASE_URL}/api/getMeetingDetails?committeeId=${committeeId}&meetingId=${meetingId}`,
            {
               method: "GET",
               credentials: "include",
            }
         );

         if (response.ok) {
            const meetingData = await response.json();
            // Navigate to edit meeting page with meeting data
            navigate(`/committees/${committeeId}/meetings/${meetingId}/edit`, {
               state: {
                  meeting: meetingData.mainBody,
                  meetingId: meetingId,
                  committee: { id: committeeId, name: committee.name },
               },
            });
         } else {
            const errorData = await response.json().catch(() => null);
            toast.error(
               errorData?.message || "Meeting not found or access denied"
            );
         }
      } catch (error) {
         console.error("Error fetching meeting for edit:", error);
         toast.error("Unable to access meeting for editing");
      }
   };

   const handleViewMember = (memberId) => {
      navigate(`/member/${memberId}`);
   };

   const handleAddMemberToCommittee = async (member, role) => {
      try {
         // Use BASE_URL for consistency
         const response = await fetch(
            `${BASE_URL}/api/addMembersToCommittee?committeeId=${committeeId}`,
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               credentials: "include",
               body: JSON.stringify([
                  {
                     memberId: member.memberId || member.id,
                     role: role,
                  },
               ]),
            }
         );

         if (response.ok) {
            // Show success notification
            toast.success(
               `${member.firstName} ${member.lastName} added as ${role}`
            );

            // Refresh committee details
            const committeeResponse = await fetch(
               `${BASE_URL}/api/getCommitteeDetails?committeeId=${committeeId}`,
               {
                  method: "GET",
                  credentials: "include",
               }
            );

            if (committeeResponse.ok) {
               const data = await committeeResponse.json();
               const updatedMembers = data.mainBody.members || [];
               setCommittee(data.mainBody);
               setMembers(updatedMembers);

               // Update search results by removing the newly added member
               const memberId = String(member.memberId || member.id);
               console.log(
                  `Removing member with ID ${memberId} from search results`
               );

               setSearchResults((prev) =>
                  prev.filter((m) => String(m.memberId || m.id) !== memberId)
               );

               // If search results are now empty, clear the search
               if (searchResults.length <= 1) {
                  setShowSearchResults(false);
                  setSearchTerm("");
               } else {
                  // Re-run the search to update results from allMembers
                  searchMembersByName(searchTerm.trim());
               }
            }
         } else {
            // Show error notification
            toast.error(`Failed to add member: ${response.statusText}`);
            console.error("Error adding member to committee:", response.status);
         }
      } catch (error) {
         // Show error notification for exceptions
         toast.error(`Error: ${error.message || "Failed to add member"}`);
         console.error("Error adding member to committee:", error);
      }
   };

   // Sort members by role priority (Coordinator first, then by COMMITTEE_ROLES order)
   const filteredMembers = [...members].sort((a, b) => {
      // Coordinator always comes first - highest priority
      if (a.role === "Coordinator" && b.role !== "Coordinator") return -1;
      if (b.role === "Coordinator" && a.role !== "Coordinator") return 1;

      // If both are Coordinators, maintain their original order
      if (a.role === "Coordinator" && b.role === "Coordinator") return 0;

      // For all other roles, use the order from COMMITTEE_ROLES
      const aIndex = COMMITTEE_ROLES.indexOf(a.role);
      const bIndex = COMMITTEE_ROLES.indexOf(b.role);

      // If both roles are in COMMITTEE_ROLES, sort by their index
      if (aIndex !== -1 && bIndex !== -1) {
         return aIndex - bIndex;
      }

      // If only one role is in COMMITTEE_ROLES, it comes first
      if (aIndex !== -1 && bIndex === -1) return -1;
      if (bIndex !== -1 && aIndex === -1) return 1;

      // If neither role is in COMMITTEE_ROLES, sort alphabetically
      return a.role.localeCompare(b.role);
   });

   if (loading) {
      return (
         <div
            className={`min-h-screen flex flex-col transition-colors duration-200 ${
               isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
         >
            <div className="flex-1 flex items-center justify-center">
               <div
                  className={`text-center transition-colors duration-200 ${
                     isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
               >
                  Loading committee details...
               </div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div
            className={`min-h-screen flex flex-col transition-colors duration-200 ${
               isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
         >
            <div className="flex-1 flex items-center justify-center p-6">
               <div className="max-w-4xl mx-auto">
                  <div className="text-center">
                     <div
                        className={`mb-4 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                     >
                        Error loading committee: {error}
                     </div>
                     <button
                        onClick={handleBackToCommittees}
                        className={`px-4 py-2 border rounded-md hover:shadow-lg mr-2 transition-colors duration-200 ${
                           isDarkMode
                              ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                     >
                        Back
                     </button>
                     <button
                        onClick={() => window.location.reload()}
                        className={`px-4 py-2 border rounded-md hover:shadow-lg transition-colors duration-200 ${
                           isDarkMode
                              ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                     >
                        Retry
                     </button>
                  </div>
               </div>
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
                  onClick={handleBackToCommittees}
                  className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors font-medium"
               >
                  <ArrowLeft size={18} />
                  Back
               </button>

               {committee ? (
                  <div className="space-y-6">
                     {/* Committee Header */}
                     <div
                        className={`rounded-lg shadow-sm border p-6 transition-colors duration-200 ${
                           isDarkMode
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-200"
                        }`}
                     >
                        <h1
                           className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
                              isDarkMode ? "text-gray-200" : "text-gray-800"
                           }`}
                        >
                           {committee.name}
                        </h1>
                        <p
                           className={`mb-4 transition-colors duration-200 ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                           }`}
                        >
                           {committee.description}
                        </p>
                        <div
                           className={`flex items-center justify-between text-sm transition-colors duration-200 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                           }`}
                        >
                           <div>
                              Created:{" "}
                              {new Date(
                                 committee.createdDate[0],
                                 committee.createdDate[1] - 1,
                                 committee.createdDate[2]
                              ).toLocaleDateString()}
                           </div>
                           <div className="flex flex-col gap-2">
                              <button
                                 onClick={() =>
                                    navigate(`/committee/${committeeId}/edit`)
                                 }
                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                              >
                                 <Edit size={14} /> Edit Committee
                              </button>
                              <button
                                 onClick={handleDeleteCommittee}
                                 className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1 ${
                                    isDarkMode
                                       ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                       : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                 }`}
                              >
                                 <Trash2 size={14} /> Delete Committee
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Members Section */}
                        <div
                           className={`rounded-lg shadow-sm border p-6 transition-colors duration-200 ${
                              isDarkMode
                                 ? "bg-gray-800 border-gray-700"
                                 : "bg-white border-gray-200"
                           }`}
                        >
                           <div className="flex justify-between items-center mb-4">
                              <h2
                                 className={`text-xl font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-200"
                                       : "text-gray-800"
                                 }`}
                              >
                                 Members
                              </h2>
                              <button
                                 onClick={handleAddMember}
                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1.5"
                              >
                                 <UserPlus size={15} />
                                 Create Member
                              </button>
                           </div>

                           {/* Search Bar */}
                           <div className="relative mb-4">
                              <Search
                                 className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                    isDarkMode
                                       ? "text-gray-500"
                                       : "text-gray-400"
                                 }`}
                                 size={16}
                              />
                              <input
                                 type="text"
                                 placeholder="Search members to add..."
                                 value={searchTerm}
                                 onChange={handleSearchChange}
                                 className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                       : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                 }`}
                              />
                              {searchLoading && (
                                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                 </div>
                              )}
                              {searchTerm && !searchLoading && (
                                 <button
                                    onClick={clearSearch}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gray-600 ${
                                       isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-400"
                                    }`}
                                 >
                                    ×
                                 </button>
                              )}
                           </div>

                           {/* Search Results - Shown only when searching */}
                           {showSearchResults && (
                              <div className="mb-4">
                                 <div className="flex justify-between items-center mb-2">
                                    <h3
                                       className={`text-sm font-medium transition-colors duration-200 ${
                                          isDarkMode
                                             ? "text-gray-300"
                                             : "text-gray-700"
                                       }`}
                                    >
                                       Search Results{" "}
                                       {searchResults.length > 0
                                          ? `(${searchResults.length})`
                                          : ""}
                                    </h3>
                                    <button
                                       onClick={clearSearch}
                                       className={`text-xs hover:text-gray-700 transition-colors duration-200 ${
                                          isDarkMode
                                             ? "text-gray-400"
                                             : "text-gray-500"
                                       }`}
                                    >
                                       Clear
                                    </button>
                                 </div>

                                 {searchResults.length > 0 ? (
                                    <div
                                       className={`space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2 transition-colors duration-200 ${
                                          isDarkMode
                                             ? "border-gray-600 bg-gray-700"
                                             : "border-gray-200 bg-gray-50"
                                       }`}
                                    >
                                       {searchResults.map((member) => (
                                          <div
                                             key={member.id}
                                             className={`flex justify-between items-center p-2 rounded border transition-colors duration-200 ${
                                                isDarkMode
                                                   ? "hover:bg-gray-600 border-gray-600 bg-gray-800"
                                                   : "hover:bg-white border-gray-100 bg-white"
                                             }`}
                                          >
                                             <div className="flex-1">
                                                <div className="text-sm">
                                                   <span
                                                      className={`font-medium transition-colors duration-200 ${
                                                         isDarkMode
                                                            ? "text-gray-200"
                                                            : "text-gray-900"
                                                      }`}
                                                   >
                                                      {member.firstName}{" "}
                                                      {member.lastName}
                                                   </span>
                                                </div>
                                                <div
                                                   className={`text-xs transition-colors duration-200 ${
                                                      isDarkMode
                                                         ? "text-gray-400"
                                                         : "text-gray-500"
                                                   }`}
                                                >
                                                   {member.post} at{" "}
                                                   {member.institution}
                                                </div>
                                                <div
                                                   className={`text-xs transition-colors duration-200 ${
                                                      isDarkMode
                                                         ? "text-gray-500"
                                                         : "text-gray-400"
                                                   }`}
                                                >
                                                   {member.qualification}
                                                </div>
                                             </div>
                                             <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                   <select
                                                      id={`role-${member.id}`}
                                                      className={`px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                                                         isDarkMode
                                                            ? "border-gray-600 bg-gray-700 text-gray-200"
                                                            : "border-gray-300 bg-white text-gray-900"
                                                      }`}
                                                      defaultValue="Member"
                                                      onChange={(e) => {
                                                         // When dropdown changes, update the custom input
                                                         const customInput =
                                                            document.getElementById(
                                                               `custom-role-${member.id}`
                                                            );
                                                         if (customInput) {
                                                            customInput.value =
                                                               e.target
                                                                  .value ===
                                                               "custom"
                                                                  ? ""
                                                                  : e.target
                                                                       .value;
                                                         }
                                                      }}
                                                   >
                                                      {COMMITTEE_ROLES.map(
                                                         (role) => (
                                                            <option
                                                               key={role}
                                                               value={role}
                                                            >
                                                               {role}
                                                            </option>
                                                         )
                                                      )}
                                                      <option value="custom">
                                                         Custom Role...
                                                      </option>
                                                   </select>
                                                   <button
                                                      onClick={() =>
                                                         handleAddMemberClick(
                                                            member,
                                                            `role-${member.id}`
                                                         )
                                                      }
                                                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-xs hover:bg-blue-200 transition-colors flex items-center gap-1 font-medium"
                                                   >
                                                      <UserPlus size={12} />
                                                      Add
                                                   </button>
                                                </div>
                                                <input
                                                   id={`custom-role-${member.id}`}
                                                   type="text"
                                                   className={`px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full transition-colors duration-200 ${
                                                      isDarkMode
                                                         ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                                         : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                                   }`}
                                                   placeholder="Enter custom role (Nepali)..."
                                                   onChange={(e) => {
                                                      // When custom input changes, update the dropdown
                                                      const dropdown =
                                                         document.getElementById(
                                                            `role-${member.id}`
                                                         );
                                                      if (
                                                         dropdown &&
                                                         e.target.value.trim() !==
                                                            ""
                                                      ) {
                                                         dropdown.value =
                                                            "custom";
                                                      }
                                                   }}
                                                />
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 ) : searchTerm.trim().length >= 2 &&
                                   !searchLoading ? (
                                    <div
                                       className={`p-3 text-center rounded-lg border transition-colors duration-200 ${
                                          isDarkMode
                                             ? "text-gray-400 bg-gray-700 border-gray-600"
                                             : "text-gray-500 bg-gray-50 border-gray-200"
                                       }`}
                                    >
                                       No members found matching "{searchTerm}"
                                    </div>
                                 ) : null}
                              </div>
                           )}

                           {/* Existing Members List - Always shown */}
                           <div className="mb-4">
                              <h3
                                 className={`text-sm font-medium mb-2 transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-300"
                                       : "text-gray-700"
                                 }`}
                              >
                                 Current Members ({members.length})
                              </h3>
                              <div
                                 className={`space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2 transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600"
                                       : "border-gray-200"
                                 }`}
                              >
                                 {filteredMembers.map((member, index) => (
                                    <div
                                       key={member.memberId}
                                       className={`flex justify-between items-center p-2 rounded transition-colors duration-200 ${
                                          isDarkMode
                                             ? "hover:bg-gray-700"
                                             : "hover:bg-gray-50"
                                       }`}
                                    >
                                       <div
                                          className="flex-1 cursor-pointer"
                                          onClick={() =>
                                             handleViewMember(member.memberId)
                                          }
                                       >
                                          <div className="text-sm">
                                             <span
                                                className={`font-medium transition-colors duration-200 ${
                                                   isDarkMode
                                                      ? "text-gray-200"
                                                      : "text-gray-900"
                                                }`}
                                             >
                                                {index + 1}. {member.firstName}{" "}
                                                {member.lastName}
                                             </span>
                                             <span
                                                className={`text-xs ml-2 transition-colors duration-200 ${
                                                   member.role === "Coordinator"
                                                      ? isDarkMode
                                                         ? "text-orange-400 font-semibold"
                                                         : "text-orange-600 font-semibold"
                                                      : isDarkMode
                                                      ? "text-gray-400"
                                                      : "text-gray-500"
                                                }`}
                                             >
                                                ({member.role})
                                             </span>
                                          </div>
                                          <div
                                             className={`text-xs transition-colors duration-200 ${
                                                isDarkMode
                                                   ? "text-gray-500"
                                                   : "text-gray-400"
                                             }`}
                                          >
                                             {member.institution}
                                          </div>
                                       </div>
                                       <button
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             navigate(
                                                `/member/${member.memberId}/edit`
                                             );
                                          }}
                                          className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 ml-2 ${
                                             isDarkMode
                                                ? "bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 hover:text-blue-200"
                                                : "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                                          }`}
                                          title="Edit member"
                                       >
                                          <Edit size={14} />
                                       </button>
                                    </div>
                                 ))}
                                 {members.length === 0 && (
                                    <div
                                       className={`text-center py-4 transition-colors duration-200 ${
                                          isDarkMode
                                             ? "text-gray-400"
                                             : "text-gray-500"
                                       }`}
                                    >
                                       No members added yet
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Create Member Button moved to top section */}
                        </div>

                        {/* Meetings Section */}
                        <div
                           className={`rounded-lg shadow-sm border p-6 transition-colors duration-200 ${
                              isDarkMode
                                 ? "bg-gray-800 border-gray-700"
                                 : "bg-white border-gray-200"
                           }`}
                        >
                           <div className="flex justify-between items-center mb-4">
                              <h2
                                 className={`text-xl font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-200"
                                       : "text-gray-800"
                                 }`}
                              >
                                 Meetings
                              </h2>
                              <button
                                 onClick={handleCreateMeeting}
                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1.5"
                              >
                                 <Plus size={15} /> Create Meeting
                              </button>
                           </div>

                           {/* Meetings Grid */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {committee.meetings &&
                              committee.meetings.length > 0 ? (
                                 committee.meetings.map((meeting, index) => (
                                    <div
                                       key={meeting.id}
                                       onClick={() =>
                                          handleViewMeeting(meeting.id)
                                       }
                                       className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
                                          isDarkMode
                                             ? "border-gray-600 hover:bg-gray-700"
                                             : "border-gray-300 hover:bg-gray-100"
                                       }`}
                                    >
                                       <h3
                                          className={`font-medium mb-2 transition-colors duration-200 ${
                                             isDarkMode
                                                ? "text-gray-200"
                                                : "text-gray-800"
                                          }`}
                                       >
                                          {meeting.title}
                                       </h3>
                                       <p
                                          className={`text-xs line-clamp-2 mb-3 transition-colors duration-200 ${
                                             isDarkMode
                                                ? "text-gray-400"
                                                : "text-gray-600"
                                          }`}
                                       >
                                          {meeting.description}
                                       </p>
                                       <div
                                          className={`text-xs mb-3 transition-colors duration-200 ${
                                             isDarkMode
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                          }`}
                                       >
                                          {new Date(
                                             meeting.heldDate[0],
                                             meeting.heldDate[1] - 1,
                                             meeting.heldDate[2]
                                          ).toLocaleDateString()}
                                       </div>
                                       <div
                                          className="flex gap-2"
                                          onClick={(e) => e.stopPropagation()}
                                       >
                                          <button
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewMeeting(meeting.id);
                                             }}
                                             className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                                                isDarkMode
                                                   ? "bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 hover:text-blue-200"
                                                   : "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                                             }`}
                                             title="Preview Meeting"
                                          >
                                             <Eye size={16} />
                                          </button>
                                          <button
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditMeeting(meeting.id);
                                             }}
                                             className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                                                isDarkMode
                                                   ? "bg-green-900/40 text-green-300 hover:bg-green-800/60 hover:text-green-200"
                                                   : "bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700"
                                             }`}
                                             title="Edit Meeting"
                                          >
                                             <Edit size={16} />
                                          </button>
                                          <button
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadMeeting(
                                                   meeting.id
                                                );
                                             }}
                                             className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                                                isDarkMode
                                                   ? "bg-orange-900/40 text-orange-300 hover:bg-orange-800/60 hover:text-orange-200"
                                                   : "bg-orange-100 text-orange-600 hover:bg-orange-200 hover:text-orange-700"
                                             }`}
                                             title="Download as Document"
                                          >
                                             <FileDown size={16} />
                                          </button>
                                       </div>
                                    </div>
                                 ))
                              ) : (
                                 <div
                                    className={`col-span-2 text-center py-8 transition-colors duration-200 ${
                                       isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                    }`}
                                 >
                                    No meetings scheduled yet
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="text-center py-8">
                     <p
                        className={`mb-4 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                     >
                        No committee data found
                     </p>
                     <button
                        onClick={handleBackToCommittees}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                     >
                        Back
                     </button>
                  </div>
               )}
            </div>
         </div>

         {showDeleteConfirmation && (
            <React.Fragment>
               <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"></div>

               <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div
                     className={`border-2 border-red-200 rounded-lg p-6 shadow-lg max-w-lg w-full transition-colors duration-200 ${
                        isDarkMode
                           ? "bg-gray-800 border-red-800"
                           : "bg-white border-red-200"
                     }`}
                  >
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                           <Trash2 className="h-7 w-7 text-red-600" />
                        </div>
                        <div className="flex-1">
                           <h3
                              className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                                 isDarkMode ? "text-gray-200" : "text-gray-900"
                              }`}
                           >
                              Delete Committee
                           </h3>
                           <p
                              className={`text-sm mb-4 transition-colors duration-200 ${
                                 isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                           >
                              Are you sure? All meetings and membership will be
                              permanently deleted.
                           </p>
                           <div className="flex gap-3">
                              <button
                                 onClick={cancelDeleteCommittee}
                                 className={`px-4 py-2 rounded-lg text-sm transition-colors font-medium ${
                                    isDarkMode
                                       ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                       : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                 }`}
                              >
                                 Cancel
                              </button>
                              <button
                                 onClick={confirmDeleteCommittee}
                                 className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors font-medium"
                              >
                                 Delete
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </React.Fragment>
         )}

         {/* Create Member Dialog */}
         <CreateMemberDialog
            isOpen={isCreateMemberDialogOpen}
            onClose={() => setIsCreateMemberDialogOpen(false)}
            committeeId={committeeId}
            onMemberCreated={handleMemberCreated}
         />
      </div>
   );
};

export default CommitteeDetails;
