import React, { useState, useEffect } from "react";
import membersData from "../utils/jsonData/members.json";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

const roles = ["Coordinator", "Secretary", "Member"];
const statusOptions = ["ACTIVE", "INACTIVE"];

const CreateCommitteeDialog = () => {
  const [committeeName, setCommitteeName] = useState("");
  const [committeeDescription, setCommitteeDescription] = useState("");
  const [status, setStatus] = useState(statusOptions[0]);
  const [maximumNumberOfMeetings, setMaximumNumberOfMeetings] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [committeeMembership, setCommitteeMembership] = useState([]);

  const navigate = useNavigate();

  const filteredMembers = membersData.filter((member) =>
    member.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addMember = (memberId) => {
    const exists = committeeMembership.find((m) => m.memberId === memberId);
    if (!exists) {
      setCommitteeMembership((prev) => [
        ...prev,
        { memberId, role: selectedRole },
      ]);
    }
    setSearchTerm("");
  };

  const removeMember = (memberId) => {
    setCommitteeMembership((prev) =>
      prev.filter((m) => m.memberId !== memberId)
    );
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
    const maxMeetNum = Number(maximumNumberOfMeetings);
    if (!Number.isInteger(maxMeetNum) || maxMeetNum <= 0) {
      toast.error("Maximum number of meetings must be a positive integer");
      return;
    }
    if (!statusOptions.includes(status)) {
      toast.error("Invalid status selected");
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
      console.log(response);
      if (response.status === 200 || response.status === 201) {
        navigate("/home");
        toast.success("Committee created successfully!");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create committee. Please try again."
      );
    }
  };

  const handleBackToCommittees = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBackToCommittees}
            className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Committees
          </button>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-2xl font-bold text-gray-800">
                Create Committee
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the committee details and add members with roles.
              </p>
            </div>

            {/* Committee Details */}
            <div className="grid grid-cols-1 gap-4">
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
                  placeholder="Handles all technical decisions and reviews"
                  value={committeeDescription}
                  onChange={(e) => setCommitteeDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    Maximum No. of Meetings
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 12"
                    value={maximumNumberOfMeetings}
                    onChange={(e) => setMaximumNumberOfMeetings(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Member Search */}
            <div className="space-y-3">
              <button
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm"
                onClick={() => setShowSearchInput(!showSearchInput)}
              >
                {showSearchInput ? "Close Search" : "Search Member"}
              </button>

              {showSearchInput && (
                <input
                  className="w-full border border-gray-300 p-2 rounded"
                  placeholder="Search members by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              )}

              {searchTerm && (
                <ul className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 text-sm">
                  {filteredMembers.map((member) => (
                    <li
                      key={member.memberId}
                      className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded"
                    >
                      <span>
                        {member.memberName} ({member.collegeName})
                      </span>
                      <button
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                        onClick={() => addMember(member.memberId)}
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Manual add and role */}
            <div className="flex gap-2 items-center">
              <select
                className="flex-1 border border-gray-300 p-2 rounded"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
              >
                <option value="">Select Member</option>
                {membersData.map((member) => (
                  <option key={member.memberId} value={member.memberId}>
                    {member.memberName} ({member.collegeName})
                  </option>
                ))}
              </select>

              <select
                className="w-1/3 border border-gray-300 p-2 rounded"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>

              <button
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                onClick={() => addMember(Number(selectedMemberId))}
              >
                Add
              </button>
            </div>

            {/* Members list */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Members</h3>
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
                      <span>
                        {user?.memberName || m.memberId} - {m.role}
                      </span>
                      <button
                        className="text-red-600 hover:text-red-700 text-sm"
                        onClick={() => removeMember(m.memberId)}
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
