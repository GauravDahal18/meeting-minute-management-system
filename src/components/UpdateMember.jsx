import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext.jsx";
import { BASE_URL } from "../utils/constants.js";

const UpdateMember = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState(null);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameNepali, setFirstNameNepali] = useState("");
  const [lastNameNepali, setLastNameNepali] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [post, setPost] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/getMemberDetails?memberId=${memberId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to load member details");
        const data = await res.json();
        const m = data?.mainBody || {};
        const init = {
          id: Number(memberId),
          firstName: m.firstName || "",
          lastName: m.lastName || "",
          firstNameNepali: m.firstNameNepali || "",
          lastNameNepali: m.lastNameNepali || "",
          email: m.email || "",
          institution: m.institution || "",
          post: m.post || "",
        };
        setInitial(init);
        setFirstName(init.firstName);
        setLastName(init.lastName);
        setFirstNameNepali(init.firstNameNepali);
        setLastNameNepali(init.lastNameNepali);
        setEmail(init.email);
        setInstitution(init.institution);
        setPost(init.post);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load member details");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [memberId, navigate]);

  const buildPayload = useMemo(() => {
    return () => {
      const payload = { id: Number(memberId) };
      if (!initial) return payload;

      const fn = firstName.trim();
      const ln = lastName.trim();
      const fnNep = firstNameNepali.trim();
      const lnNep = lastNameNepali.trim();
      const em = email.trim();
      const inst = institution.trim();
      const p = post.trim();

      if (fn && fn !== initial.firstName) payload.firstName = fn;
      if (ln && ln !== initial.lastName) payload.lastName = ln;
      if (fnNep && fnNep !== initial.firstNameNepali)
        payload.firstNameNepali = fnNep;
      if (lnNep && lnNep !== initial.lastNameNepali)
        payload.lastNameNepali = lnNep;
      if (inst && inst !== initial.institution) payload.institution = inst;
      if (p && p !== initial.post) payload.post = p;
      if (em && em !== initial.email) payload.email = em;

      return payload;
    };
  }, [
    firstName,
    lastName,
    firstNameNepali,
    lastNameNepali,
    institution,
    post,
    email,
    memberId,
    initial,
  ]);

  const handleBackToCommittees = () => navigate(-1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!initial) return;

    const payload = buildPayload();

    if (Object.keys(payload).length <= 1) {
      toast.info("No changes to update");
      return;
    }

    // Show confirmation dialog
    setShowUpdateConfirmation(true);
  };

  const confirmUpdate = async () => {
    if (!initial) return;

    const payload = buildPayload();

    try {
      const response = await axios.post(
        `${BASE_URL}/api/updateMemberDetails`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Member updated successfully");
        setShowUpdateConfirmation(false);
        navigate(-1);
      } else {
        toast.error("Failed to update member");
      }
    } catch (error) {
      console.error("Update member error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred during update"
      );
    } finally {
      setShowUpdateConfirmation(false);
    }
  };

  const cancelUpdate = () => {
    setShowUpdateConfirmation(false);
  };

  if (loading) return null;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } flex flex-col transition-colors duration-200`}
    >
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBackToCommittees}
            className={`flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors`}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl shadow-lg border p-6 transition-colors duration-200`}
          >
            <h2
              className={`text-2xl font-bold mb-6 text-center ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              } transition-colors duration-200`}
            >
              Update Member
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block mb-1 font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } transition-colors duration-200`}
                  >
                    First Name (English)
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label
                    className={`block mb-1 font-semibold ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } transition-colors duration-200`}
                  >
                    Last Name (English)
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block mb-1 font-semibold ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    } transition-colors duration-200`}
                  >
                    First Name (Nepali)
                  </label>
                  <input
                    type="text"
                    value={firstNameNepali}
                    onChange={(e) => setFirstNameNepali(e.target.value)}
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="राम"
                  />
                </div>
                <div>
                  <label
                    className={`block mb-1 font-semibold ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    } transition-colors duration-200`}
                  >
                    Last Name (Nepali)
                  </label>
                  <input
                    type="text"
                    value={lastNameNepali}
                    onChange={(e) => setLastNameNepali(e.target.value)}
                    className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="श्रेष्ठ"
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block mb-1 font-semibold ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  } transition-colors duration-200`}
                >
                  Post (Nepali)
                </label>
                <input
                  type="text"
                  value={post}
                  onChange={(e) => setPost(e.target.value)}
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="डाक्टर, प्रोफेसर"
                />
              </div>

              <div>
                <label
                  className={`block mb-1 font-semibold ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } transition-colors duration-200`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="ram.sharma@example.com"
                />
              </div>

              <div>
                <label
                  className={`block mb-1 font-semibold ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } transition-colors duration-200`}
                >
                  Institution
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Pulchowk Campus, IOE"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className={`px-4 py-2 border rounded transition-colors duration-200 ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors duration-200"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showUpdateConfirmation && (
        <React.Fragment>
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"></div>

          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className={`border-2 border-orange-200 rounded-lg p-6 shadow-lg max-w-lg w-full transition-colors duration-200 ${
                isDarkMode
                  ? "bg-gray-800 border-orange-800"
                  : "bg-white border-orange-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-7 w-7 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    Update Member
                  </h3>
                  <p
                    className={`text-sm mb-4 transition-colors duration-200 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    This change will apply to all committees the member is part
                    of.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={cancelUpdate}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors font-medium ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmUpdate}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors font-medium"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default UpdateMember;
