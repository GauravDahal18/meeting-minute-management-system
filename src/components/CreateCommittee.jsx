import React, { useState, useEffect } from "react";
//import membersData from "../utils/jsonData/members.json";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ArrowLeft, Search } from "lucide-react";
import COMMITTEE_ROLES from "../utils/roleConstants";

// Use the global roles constant
const roles = COMMITTEE_ROLES;
const statusOptions = ["ACTIVE", "INACTIVE"];

const CreateCommitteeDialog = () => {
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
   const [maximumNumberOfMeetings, setMaximumNumberOfMeetings] = useState("12");
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedMemberId, setSelectedMemberId] = useState("");
   const [selectedRole, setSelectedRole] = useState(roles[0]);
   const [committeeMembership, setCommitteeMembership] = useState([]);
   const [roleError, setRoleError] = useState("");

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

   const filteredMembers = membersData.filter((member) =>
      member.firstName.toLowerCase().startsWith(searchTerm.toLowerCase())
   );

   // Auto-select first member when searching
   useEffect(() => {
      if (searchTerm && filteredMembers.length > 0) {
         setSelectedMemberId(filteredMembers[0].memberId);
      }
      // Don't clear selection when search is cleared - preserve manual selections
   }, [searchTerm, filteredMembers]);

   const addMember = (memberId) => {
      // Clear any previous role error
      setRoleError("");

      // Check if member already exists
      const exists = committeeMembership.find((m) => m.memberId === memberId);
      if (exists) {
         setRoleError("This member is already added to the committee");
         return;
      }

      // Check if the role is a special role and already assigned
      const isSpecialRole = specialRoles.includes(selectedRole);
      if (isSpecialRole) {
         const roleAlreadyAssigned = committeeMembership.find(
            (m) => m.role.toLowerCase() === selectedRole.toLowerCase()
         );
         if (roleAlreadyAssigned) {
            setRoleError(
               `${selectedRole} role is already assigned to another member`
            );
            return;
         }
      }

      // Check if member ID is selected
      if (!memberId || memberId === "") {
         setRoleError("Please select a member");
         return;
      }

      // Check if role is selected
      if (!selectedRole || selectedRole.trim() === "") {
         setRoleError("Please enter or select a role");
         return;
      }

      // Add member if all validations pass
      setCommitteeMembership((prev) => [
         ...prev,
         { memberId, role: selectedRole },
      ]);
      setSearchTerm("");
      setSelectedMemberId("");
      setSelectedRole(roles[0]); // Reset to first role
   };

   const removeMember = (memberId) => {
      setCommitteeMembership((prev) =>
         prev.filter((m) => m.memberId !== memberId)
      );
      setRoleError(""); // Clear error when removing member
   };

   // Handle role input change and clear errors
   const handleRoleChange = (value) => {
      setSelectedRole(value);
      setRoleError(""); // Clear error when role changes
   };

   const handleSubmit = async () => {
      // Basic validations
      if (!committeeName.trim()) {
         toast.error("Please enter a committee name");
         return;
      }
      if (!committeeDescription.trim()) {
         toast.error("Please enter a committee description");
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

      // Check if at least one member is added
      if (committeeMembership.length === 0) {
         toast.error("Please add at least one member to the committee");
         return;
      }

      // Transform memberships to required map schema: { "memberId": "ROLE" }
      const membersMap = {};
      committeeMembership.forEach((m) => {
         if (m.memberId) {
            membersMap[String(m.memberId)] = m.role; // send as provided, backend expects strings like Chairperson/Member
         }
      });

      const payload = {
         name: committeeName.trim(),
         description: committeeDescription.trim(),
         status,
         maximumNumberOfMeetings: maxMeetNum,
         members: membersMap,
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
         <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
               <button
                  onClick={handleBackToCommittees}
                  className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
               >
                  <ArrowLeft size={16} />
                  Back
               </button>

               <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
                  <div className="border-b pb-3">
                     <h2 className="text-2xl font-bold text-gray-800">
                        Create Committee
                     </h2>
                     <p className="text-sm text-gray-500 mt-1">
                        Fill in the committee details and add members with
                        roles.
                     </p>
                  </div>

                  {/* Two Column Layout with Vertical Separator */}
                  <div className="grid grid-cols-5 gap-6">
                     {/* Left Side - Member Search and List (40% width) */}
                     <div className="col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                           Manage Members
                        </h3>

                        {/* Member Search with Icon */}
                        <div className="space-y-3">
                           <div className="relative">
                              <input
                                 className="w-full border border-gray-300 p-2 pl-10 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                 placeholder="Search members by name..."
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                              />
                              <Search
                                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                 size={16}
                              />
                           </div>

                           {/* Search results indicator */}
                           {searchTerm && (
                              <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded p-2">
                                 {filteredMembers.length === 0
                                    ? `No results found for "${searchTerm}"`
                                    : filteredMembers.length === 1
                                    ? `1 result found for "${searchTerm}"`
                                    : `${filteredMembers.length} results found for "${searchTerm}" - first one selected`}
                              </div>
                           )}
                        </div>

                        {/* Manual add and role */}
                        <div className="space-y-2">
                           <label className="block text-sm font-medium text-gray-700">
                              Add Member with Role
                           </label>
                           <div className="flex flex-col gap-2">
                              <select
                                 className="w-full border border-gray-300 p-2 rounded text-sm"
                                 value={selectedMemberId}
                                 onChange={(e) =>
                                    setSelectedMemberId(e.target.value)
                                 }
                              >
                                 <option value="">
                                    {searchTerm
                                       ? `Search results for "${searchTerm}" (${filteredMembers.length} found)`
                                       : "Select Member"}
                                 </option>
                                 {(searchTerm
                                    ? filteredMembers
                                    : membersData
                                 ).map((member) => (
                                    <option
                                       key={member.memberId}
                                       value={member.memberId}
                                    >
                                       {member.firstName} {member.lastName} (
                                       {member.post})
                                    </option>
                                 ))}
                              </select>

                              <div className="flex gap-2">
                                 <input
                                    type="text"
                                    className="flex-1 border border-gray-300 p-2 rounded text-sm"
                                    placeholder="Enter custom role (nepali)"
                                    value={selectedRole}
                                    onChange={(e) =>
                                       handleRoleChange(e.target.value)
                                    }
                                 />
                                 <select
                                    className="w-32 border border-gray-300 p-2 rounded text-sm"
                                    value={selectedRole}
                                    onChange={(e) =>
                                       handleRoleChange(e.target.value)
                                    }
                                 >
                                    <option value="">Select Role</option>
                                    {roles.map((role) => (
                                       <option key={role} value={role}>
                                          {role}
                                       </option>
                                    ))}
                                 </select>

                                 <button
                                    className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                                    onClick={() =>
                                       addMember(Number(selectedMemberId))
                                    }
                                 >
                                    Add
                                 </button>
                              </div>

                              {/* Role error message */}
                              {roleError && (
                                 <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2 mt-1">
                                    {roleError}
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Members list */}
                        <div>
                           <h4 className="font-semibold text-gray-700 mb-2">
                              Committee Members
                           </h4>
                           <div className="max-h-60 overflow-y-auto">
                              <ul className="mb-2 divide-y divide-gray-200 border border-gray-200 rounded">
                                 {committeeMembership.map((m) => {
                                    const user = membersData.find(
                                       (x) => x.memberId === m.memberId
                                    );
                                    return (
                                       <li
                                          key={m.memberId}
                                          className="py-2 px-3 flex justify-between items-center"
                                       >
                                          <div className="flex flex-col">
                                             <span className="text-sm font-medium">
                                                {user
                                                   ? `${user.firstName} ${user.lastName}`
                                                   : m.memberId}
                                             </span>
                                             <span className="text-xs text-gray-500">
                                                {capitalizeFirstLetter(m.role)}
                                             </span>
                                          </div>
                                          <button
                                             className="text-red-600 hover:text-red-700 text-sm"
                                             onClick={() =>
                                                removeMember(m.memberId)
                                             }
                                          >
                                             Remove
                                          </button>
                                       </li>
                                    );
                                 })}
                                 {committeeMembership.length === 0 && (
                                    <li className="py-3 px-3 text-sm text-gray-500">
                                       No members added yet
                                    </li>
                                 )}
                              </ul>
                           </div>
                        </div>
                     </div>

                     {/* Vertical Separator */}
                     <div className="flex justify-center">
                        <div className="w-px bg-gray-300 h-full"></div>
                     </div>

                     {/* Right Side - Committee Details (60% width) */}
                     <div className="col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                           Committee Details
                        </h3>

                        <div>
                           <label className="block mb-1 font-semibold text-gray-700">
                              Committee Name
                           </label>
                           <input
                              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Technical Committee"
                              value={committeeName}
                              onChange={(e) => setCommitteeName(e.target.value)}
                           />
                        </div>

                        <div>
                           <label className="block mb-1 font-semibold text-gray-700">
                              Description
                           </label>
                           <textarea
                              className="w-full border border-gray-300 p-2 rounded min-h-[90px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Committee Description"
                              value={committeeDescription}
                              onChange={(e) =>
                                 setCommitteeDescription(e.target.value)
                              }
                           />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                           <div>
                              <label className="block mb-1 font-semibold text-gray-700">
                                 Status
                              </label>
                              <select
                                 className="w-full border border-gray-300 p-2 rounded bg-white"
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
                              <label className="block mb-1 font-semibold text-gray-700">
                                 Maximum No. of Meetings{" "}
                                 <span className="text-gray-400 font-normal">
                                    (Optional)
                                 </span>
                              </label>
                              <input
                                 type="number"
                                 min="0"
                                 step="1"
                                 className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                 placeholder="0"
                                 value={maximumNumberOfMeetings}
                                 onChange={(e) =>
                                    setMaximumNumberOfMeetings(e.target.value)
                                 }
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-end gap-3">
                     <button
                        className="bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
                        onClick={() => navigate("/home")}
                     >
                        Cancel
                     </button>
                     <button
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
