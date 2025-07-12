// CreateCommitteeDialog.jsx
import React, { useState, useEffect } from "react";
import membersData from "./members.json";
import { useNavigate } from "react-router-dom";

const roles = ["Coordinator", "Secretary", "Member"];

const CreateCommitteeDialog = () => {
  const [committeeName, setCommitteeName] = useState("");
  const [committeeDescription, setCommitteeDescription] = useState("");
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
    const payload = {
      name: committeeName,
      description: committeeDescription,
      memberships: committeeMembership.map(membership => ({
        member: {
          id: membership.memberId
        },
        role: membership.role.toUpperCase()
      })),
    };
    console.log("Sending JSON:", JSON.stringify(payload, null, 2));
    // const reponse = await fetch(
    //   "url-to-create-committee-endpoint", // Replace with actual endpoint

    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(payload),
    //   }
    //);
    if (true) {
      // response.ok
      navigate("/home");
    }
    // onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Create Committee</h2>

        <input
          className="w-full border p-2 mb-2"
          placeholder="Community Name"
          value={committeeName}
          onChange={(e) => setCommitteeName(e.target.value)}
        />

        <textarea
          className="w-full border p-2 mb-2"
          placeholder="Community Description"
          value={committeeDescription}
          onChange={(e) => setCommitteeDescription(e.target.value)}
        ></textarea>

        <button
          className="mb-2 px-3 py-1 bg-gray-200 rounded"
          onClick={() => setShowSearchInput(!showSearchInput)}
        >
          {showSearchInput ? "Close Search" : "Search Member"}
        </button>

        {showSearchInput && (
          <input
            className="w-full border p-2 mb-2"
            placeholder="Search Members"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}

        {searchTerm && (
          <ul className="max-h-40 overflow-y-auto border rounded p-2 mb-2">
            {filteredMembers.map((member) => (
              <li
                key={member.memberId}
                className="flex justify-between items-center py-1 hover:bg-gray-100 px-2"
              >
                <span>
                  {member.memberName} ({member.collegeName})
                </span>
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                  onClick={() => addMember(member.memberId)}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2 mb-2">
          <select
            className="flex-1 border p-2"
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
            className="w-1/3 border p-2"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>

          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => addMember(Number(selectedMemberId))}
          >
            Add
          </button>
        </div>

        <ul className="mb-4">
          {committeeMembership.map((m) => {
            const user = membersData.find((x) => x.memberId === m.memberId);
            return (
              <li
                key={m.memberId}
                className="border-b py-1 flex justify-between items-center"
              >
                <span>
                  {user.memberName} - {m.role}
                </span>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  onClick={() => removeMember(m.memberId)}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => navigate("/home")}
          >
            Cancel
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommitteeDialog;
