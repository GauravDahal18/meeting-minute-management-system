import React, { useState, useEffect } from "react";
import { Plus, ArrowUpDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const CommitteeDashboard = () => {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSortOptions, setShowSortOptions] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  // API service to fetch committees
  const getCommittees = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/getCommittees", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Return the mainBody array from the API response
      return data.mainBody || [];
    } catch (error) {
      console.error("Error fetching Committees:", error);
      setError(error.message);
      return [];
    }
  };

  // Load Committees on component mount
  useEffect(() => {
    const fetchCommittees = async () => {
      setLoading(true);
      try {
        const data = await getCommittees();
        // Transform API data to match component structure
        const transformedData = data.map((committee) => ({
          id: committee.committeeId,
          committeeName: committee.committeeName,
          committeeDescription: committee.committeeDescription,
          committeeMembers: committee.committeeMembers || [], // Handle missing members
          createdDate: new Date(
            committee.createdDate[0],
            committee.createdDate[1] - 1,
            committee.createdDate[2]
          ), // Convert array format to Date
          createdBy: committee.createdBy || "Unknown", // Handle missing createdBy
        }));
        setCommittees(transformedData);
      } catch (error) {
        console.error("Failed to load Committees:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommittees();
  }, []);

  // Sort committees by createdDate and committee name
  const sortCommitteesByDate = () => {
    const sorted = [...committees].sort((a, b) => {
      return new Date(b.createdDate) - new Date(a.createdDate); // Newest first
    });
    setCommittees(sorted);
    setShowSortOptions(false);
  };

  const sortCommitteesByName = () => {
    const sorted = [...committees].sort((a, b) => {
      return a.committeeName.localeCompare(b.committeeName); // A-Z
    });
    setCommittees(sorted);
    setShowSortOptions(false);
  };

  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
  };

  // Navigate to create Committee URL
  const handleCreateCommittee = () => {
    navigate("/home/createCommittee");
  };

  // Navigate to committee detail URL
  const handleCommitteeClick = (committee) => {
    const url = `/committee/${committee.id}`;
    navigate(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading Committees...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="mb-4">Error loading Committees: {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border rounded-md hover:shadow-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Committee Manager Dashboard
        </h1>

        <div className="border-2 rounded-lg p-6 mb-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 flex-wrap">
              {committees.map((committee) => (
                <div
                  key={committee.id}
                  onClick={() => handleCommitteeClick(committee)}
                  className="border-2 rounded-lg p-4 w-64 h-32 cursor-pointer hover:shadow-lg transition-shadow bg-blue-50 hover:bg-blue-100 flex flex-col"
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-1">
                    {committee.committeeName}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-3 flex-1">
                    {committee.committeeDescription ||
                      "No description available"}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleCreateCommittee}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Create Committee
              </button>

              <div className="relative">
                <button
                  onClick={toggleSortOptions}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
                >
                  <ArrowUpDown size={16} />
                  Sort Committee
                </button>

                {showSortOptions && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <button
                      onClick={sortCommitteesByName}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      Sort by Name (A-Z)
                    </button>
                    <button
                      onClick={sortCommitteesByDate}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      Sort by Created Date (Newest First)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeDashboard;
