import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import dropdownData from "../utils/jsonData/createMember.json";
import axios from "axios";

const CreateMemberDialog = () => {
  const navigate = useNavigate();
  const { committeeId } = useParams();

  const { posts } = dropdownData;

  // Role options for dropdown
  const roleOptions = [
    "Coordinator",
    "Vice Coordinator",
    "Secretary",
    "Joint Secretary",
    "Member",
    "Chairperson",
    "Vice Chairperson",
    "Treasurer",
    "Invitee Member",
    "Advisor",
    "Observer",
    "Spokesperson",
    "Program Coordinator",
    "Technical Coordinator",
    "Event Manager",
  ];

  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // const [firstNameNepali, setFirstNameNepali] = useState("");
  // const [lastNameNepali, setLastNameNepali] = useState("");
  // const [email, setEmail] = useState("");
  // const [role, setRole] = useState("");
  // const [customRole, setCustomRole] = useState("");
  // const [post, setPost] = useState(posts[0]);
  // const [institution, setInstitution] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  // const [showErrors, setShowErrors] = useState(false);
const [firstName, setFirstName] = useState("Gaurav");
const [lastName, setLastName] = useState("Dahal");
const [firstNameNepali, setFirstNameNepali] = useState("गौरव");
const [lastNameNepali, setLastNameNepali] = useState("दाहाल");
const [email, setEmail] = useState("gaurav.dahal@example.com");
const [role, setRole] = useState("Member");
const [customRole, setCustomRole] = useState("");
const [post, setPost] = useState(posts[0]);
const [institution, setInstitution] = useState("Kathmandu University");
const [isLoading, setIsLoading] = useState(false);
const [showErrors, setShowErrors] = useState(false); 

  useEffect(() => {
    console.log("CreateMember: Component mounted", { committeeId });
    if (!committeeId) {
      console.error("CreateMember: No committeeId provided");
      navigate("/home");
      return;
    }
    return () => {
      console.log("CreateMember: Component unmounted");
    };
  }, [committeeId, navigate]);

  console.log("CreateMember: Component rendering", { committeeId });

  // Don't render if no committeeId
  if (!committeeId) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isMissing =
      !firstName.trim() ||
      !lastName.trim() ||
      !firstNameNepali.trim() ||
      !lastNameNepali.trim() ||
      (!role.trim() && !customRole.trim()) ||
      !institution.trim() ||
      !post.trim();

    if (isMissing) {
      setShowErrors(true);
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);

    // Use custom role if provided, otherwise use selected role
    const finalRole = customRole.trim() || role.trim();

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      firstNameNepali: firstNameNepali.trim(),
      lastNameNepali: lastNameNepali.trim(),
      institution: institution.trim(),
      post: post.trim(),
      role: finalRole,
    };

    // Only include email if it's provided
    if (email.trim()) {
      payload.email = email.trim();
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/createMember?committeeId=${committeeId}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Member created successfully! Redirecting...");
        navigate(-1);
      } else {
        toast.error("Failed to create member. Please try again.");
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

          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Create Member
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name & Last Name side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    First Name (English)
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter first name in English"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Last Name (English)
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter last name in English"
                    required
                  />
                </div>
              </div>

              {/* First Name (Nepali) & Last Name (Nepali) side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    First Name (Nepali) *
                  </label>
                  <input
                    type="text"
                    value={firstNameNepali}
                    onChange={(e) => setFirstNameNepali(e.target.value)}
                    className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="राम"
                    required
                  />
                  {showErrors && !firstNameNepali.trim() && (
                    <p className="text-xs text-red-600 mt-1">
                      Required for minute generation
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Last Name (Nepali) *
                  </label>
                  <input
                    type="text"
                    value={lastNameNepali}
                    onChange={(e) => setLastNameNepali(e.target.value)}
                    className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="श्रेष्ठ"
                    required
                  />
                  {showErrors && !lastNameNepali.trim() && (
                    <p className="text-xs text-red-600 mt-1">
                      Required for minute generation
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ram.shrestha@example.com"
                />
              </div>

              {/* Institution - Typeable */}
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Institution
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Pulchowk Campus, IOE"
                  required
                />
              </div>

              {/* Post - Typeable in Nepali */}
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Post (Nepali)
                </label>
                <input
                  type="text"
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                  className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="प्रोफेसर, डाक्टर"
                  required
                />
              </div>

              {/* Role - Text input and dropdown on same line */}
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  Role
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRole || role}
                    onChange={(e) => {
                      setCustomRole(e.target.value);
                      if (e.target.value.trim() !== "") {
                        setRole(""); // Clear dropdown selection when typing custom role
                      }
                    }}
                    className="flex-[2] border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter custom role"
                  />
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setCustomRole(e.target.value); // Update text input when selecting from dropdown
                    }}
                    className="flex-1 border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select a role --</option>
                    {roleOptions.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {roleOption}
                      </option>
                    ))}
                  </select>
                </div>
                {showErrors && !role.trim() && !customRole.trim() && (
                  <p className="text-xs text-red-600 mt-1">
                    Please select or enter a role
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-200 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMemberDialog;
