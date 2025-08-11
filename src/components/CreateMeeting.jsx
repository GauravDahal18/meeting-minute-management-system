import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X, Plus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { getCommittees } from "../utils/GetAllCommittes";
import { getCommitteeDetails } from "../utils/GetCommitteeMembers";
import axios from "axios";

const CreateMeetingDialog = () => {
  const navigate = useNavigate();
  const { committeeId } = useParams();
  const { isAuthenticated, isAuthLoading } = useAuth();

  const [meetingDate, setMeetingDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [heldTime, setHeldTime] = useState("14:30:00");
  const [meetingPlace, setMeetingPlace] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [decisions, setDecisions] = useState([""]);
  const [agenda, setAgenda] = useState([""]);

  const [allCommittees, setAllCommittees] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [attendees, setAttendees] = useState([]);

  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error("Failed to load committees:", err);
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
          }))
        );
      } catch (err) {
        console.error("Failed to load committee members:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [committeeId]);

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

  const addAttendee = (id) =>
    setAttendees((prev) =>
      prev.some((a) => a.id === id) ? prev : [...prev, { id }]
    );

  const removeAttendee = (id) =>
    setAttendees((prev) => prev.filter((a) => a.id !== id));

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
      toast.error("Authentication verification failed. Please log in again.");
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
      !meetingPlace.trim() ||
      attendees.length === 0
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
      attendeeIds: attendees.map((a) => a.id),
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
    navigate("/home");
  };

  if (loading || isAuthLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleBackToCommittees}
            className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Committees
          </button>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Create Meeting
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in meeting details and select attendees
              </p>
              {!isAuthenticated && (
                <p className="text-sm text-red-500 mt-1">
                  ⚠️ Authentication required
                </p>
              )}
            </div>

            <form
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              onSubmit={handleSubmit}
            >
              {/* Left: Members Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Select Attendees
                </h3>
                <div className="border border-gray-200 rounded-lg p-4 max-h-[32rem] overflow-y-auto">
                  <ul className="space-y-3">
                    {availableMembers.map((member) => {
                      const isAttendee = attendees.some(
                        (a) => a.id === member.id
                      );
                      return (
                        <li
                          key={member.id}
                          className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-gray-700 font-medium">
                            {member.name}
                          </span>
                          {isAttendee ? (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 text-sm font-medium">
                                Added
                              </span>
                              <button
                                type="button"
                                onClick={() => removeAttendee(member.id)}
                                className="px-2 py-1 text-sm rounded hover:bg-red-100 text-red-600 transition-colors"
                              >
                                ❌
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addAttendee(member.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              ADD
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Right: Meeting Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Meeting Details
                </h3>

                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Committee
                  </label>
                  <select
                    value={committeeId}
                    onChange={() => {}}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  >
                    <option value="">-- Select committee --</option>
                    {allCommittees.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Monthly Progress Meeting"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    placeholder="e.g., Review of project milestones and next steps"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Time
                    </label>
                    <input
                      type="time"
                      value={heldTime}
                      onChange={(e) => setHeldTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Meeting Place
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Conference Room B"
                    value={meetingPlace}
                    onChange={(e) => setMeetingPlace(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Agenda Section */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Agenda Items
                  </label>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {agenda.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <textarea
                          placeholder={`Agenda item ${idx + 1}`}
                          value={item}
                          onChange={(e) => updateAgenda(idx, e.target.value)}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                        />
                        {agenda.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAgenda(idx)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addAgendaRow}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mt-2"
                  >
                    <Plus size={16} /> Add agenda item
                  </button>
                </div>

                {/* Decisions Section */}
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Decisions Made
                  </label>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {decisions.map((decision, idx) => (
                      <div key={idx} className="flex gap-2">
                        <textarea
                          placeholder={`Decision ${idx + 1}`}
                          value={decision}
                          onChange={(e) => updateDecision(idx, e.target.value)}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                        />
                        {decisions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDecision(idx)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addDecisionRow}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mt-2"
                  >
                    <Plus size={16} /> Add decision
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingDialog;
