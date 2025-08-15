import React, { useState, useEffect } from "react";
//import membersData from "../utils/jsonData/members.json";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ArrowLeft, Search, Minus, Plus } from "lucide-react";
import COMMITTEE_ROLES from "../utils/roleConstants";
import { useTheme } from "../context/ThemeContext.jsx";

// Use the global roles constant
const roles = COMMITTEE_ROLES;
const statusOptions = ["ACTIVE", "INACTIVE"];

const CreateCommitteeDialog = () => {
   const { isDarkMode } = useTheme();
   // const [committeeName, setCommitteeName] = useState("");
   // const [committeeDescription, setCommitteeDescription] = useState("");
   // const [status, setStatus] = useState(statusOptions[0]);
   // const [maximumNumberOfMeetings, setMaximumNumberOfMeetings] = useState("");

   const [committeeName, setCommitteeName] = useState(
      "Central Planning Committee"
   );
   const [committeeDescription, setCommitteeDescription] = useState(
      "Responsible for overseeing strategic development and coordination of all subcommittees."
   );
   const [status, setStatus] = useState(statusOptions[0]); // e.g., "Active"
   const [maximumNumberOfMeetings, setMaximumNumberOfMeetings] = useState("0");
   const [searchTerm, setSearchTerm] = useState("");
   const [committeeMembership, setCommitteeMembership] = useState([]);
   const [roleError, setRoleError] = useState("");
   const [showSearchResults, setShowSearchResults] = useState(false);
   const [selectedCoordinator, setSelectedCoordinator] = useState("");

   const [membersData, setMembersData] = useState([]);

   const navigate = useNavigate();

   // Special roles that can only have one person
   const specialRoles = [
      "Coordinator",
      "Secretary",
      "Treasurer",
      "Chairperson",
   ];

   // Helper function to capitalize first letter
   const capitalizeFirstLetter = (str) => {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
   };

   useEffect(() => {
      const fetchMembers = async () => {
         try {
            const response = await axios.get(
               "http://localhost:8080/api/getAllMembers",
               { withCredentials: true }
            );
            if (response.status === 200) {
               console.log(
                  "Members fetched successfully from create committee:",
                  response.data.mainBody
               );
               setMembersData(response.data.mainBody);
            }
         } catch (error) {
            console.error("Error fetching members:", error);
         }
      };
      fetchMembers();
   }, []);

   const filteredMembers = membersData.filter(
      (member) =>
         member.firstName.toLowerCase().startsWith(searchTerm.toLowerCase()) &&
         String(member.memberId) !== String(selectedCoordinator)
   );

   // Handle search term changes and show/hide results
   const handleSearchChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      if (value.trim().length === 0) {
         setShowSearchResults(false);
      } else {
         setShowSearchResults(true);
      }
   };

   const clearSearch = () => {
      setSearchTerm("");
      setShowSearchResults(false);
   };

   const handleCoordinatorChange = (e) => {
      const coordinatorId = e.target.value;

      // Check if selected member is already in committee
      if (
         coordinatorId &&
         committeeMembership.find(
            (m) => String(m.memberId) === String(coordinatorId)
         )
      ) {
         setRoleError(
            "Cannot select a member who is already in the committee as coordinator"
         );
         return;
      }

      setSelectedCoordinator(coordinatorId);
      setRoleError(""); // Clear any existing error
   };

   const addMember = (memberId, role) => {
      // Clear any previous role error
      setRoleError("");

      // Check if member already exists in committee
      const exists = committeeMembership.find((m) => m.memberId === memberId);
      if (exists) {
         setRoleError("This member is already added to the committee");
         return;
      }

      // Check if member is already selected as coordinator
      if (
         selectedCoordinator &&
         String(selectedCoordinator) === String(memberId)
      ) {
         setRoleError("This member is already selected as coordinator");
         return;
      }

      // Check if the role is a special role and already assigned
      const isSpecialRole = specialRoles.includes(role);
      if (isSpecialRole) {
         const roleAlreadyAssigned = committeeMembership.find(
            (m) => m.role.toLowerCase() === role.toLowerCase()
         );
         if (roleAlreadyAssigned) {
            setRoleError(`${role} role is already assigned to another member`);
            return;
         }
      }

      // Check if member ID is provided
      if (!memberId || memberId === "") {
         setRoleError("Please select a member");
         return;
      }

      // Check if role is provided
      if (!role || role.trim() === "") {
         setRoleError("Please enter or select a role");
         return;
      }

      // Add member if all validations pass
      setCommitteeMembership((prev) => [...prev, { memberId, role }]);
   };

   const removeMember = (memberId) => {
      setCommitteeMembership((prev) =>
         prev.filter((m) => m.memberId !== memberId)
      );
      // Clear coordinator if they were selected as coordinator
      if (String(selectedCoordinator) === String(memberId)) {
         setSelectedCoordinator("");
      }
      setRoleError(""); // Clear error when removing member
   };

   const handleSubmit = async () => {
      // Basic validations
      if (!committeeName.trim()) {
         toast.error("Please enter a committee name");
         return;
      }

      if (!committeeDescription.trim()) {
         toast.error("Please enter a committee description/aim");
         return;
      }

      // Handle maximum number of meetings - optional field with default 0
      let maxMeetNum = 0; // Default value
      if (maximumNumberOfMeetings && maximumNumberOfMeetings.trim() !== "") {
         maxMeetNum = Number(maximumNumberOfMeetings);
         if (!Number.isInteger(maxMeetNum) || maxMeetNum < 0) {
            toast.error(
               "Maximum number of meetings must be a non-negative integer"
            );
            return;
         }
      }

      if (!statusOptions.includes(status)) {
         toast.error("Invalid status selected");
         return;
      }

      // Coordinator selection is mandatory
      if (!selectedCoordinator) {
         toast.error("Please select a coordinator for the committee");
         return;
      }

      // Check if at least one member is added (coordinator counts as a member)
      if (committeeMembership.length === 0 && !selectedCoordinator) {
         toast.error(
            "Please add at least one member to the committee or select a coordinator"
         );
         return;
      }

      // No need to check coordinator count in members since we have a separate coordinator field

      // Transform memberships to required map schema: { "memberId": "ROLE" }
      const membersMap = {};
      committeeMembership.forEach((m) => {
         if (m.memberId) {
            membersMap[String(m.memberId)] = m.role; // send as provided, backend expects strings like Chairperson/Member
         }
      });

      // Add coordinator if selected
      if (selectedCoordinator) {
         membersMap[String(selectedCoordinator)] = "Coordinator";
      }

      const payload = {
         name: committeeName.trim(),
         description: committeeDescription ? committeeDescription.trim() : "",
         status,
         maximumNumberOfMeetings: maxMeetNum,
         members: membersMap,
         coordinatorId: selectedCoordinator,
      };

      console.log("Sending JSON:", JSON.stringify(payload, null, 2));
      try {
         const response = await axios.post(
            "http://localhost:8080/api/createCommittee",
            payload,
            {
               headers: {
                  "Content-Type": "application/json",
               },
               withCredentials: true,
            }
         );
         console.log("Success response:", response);
         if (response.status === 200 || response.status === 201) {
            navigate("/home");
            toast.success("Committee created successfully!");
         }
      } catch (error) {
         console.error("Submit error:", error);
         console.error("Error response:", error.response);
         console.error("Error response data:", error.response?.data);
         console.error("Error response status:", error.response?.status);
         console.error("Error response headers:", error.response?.headers);
         toast.error(
            error.response?.data?.message ||
               `Failed to create committee: ${error.message || "Unknown error"}`
         );
      }
   };

   const handleBackToCommittees = () => {
      navigate("/home");
   };

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
                  className={`rounded-xl shadow-lg border p-6 space-y-6 transition-colors duration-200 ${
                     isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                  }`}
               >
                  <div className="border-b pb-3">
                     <h2
                        className={`text-2xl font-bold transition-colors duration-200 ${
                           isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                     >
                        Create Committee
                     </h2>
                     <p
                        className={`text-sm mt-1 transition-colors duration-200 ${
                           isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                     >
                        Fill in the committee details and add members with
                        roles. <span className="text-red-500">*</span> indicates
                        required fields.
                     </p>
                  </div>

                  {/* Two Column Layout with Equal Widths */}
                  <div className="grid grid-cols-2 gap-6">
                     {/* Left Side - Member Search and List (1/2 width) */}
                     <div className="col-span-1 space-y-5">
                        <div
                           className={`border rounded-lg shadow-sm p-5 h-[510px] flex flex-col transition-colors duration-200 ${
                              isDarkMode
                                 ? "bg-gray-800 border-gray-700"
                                 : "bg-white border-gray-200"
                           }`}
                        >
                           <h3
                              className={`text-lg font-semibold border-b pb-2 mb-4 transition-colors duration-200 ${
                                 isDarkMode
                                    ? "text-gray-200 border-gray-600"
                                    : "text-gray-800 border-gray-200"
                              }`}
                           >
                              Manage Members
                           </h3>

                           {/* Member Search with Icon */}
                           <div className="space-y-4 mb-5 flex-shrink-0">
                              <div className="relative">
                                 <input
                                    className={`w-full border p-2 pl-10 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                       isDarkMode
                                          ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                    }`}
                                    placeholder="Search members by name..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                 />
                                 <Search
                                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                       isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                    }`}
                                    size={16}
                                 />
                              </div>

                              {/* Search results indicator */}
                              {showSearchResults && searchTerm && (
                                 <div
                                    className={`text-xs border rounded p-2 transition-colors duration-200 ${
                                       isDarkMode
                                          ? "text-green-300 bg-green-900/30 border-green-700"
                                          : "text-green-600 bg-green-50 border-green-200"
                                    }`}
                                 >
                                    {filteredMembers.length === 0
                                       ? `No results found for "${searchTerm}"`
                                       : filteredMembers.length === 1
                                       ? `1 result found for "${searchTerm}"`
                                       : `${filteredMembers.length} results found for "${searchTerm}"`}
                                 </div>
                              )}

                              {/* All Members Display - Show filtered if searching, all if not */}
                              <div className="mb-4 flex-1 flex flex-col min-h-0">
                                 <div className="flex justify-between items-center mb-2">
                                    <h4
                                       className={`text-sm font-medium transition-colors duration-200 ${
                                          isDarkMode
                                             ? "text-gray-300"
                                             : "text-gray-700"
                                       }`}
                                    >
                                       {showSearchResults && searchTerm
                                          ? `Search Results ${
                                               filteredMembers.length > 0
                                                  ? `(${filteredMembers.length})`
                                                  : ""
                                            }`
                                          : `All Members (${
                                               membersData.filter(
                                                  (member) =>
                                                     !committeeMembership.find(
                                                        (m) =>
                                                           m.memberId ===
                                                           member.memberId
                                                     ) &&
                                                     String(member.memberId) !==
                                                        String(
                                                           selectedCoordinator
                                                        )
                                               ).length
                                            })`}
                                    </h4>
                                    {showSearchResults && searchTerm && (
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
                                    )}
                                 </div>

                                 {(showSearchResults && searchTerm
                                    ? filteredMembers
                                    : membersData
                                 ).length > 0 ? (
                                    <div
                                       className={`flex-1 space-y-2 max-h-80 overflow-y-auto border rounded-lg p-2 transition-colors duration-200 ${
                                          isDarkMode
                                             ? "border-gray-600 bg-gray-700"
                                             : "border-gray-200 bg-gray-50"
                                       }`}
                                       style={{ maxHeight: "320px" }}
                                    >
                                       {/* Sort members: added members first, then non-added members */}
                                       {(() => {
                                          const membersToShow =
                                             showSearchResults && searchTerm
                                                ? filteredMembers
                                                : membersData;
                                          const addedMembers =
                                             membersToShow.filter((member) =>
                                                committeeMembership.find(
                                                   (m) =>
                                                      m.memberId ===
                                                      member.memberId
                                                )
                                             );
                                          const nonAddedMembers =
                                             membersToShow.filter(
                                                (member) =>
                                                   !committeeMembership.find(
                                                      (m) =>
                                                         m.memberId ===
                                                         member.memberId
                                                   ) &&
                                                   String(member.memberId) !==
                                                      String(
                                                         selectedCoordinator
                                                      )
                                             );
                                          const sortedMembers = [
                                             ...addedMembers,
                                             ...nonAddedMembers,
                                          ];

                                          return sortedMembers.map((member) => {
                                             // Check if member is already added to committee
                                             const isAlreadyAdded =
                                                committeeMembership.find(
                                                   (m) =>
                                                      m.memberId ===
                                                      member.memberId
                                                );

                                             return (
                                                <div
                                                   key={member.memberId}
                                                   className={`flex justify-between items-center p-3 rounded-lg border transition-all duration-200 ${
                                                      isAlreadyAdded
                                                         ? isDarkMode
                                                            ? "bg-green-900/10 border-green-800 shadow-sm"
                                                            : "bg-green-50/50 border-green-200 shadow-sm"
                                                         : isDarkMode
                                                         ? "hover:bg-gray-600 border-gray-600 bg-gray-800"
                                                         : "hover:bg-white hover:shadow-sm border-gray-100 bg-white"
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
                                                         {member.institution}
                                                      </div>
                                                      <div
                                                         className={`text-xs transition-colors duration-200 ${
                                                            isDarkMode
                                                               ? "text-gray-500"
                                                               : "text-gray-400"
                                                         }`}
                                                      >
                                                         {member.email}
                                                      </div>
                                                   </div>
                                                   {isAlreadyAdded ? (
                                                      <div className="flex items-center gap-3">
                                                         <span
                                                            className={`text-xs font-medium transition-colors duration-200 ${
                                                               isDarkMode
                                                                  ? "text-green-300"
                                                                  : "text-green-700"
                                                            }`}
                                                         >
                                                            {
                                                               isAlreadyAdded.role
                                                            }
                                                         </span>
                                                         <button
                                                            onClick={() =>
                                                               removeMember(
                                                                  member.memberId
                                                               )
                                                            }
                                                            className={`w-6 h-6 flex items-center justify-center rounded text-sm transition-colors ${
                                                               isDarkMode
                                                                  ? "bg-red-800/60 text-red-200 hover:bg-red-700/60"
                                                                  : "bg-red-100 text-red-600 hover:bg-red-200"
                                                            }`}
                                                            title="Remove from committee"
                                                         >
                                                            <Minus size={14} />
                                                         </button>
                                                      </div>
                                                   ) : (
                                                      <div className="flex flex-col gap-2">
                                                         <div className="flex items-center gap-2">
                                                            <select
                                                               id={`role-${member.memberId}`}
                                                               className={`px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                                                                  isDarkMode
                                                                     ? "border-gray-600 bg-gray-700 text-gray-200"
                                                                     : "border-gray-300 bg-white text-gray-900"
                                                               }`}
                                                               defaultValue="Member"
                                                               onChange={(
                                                                  e
                                                               ) => {
                                                                  // When dropdown changes, update the custom input
                                                                  const customInput =
                                                                     document.getElementById(
                                                                        `custom-role-${member.memberId}`
                                                                     );
                                                                  if (
                                                                     customInput
                                                                  ) {
                                                                     customInput.value =
                                                                        e.target
                                                                           .value ===
                                                                        "custom"
                                                                           ? ""
                                                                           : e
                                                                                .target
                                                                                .value;
                                                                  }
                                                               }}
                                                            >
                                                               {roles.map(
                                                                  (role) => (
                                                                     <option
                                                                        key={
                                                                           role
                                                                        }
                                                                        value={
                                                                           role
                                                                        }
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
                                                               onClick={() => {
                                                                  const roleDropdown =
                                                                     document.getElementById(
                                                                        `role-${member.memberId}`
                                                                     );
                                                                  const customInput =
                                                                     document.getElementById(
                                                                        `custom-role-${member.memberId}`
                                                                     );
                                                                  let roleValue =
                                                                     roleDropdown.value;

                                                                  if (
                                                                     roleValue ===
                                                                     "custom"
                                                                  ) {
                                                                     roleValue =
                                                                        customInput.value.trim();
                                                                  }

                                                                  if (
                                                                     !roleValue
                                                                  ) {
                                                                     setRoleError(
                                                                        "Please select or enter a role"
                                                                     );
                                                                     return;
                                                                  }

                                                                  // Clear error and add member with the selected role
                                                                  setRoleError(
                                                                     ""
                                                                  );
                                                                  const exists =
                                                                     committeeMembership.find(
                                                                        (m) =>
                                                                           m.memberId ===
                                                                           member.memberId
                                                                     );
                                                                  if (exists) {
                                                                     setRoleError(
                                                                        "This member is already added to the committee"
                                                                     );
                                                                     return;
                                                                  }

                                                                  // Check if the role is a special role and already assigned
                                                                  const isSpecialRole =
                                                                     specialRoles.includes(
                                                                        roleValue
                                                                     );
                                                                  if (
                                                                     isSpecialRole
                                                                  ) {
                                                                     const roleAlreadyAssigned =
                                                                        committeeMembership.find(
                                                                           (
                                                                              m
                                                                           ) =>
                                                                              m.role.toLowerCase() ===
                                                                              roleValue.toLowerCase()
                                                                        );
                                                                     if (
                                                                        roleAlreadyAssigned
                                                                     ) {
                                                                        setRoleError(
                                                                           `${roleValue} role is already assigned to another member`
                                                                        );
                                                                        return;
                                                                     }
                                                                  }

                                                                  // Add member if all validations pass
                                                                  setCommitteeMembership(
                                                                     (prev) => [
                                                                        ...prev,
                                                                        {
                                                                           memberId:
                                                                              member.memberId,
                                                                           role: roleValue,
                                                                        },
                                                                     ]
                                                                  );

                                                                  // Reset search bar and close search results after adding member
                                                                  setSearchTerm(
                                                                     ""
                                                                  );
                                                                  setShowSearchResults(
                                                                     false
                                                                  );
                                                               }}
                                                               className={`px-3 py-1 rounded-md text-xs transition-colors flex items-center gap-1 font-medium ${
                                                                  isDarkMode
                                                                     ? "bg-blue-700 text-blue-200 hover:bg-blue-600"
                                                                     : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                                               }`}
                                                            >
                                                               <Plus
                                                                  size={12}
                                                               />
                                                               Add
                                                            </button>
                                                         </div>
                                                         <input
                                                            id={`custom-role-${member.memberId}`}
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
                                                                     `role-${member.memberId}`
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
                                                   )}
                                                </div>
                                             );
                                          });
                                       })()}
                                    </div>
                                 ) : showSearchResults &&
                                   searchTerm &&
                                   searchTerm.trim().length >= 2 ? (
                                    <div
                                       className={`p-3 text-center rounded-lg border transition-colors duration-200 ${
                                          isDarkMode
                                             ? "text-gray-400 bg-gray-700 border-gray-600"
                                             : "text-gray-500 bg-gray-50 border-gray-200"
                                       }`}
                                    >
                                       No members found matching "{searchTerm}"
                                    </div>
                                 ) : !showSearchResults &&
                                   !searchTerm &&
                                   membersData.length === 0 ? (
                                    <div
                                       className={`p-3 text-center rounded-lg border transition-colors duration-200 ${
                                          isDarkMode
                                             ? "text-gray-400 bg-gray-700 border-gray-600"
                                             : "text-gray-500 bg-gray-50 border-gray-200"
                                       }`}
                                    >
                                       Loading members...
                                    </div>
                                 ) : null}

                                 {/* Role error message */}
                                 {roleError && (
                                    <div
                                       className={`text-xs border rounded-lg p-3 mt-2 transition-colors duration-200 ${
                                          isDarkMode
                                             ? "text-red-300 bg-red-900/30 border-red-700"
                                             : "text-red-600 bg-red-50 border-red-200"
                                       }`}
                                    >
                                       {roleError}
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Right Side - Committee Details (1/2 width) */}
                     <div className="col-span-1 space-y-5">
                        <div
                           className={`border rounded-lg shadow-sm p-5 h-[510px] flex flex-col transition-colors duration-200 ${
                              isDarkMode
                                 ? "bg-gray-800 border-gray-700"
                                 : "bg-white border-gray-200"
                           }`}
                        >
                           <h3
                              className={`text-lg font-semibold border-b pb-2 mb-4 transition-colors duration-200 ${
                                 isDarkMode
                                    ? "text-gray-200 border-gray-600"
                                    : "text-gray-800 border-gray-200"
                              }`}
                           >
                              Committee Details
                           </h3>

                           <div className="mb-4">
                              <label
                                 className={`block mb-2 font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-300"
                                       : "text-gray-700"
                                 }`}
                              >
                                 Committee Name{" "}
                                 <span className="text-red-500">*</span>
                              </label>
                              <input
                                 className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                       : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                 }`}
                                 placeholder="e.g., Technical Committee"
                                 value={committeeName}
                                 onChange={(e) =>
                                    setCommitteeName(e.target.value)
                                 }
                              />
                           </div>

                           <div className="mb-4">
                              <label
                                 className={`block mb-2 font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-300"
                                       : "text-gray-700"
                                 }`}
                              >
                                 Description/Aim{" "}
                                 <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                 className={`w-full border p-2 rounded min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                       : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                 }`}
                                 placeholder="Description is for the minutes"
                                 value={committeeDescription}
                                 onChange={(e) =>
                                    setCommitteeDescription(e.target.value)
                                 }
                                 required
                              />
                           </div>

                           <div className="mb-4">
                              <label
                                 className={`block mb-2 font-semibold transition-colors duration-200 ${
                                    isDarkMode
                                       ? "text-gray-300"
                                       : "text-gray-700"
                                 }`}
                              >
                                 Select Coordinator{" "}
                                 <span className="text-red-500">*</span>
                              </label>
                              <select
                                 className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                    isDarkMode
                                       ? "border-gray-600 bg-gray-700 text-gray-200"
                                       : "border-gray-300 bg-white text-gray-900"
                                 }`}
                                 value={selectedCoordinator}
                                 onChange={handleCoordinatorChange}
                              >
                                 <option value="">No Coordinator</option>
                                 {membersData
                                    .filter(
                                       (member) =>
                                          !committeeMembership.find(
                                             (m) =>
                                                m.memberId === member.memberId
                                          )
                                    )
                                    .map((member) => (
                                       <option
                                          key={member.memberId}
                                          value={member.memberId}
                                       >
                                          {member.firstName} {member.lastName} -{" "}
                                          {member.institution}
                                       </option>
                                    ))}
                              </select>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label
                                    className={`block mb-2 font-semibold transition-colors duration-200 ${
                                       isDarkMode
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                    }`}
                                 >
                                    Status{" "}
                                    <span className="text-red-500">*</span>
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
                                    className={`block mb-2 font-semibold transition-colors duration-200 ${
                                       isDarkMode
                                          ? "text-gray-300"
                                          : "text-gray-700"
                                    }`}
                                 >
                                    Maximum No. of Meetings{" "}
                                    <span
                                       className={`font-normal transition-colors duration-200 ${
                                          isDarkMode
                                             ? "text-gray-400"
                                             : "text-gray-400"
                                       }`}
                                    ></span>
                                 </label>
                                 <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    className={`w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                                       isDarkMode
                                          ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                    }`}
                                    placeholder="0"
                                    defaultValue="0"
                                    value={maximumNumberOfMeetings}
                                    onChange={(e) =>
                                       setMaximumNumberOfMeetings(
                                          e.target.value
                                       )
                                    }
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                     <button
                        className={`border px-5 py-2.5 rounded font-medium transition-colors duration-200 ${
                           isDarkMode
                              ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"
                        }`}
                        onClick={() => navigate("/home")}
                     >
                        Cancel
                     </button>
                     <button
                        className="bg-green-600 text-white px-6 py-2.5 rounded hover:bg-green-700 font-medium"
                        onClick={handleSubmit}
                     >
                        Submit
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default CreateCommitteeDialog;
