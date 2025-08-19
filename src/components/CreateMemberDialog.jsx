import React, { useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import dropdownData from "../utils/jsonData/createMember.json";
import axios from "axios";
import COMMITTEE_ROLES from "../utils/roleConstants";
import { useTheme } from "../context/ThemeContext.jsx";
import { BASE_URL } from "../utils/constants.js";

const CreateMemberDialog = ({
  isOpen,
  onClose,
  committeeId,
  onMemberCreated,
}) => {
  const { posts } = dropdownData;
  const { isDarkMode } = useTheme();

  // Use the global roles constant
  const roleOptions = COMMITTEE_ROLES;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameNepali, setFirstNameNepali] = useState("");
  const [lastNameNepali, setLastNameNepali] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [post, setPost] = useState("");
  const [institution, setInstitution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  if (!isOpen) return null;

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
        `${BASE_URL}/api/createMember?committeeId=${committeeId}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Notify parent component about successful creation with the complete response
        if (onMemberCreated && typeof onMemberCreated === "function") {
          onMemberCreated(response.data);
        }

        // Reset form
        setFirstName("");
        setLastName("");
        setFirstNameNepali("");
        setLastNameNepali("");
        setEmail("");
        setRole("");
        setCustomRole("");
        setInstitution("");
        setPost("");
        setShowErrors(false);

        // Close dialog
        onClose();
      } else {
        toast.error("Failed to create member. Please try again.");
      }
    } catch (error) {
      console.error("Error creating member:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className={`rounded-lg shadow-xl w-full max-w-2xl transition-colors duration-200 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div
          className={`flex justify-between items-center border-b p-4 transition-colors duration-200 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-bold transition-colors duration-200 ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Create New Member
          </h2>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* First Name & Last Name side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block mb-1 font-semibold transition-colors duration-200 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                    : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Enter first name"
                required
              />
            </div>

            <div>
              <label
                className={`block mb-1 font-semibold transition-colors duration-200 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                    : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          {/* Separator line */}
          <div
            className={`border-t pt-4 transition-colors duration-200 ${
              isDarkMode ? "border-gray-600" : "border-gray-300"
            }`}
          >
            <p
              className={`text-xs mb-4 transition-colors duration-200 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              The following fields will be used in meeting minutes
            </p>

            {/* First Name (Nepali) & Last Name (Nepali) side by side */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className={`block mb-1 font-semibold transition-colors duration-200 ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  First Name (Nepali) *
                </label>
                <input
                  type="text"
                  value={firstNameNepali}
                  onChange={(e) => setFirstNameNepali(e.target.value)}
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                      : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                  }`}
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
                <label
                  className={`block mb-1 font-semibold transition-colors duration-200 ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  Last Name (Nepali) *
                </label>
                <input
                  type="text"
                  value={lastNameNepali}
                  onChange={(e) => setLastNameNepali(e.target.value)}
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                      : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                  }`}
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

            {/* Post */}
            <div className="mb-4">
              <label
                className={`block mb-1 font-semibold transition-colors duration-200 ${
                  isDarkMode ? "text-green-400" : "text-green-600"
                }`}
              >
                Post (Nepali) *
              </label>
              <input
                type="text"
                value={post}
                onChange={(e) => setPost(e.target.value)}
                list="post-suggestions"
                className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                    : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                }`}
                placeholder="डा., प्रा."
                required
              />
              <datalist id="post-suggestions">
                <option value="डा." />
                <option value="प्रा." />
              </datalist>
            </div>

            {/* Role */}
            <div>
              <label
                className={`block mb-1 font-semibold transition-colors duration-200 ${
                  isDarkMode ? "text-green-400" : "text-green-600"
                }`}
              >
                Role *
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
                  className={`flex-[2] border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                      : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Enter Custom Role(Nepali)"
                />
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setCustomRole(e.target.value); // Update text input when selecting from dropdown
                  }}
                  className={`flex-1 border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-gray-200"
                      : "border-gray-400 bg-white text-gray-900"
                  }`}
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
          </div>

          {/* Separator line */}
          <div
            className={`border-t pt-4 transition-colors duration-200 ${
              isDarkMode ? "border-gray-600" : "border-gray-300"
            }`}
          />

          {/* Email */}
          <div>
            <label
              className={`block mb-1 font-semibold transition-colors duration-200 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                  : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
              }`}
              placeholder="ram.shrestha@example.com"
            />
          </div>

          {/* Institution - Typeable */}
          <div>
            <label
              className={`block mb-1 font-semibold transition-colors duration-200 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Institution *
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                  : "border-gray-400 bg-white text-gray-900 placeholder-gray-500"
              }`}
              placeholder="Pulchowk Campus, IOE"
              required
            />
          </div>

          {/* Note about required fields */}
          <div
            className={`text-xs transition-colors duration-200 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          ></div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded transition-colors ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "border-gray-600 bg-white text-gray-700 hover:bg-gray-200"
              }`}
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
  );
};

export default CreateMemberDialog;
