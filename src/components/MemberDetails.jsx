import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  Award,
  Building,
  User,
  Eye,
} from "lucide-react";

const MemberDetails = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommittee, setSelectedCommittee] = useState(null);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/getMemberDetails?memberId=${memberId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMember(data.mainBody);
        } else {
          setError(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching member details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [memberId]);

  const handleBackToCommittee = () => {
    navigate(-1); // Go back to previous page
  };

  const handleBackToCommittees = () => {
    navigate("/home");
  };

  const handleCommitteeSelect = (committeeData) => {
    setSelectedCommittee(committeeData);
  };

  const handleViewMeeting = (committeeId, meetingId) => {
    const previewUrl = `http://localhost:8080/api/previewMeetingMinute?committeeId=${committeeId}&meetingId=${meetingId}&lang=en`;
    window.open(previewUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">Loading member details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mb-4">Error loading member: {error}</div>
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
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleBackToCommittees}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Committees
            </button>
          </div>

          {member ? (
            <div className="space-y-6">
              {/* Member Header */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      {member.firstName} {member.lastName}
                    </h1>
                    <p className="text-gray-600 text-lg">{member.post}</p>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={() => navigate(`/member/${memberId}/edit`)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm"
                    >
                      Edit Member
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Building size={20} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Institution</p>
                      <p className="font-medium">{member.institution}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Qualification</p>
                      <p className="font-medium">{member.qualification}</p>
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Users size={24} className="text-blue-600" />
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Committees & Meetings
                  </h2>
                </div>

                {member.committeeWithMeetings &&
                member.committeeWithMeetings.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   
                    <div className="border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Committees ({member.committeeWithMeetings.length})
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          
                        </p>
                      </div>
                      <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                        {member.committeeWithMeetings.map((committeeData) => (
                          <div
                            key={committeeData.committeeInfo.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              selectedCommittee?.committeeInfo.id ===
                              committeeData.committeeInfo.id
                                ? "bg-blue-50 border-blue-200 shadow-sm"
                                : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                            onClick={() => handleCommitteeSelect(committeeData)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 mb-1">
                                  {committeeData.committeeInfo.committeeName}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {
                                    committeeData.committeeInfo
                                      .committeeDescription
                                  }
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {committeeData.committeeInfo.role}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {committeeData.meetingInfos.length}{" "}
                                    meeting(s)
                                  </span>
                                </div>
                              </div>
                              {selectedCommittee?.committeeInfo.id ===
                                committeeData.committeeInfo.id && (
                                <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    
                    <div className="border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Meeting(s)
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedCommittee
                            ? `${selectedCommittee.meetingInfos.length} meeting(s) attended`
                            : ""}
                        </p>
                      </div>
                      <div className="p-4">
                        {selectedCommittee ? (
                          selectedCommittee.meetingInfos.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              {selectedCommittee.meetingInfos.map((meeting) => (
                                <div
                                  key={meeting.id}
                                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-800 mb-1">
                                        {meeting.meetingTitle}
                                      </h5>
                                      <p className="text-sm text-gray-600 mb-3">
                                        {meeting.meetingDescription}
                                      </p>
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                          <Calendar
                                            size={14}
                                            className="text-gray-400"
                                          />
                                          <span className="text-xs text-gray-500">
                                            ID: {meeting.id}
                                          </span>
                                        </div>
                                       
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleViewMeeting(
                                          selectedCommittee.committeeInfo.id,
                                          meeting.id
                                        )
                                      }
                                      className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200 transition-colors ml-3"
                                    >
                                      <Eye size={14} />
                                      View
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Calendar
                                size={48}
                                className="text-gray-300 mx-auto mb-4"
                              />
                              <p className="text-gray-500">No meetings found</p>
                              <p className="text-gray-400 text-sm">
                                No meetings attended in this committee yet.
                              </p>
                            </div>
                          )
                        ) : (
                          <div className="text-center py-12">
                            <Users
                              size={48}
                              className="text-gray-300 mx-auto mb-4"
                            />
                            <p className="text-gray-500">Select a Committee</p>
                            <p className="text-gray-400 text-sm">
                              Click on a committee from the left panel to view
                              attended meetings.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No committees found</p>
                    <p className="text-gray-400 text-sm">
                      This member is not associated with any committees yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No member data found</p>
              <button
                onClick={handleBackToCommittee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;
