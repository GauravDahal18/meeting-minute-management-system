import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LogOut,
  Plus,
  Search,
  Trash2,
  Eye,
  Edit,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Header from "./Header/Header.jsx";

const CommitteeDetails = () => {
  const { committeeId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [committee, setCommittee] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const fetchCommitteeDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/getCommitteeDetails?committeeId=${committeeId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Extract committee and members from the nested structure
          setCommittee(data.mainBody);
          setMembers(data.mainBody.members || []);
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

    fetchCommitteeDetails();
  }, [committeeId]);

  // Debounced search function
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
        }, 300); // 300ms delay
      };
    })(),
    []
  );

  // Search members by name API call
  const searchMembersByName = async (name) => {
    setSearchLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/searchMembersByName?name=${encodeURIComponent(
          name
        )}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter out members that are already in the committee
        console.log("Existing members structure:", members);
        const existingMemberIds = members.map(
          (member) => member.memberId || member.id
        );
        console.log("Existing member IDs:", existingMemberIds);
        console.log("Search results before filtering:", data.mainBody);
        const filteredResults = data.mainBody.filter(
          (member) => !existingMemberIds.includes(member.id)
        );
        console.log("Filtered results:", filteredResults);
        setSearchResults(filteredResults);
        setShowSearchResults(true);
      } else {
        console.error("Error searching members:", response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching members:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input change
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

  // Clear search results
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Handle add member with selected role
  const handleAddMemberClick = (member, dropdownId) => {
    const dropdown = document.getElementById(dropdownId);
    const selectedRole = dropdown ? dropdown.value : "member";
    handleAddMemberToCommittee(member, selectedRole);
  };

  const handleBackToCommittees = () => {
    navigate("/home");
  };

  const handleCreateMeeting = () => {
    // Navigate to create meeting page or open modal
    navigate(`/committee/${committeeId}/createMeeting`);
    console.log("Create meeting for committee:", committeeId);
  };

  const handleAddMember = () => {
    // Navigate to add member page or open modal
    navigate(`/committee/${committeeId}/createMember`);
    console.log("Add member to committee:", committeeId);
  };

  const handleDeleteMember = (memberId) => {
    // Delete member logic
    console.log("Delete member:", memberId);
  };

  const handleViewMeeting = (meetingId) => {
    // opening meeting preview in new tab where the server serves html directly
    const previewUrl = `http://localhost:8080/api/previewMeetingMinute?committeeId=${committeeId}&meetingId=${meetingId}&lang=en`;
    window.open(previewUrl, "_blank");
  };

  const handleEditMeeting = (meetingId) => {
    // Navigate to edit meeting
    console.log("Edit meeting:", meetingId);
  };

  const handleViewMember = (memberId) => {
    navigate(`/member/${memberId}`);
  };

  // Add member to committee
  const handleAddMemberToCommittee = async (member, role) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/addMembersToCommittee?committeeId=${committeeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify([
            {
              memberId: member.id,
              role: role,
            },
          ]),
        }
      );

      if (response.ok) {
        // Refresh committee details to get updated member list
        const committeeResponse = await fetch(
          `http://localhost:8080/api/getCommitteeDetails?committeeId=${committeeId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (committeeResponse.ok) {
          const data = await committeeResponse.json();
          setCommittee(data.mainBody);
          setMembers(data.mainBody.members || []);
        }

        // Remove the added member from search results
        setSearchResults((prev) => prev.filter((m) => m.id !== member.id));

        // Clear search if no more results
        if (searchResults.length === 1) {
          setShowSearchResults(false);
          setSearchTerm("");
        }
      } else {
        console.error("Error adding member to committee:", response.status);
      }
    } catch (error) {
      console.error("Error adding member to committee:", error);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      `${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.post.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showLogout={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">Loading committee details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showLogout={true} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mb-4">Error loading committee: {error}</div>
              <button
                onClick={handleBackToCommittees}
                className="px-4 py-2 border rounded-md hover:shadow-lg mr-2"
              >
                Back to Committees
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border rounded-md hover:shadow-lg"
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showLogout={true} />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleBackToCommittees}
            className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Committees
          </button>

          {committee ? (
            <div className="space-y-6">
              {/* Committee Header */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {committee.name}
                </h1>
                <p className="text-gray-600 mb-4">{committee.description}</p>
                <div className="text-sm text-gray-500">
                  Created:{" "}
                  {new Date(
                    committee.createdDate[0],
                    committee.createdDate[1] - 1,
                    committee.createdDate[2]
                  ).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Members Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Members
                    </h2>
                    <button
                      onClick={handleAddMember}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Add
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search members to add..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    {searchTerm && !searchLoading && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Search Results */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          Search Results
                        </h3>
                        <button
                          onClick={clearSearch}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                        {searchResults.map((member) => (
                          <div
                            key={member.id}
                            className="flex justify-between items-center p-2 hover:bg-white rounded border border-gray-100 bg-white"
                          >
                            <div className="flex-1">
                              <div className="text-sm">
                                <span className="font-medium">
                                  {member.firstName} {member.lastName}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {member.post} at {member.institution}
                              </div>
                              <div className="text-xs text-gray-400">
                                {member.qualification}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                id={`role-${member.id}`}
                                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                defaultValue="member"
                              >
                                <option value="member">Member</option>
                                <option value="member-secretary">
                                  Member-Secretary
                                </option>
                                <option value="invitee">Invitee</option>
                              </select>
                              <button
                                onClick={() =>
                                  handleAddMemberClick(
                                    member,
                                    `role-${member.id}`
                                  )
                                }
                                className="px-3 py-1 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200 transition-colors flex items-center gap-1"
                              >
                                <UserPlus size={12} />
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Search Results */}
                  {showSearchResults &&
                    searchResults.length === 0 &&
                    searchTerm.trim().length >= 2 &&
                    !searchLoading && (
                      <div className="mb-4 p-3 text-center text-gray-500 bg-gray-50 rounded-lg border">
                        No members found matching "{searchTerm}"
                      </div>
                    )}

                  {/* Existing Members List */}
                  {!showSearchResults && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredMembers.map((member, index) => (
                        <div
                          key={member.memberId}
                          className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleViewMember(member.memberId)}
                          >
                            <div className="text-sm">
                              <span className="font-medium">
                                {index + 1}. {member.firstName}{" "}
                                {member.lastName}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.post} at {member.institution}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteMember(member.memberId)}
                            className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors"
                          >
                            DEL
                          </button>
                        </div>
                      ))}
                      {filteredMembers.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                          {searchTerm
                            ? "No members found"
                            : "No members added yet"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show existing members count when searching */}
                  {showSearchResults && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Current Members ({members.length})
                      </h3>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {members.map((member, index) => (
                          <div
                            key={member.memberId}
                            className="flex justify-between items-center p-1 text-xs"
                          >
                            <span className="text-gray-600">
                              {index + 1}. {member.firstName} {member.lastName}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {member.post}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Create Member Button */}
                  <button
                    onClick={handleAddMember}
                    className="w-full mt-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Create Member
                  </button>
                </div>

                {/* Meetings Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Meetings
                    </h2>
                    <button
                      onClick={handleCreateMeeting}
                      className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
                    >
                      Create Meeting
                    </button>
                  </div>

                  {/* Meetings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {committee.meetings && committee.meetings.length > 0 ? (
                      committee.meetings.map((meeting, index) => (
                        <div
                          key={meeting.id}
                          className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <h3 className="font-medium text-gray-800 mb-2">
                            Meeting {index + 1}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {meeting.title}
                          </p>
                          <div className="text-xs text-gray-500 mb-3">
                            {new Date(
                              meeting.heldDate[0],
                              meeting.heldDate[1] - 1,
                              meeting.heldDate[2]
                            ).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewMeeting(meeting.id)}
                              className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 transition-colors"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleEditMeeting(meeting.id)}
                              className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center text-gray-500 py-8">
                        No meetings scheduled yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No committee data found</p>
              <button
                onClick={handleBackToCommittees}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Committees
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitteeDetails;
