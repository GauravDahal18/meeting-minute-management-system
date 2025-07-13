import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X, Plus } from "lucide-react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";

import { getCommittees } from "../utils/GetAllCommittes";
import { getCommitteeDetails } from "../utils/GetCommitteeMembers";
import axios from "axios";

const CreateMeetingDialog = () => {
  const navigate = useNavigate();
  const { committeeId } = useParams();

  const [meetingDate, setMeetingDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [heldTime, setHeldTime] = useState("14:30:00");
  const [meetingPlace, setMeetingPlace] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coordinatorId, setCoordinatorId] = useState("");
  const [decisions, setDecisions] = useState([""]);

  const [allCommittees, setAllCommittees] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [attendees, setAttendees] = useState([]);

  const [loading, setLoading] = useState(true);

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

  const addDecisionRow = () => setDecisions((d) => [...d, ""]);
  const updateDecision = (idx, val) =>
    setDecisions((prev) => prev.map((d, i) => (i === idx ? val : d)));

  const addAttendee = (id) =>
    setAttendees((prev) =>
      prev.some((a) => a.id === id) ? prev : [...prev, { id }]
    );

  const removeAttendee = (id) =>
    setAttendees((prev) => prev.filter((a) => a.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !committeeId ||
      !title.trim() ||
      !description.trim() ||
      !meetingPlace.trim() ||
      !coordinatorId ||
      attendees.length === 0
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      heldDate: meetingDate,
      heldPlace: meetingPlace.trim(),
      heldTime,
      coordinator: { id: Number(coordinatorId) },
      attendees: attendees.map((a) => ({ id: a.id })),
      decisions: decisions
        .filter((d) => d.trim())
        .map((d) => ({ decision: d.trim() })),
    };
    console.log("Creating meeting with payload:", payload);
    try {
      const response = await axios.post(
        `http://localhost:8080/api/committee/createMeeting?committeeId=${committeeId}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
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
      toast.error(
        error.message || "An error occurred while creating the meeting."
      );
    }
  };

  const handleCancel = () => navigate(-1);

  if (loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white">
      <div className="w-full max-w-5xl rounded-2xl border-4 border-gray-800 bg-white p-6 shadow-lg text-black">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">Create Meeting</h2>
          <button
            onClick={handleCancel}
            aria-label="Close"
            className="rounded-full p-1 hover:bg-gray-200"
          >
            <X size={20} className="text-black" />
          </button>
        </div>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onSubmit={handleSubmit}
        >
          {/* Left: Members */}
          <div className="border border-gray-400 p-4 rounded-md max-h-[32rem] overflow-y-auto text-black">
            <h3 className="text-lg font-semibold mb-2 text-black">Members</h3>
            <ul className="space-y-2">
              {availableMembers.map((member) => {
                const isAttendee = attendees.some((a) => a.id === member.id);
                return (
                  <li
                    key={member.id}
                    className="flex justify-between items-center text-black"
                  >
                    <span>{member.name}</span>
                    {isAttendee ? (
                      <>
                        <p className="text-green-600">Added</p>
                        <button
                          type="button"
                          onClick={() => removeAttendee(member.id)}
                          className="px-2 py-1 text-sm rounded hover:bg-red-600 text-black"
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addAttendee(member.id)}
                        className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        ADD
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-4">
            <select
              required
              value={committeeId}
              onChange={() => {}}
              className="w-full rounded-md border border-gray-400 px-3 py-2 text-black"
              disabled
            >
              <option value="">-- Select committee --</option>
              {allCommittees.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Meeting Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-400 px-3 py-2 text-black"
              required
            />

            <textarea
              placeholder="Meeting Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-400 px-3 py-2 text-black"
              required
            />

            <input
              type="date"
              required
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full rounded-md border border-gray-400 px-3 py-2 text-black"
            />

            <input
              type="time"
              value={heldTime}
              onChange={(e) => setHeldTime(e.target.value)}
              className="w-full rounded-md border border-gray-400 px-3 py-2 text-black"
              required
            />

            <input
              type="text"
              placeholder="Meeting Place"
              value={meetingPlace}
              onChange={(e) => setMeetingPlace(e.target.value)}
              className="w-full rounded-md border border-gray-400 px-3 py-2 text-black"
              required
            />

            <select
              required
              value={coordinatorId}
              onChange={(e) => setCoordinatorId(e.target.value)}
              className="w-full rounded-md border border-gray-400 px-3 py-2 text-black"
            >
              <option value="">-- Select coordinator --</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* Decisions */}
            <div>
              <span className="mb-1 block text-sm font-medium text-black">
                Decisions
              </span>
              <div className="max-h-48 overflow-y-auto mb-2">
                {decisions.map((d, idx) => (
                  <textarea
                    key={idx}
                    placeholder={`Decision ${idx + 1}`}
                    value={d}
                    onChange={(e) => updateDecision(idx, e.target.value)}
                    className="mb-2 w-full rounded-md border border-gray-400 px-3 py-2 text-black"
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={addDecisionRow}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
              >
                <Plus size={16} /> Add another decision
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md px-4 py-2 text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Save meeting
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingDialog;
