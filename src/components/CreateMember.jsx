import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import dropdownData from "../utils/jsonData/createMember.json";
import axios from "axios";

const CreateMemberDialog = () => {
  const navigate = useNavigate();
  const { communityId } = useParams();
  console.log("Community ID:", communityId);

  const { roles, posts, institutions } = dropdownData;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [qualification, setQualification] = useState("");
  const [role, setRole] = useState(roles[0].value);
  const [post, setPost] = useState(posts[0]);
  const [institution, setInstitution] = useState(institutions[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !qualification.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      institution,
      post,
      qualification: qualification.trim(),
      email: email.trim(),
      memberships: [
        {
          role,
        },
      ],
    };

    try {
      const response = await axios.post(
        `http://locahost:8080/api/createMember?committeeId=${communityId}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.ok) {
        toast.success("Member created successfully! Redirecting...");
        navigate(-1);
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message || "Failed to create member. Please try again."
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md text-black border border-gray-700 rounded-lg p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Create Member</h2>

        {/* First Name & Last Name side by side */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-semibold">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-400 px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-400 px-3 py-2 rounded"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-400 px-3 py-2 rounded"
            required
          />
        </div>

        {/* Qualification */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Qualification</label>
          <input
            type="text"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            className="w-full border border-gray-400 px-3 py-2 rounded"
            required
          />
        </div>

        {/* Institution Dropdown */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Institution</label>
          <select
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="w-full border border-gray-400 px-3 py-2 rounded"
          >
            {institutions.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>
        </div>

        {/* Post Dropdown */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Post</label>
          <select
            value={post}
            onChange={(e) => setPost(e.target.value)}
            className="w-full border border-gray-400 px-3 py-2 rounded"
          >
            {posts.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Role Dropdown */}
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-400 px-3 py-2 rounded"
          >
            {roles.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMemberDialog;
