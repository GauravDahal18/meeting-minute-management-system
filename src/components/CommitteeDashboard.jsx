import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowUpDown,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  Building2,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { BASE_URL } from "../utils/constants.js";

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
      const response = await fetch(BASE_URL + "/api/getCommittees", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.mainBody);
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
        // Transform API data to match component structure with all backend fields
        const transformedData = data.map((committee) => ({
          id: committee.id,
          committeeName: committee.name,
          committeeDescription: committee.description,
          maxNoOfMeetings: committee.maxNoOfMeetings || 0, // Handle null/undefined
          numberOfMeetings: committee.numberOfMeetings || 0,
          numberOfMembers: committee.numberOfMembers || 0,
          status: committee.status,
          createdDate: new Date(
            committee.createdDate[0],
            committee.createdDate[1] - 1,
            committee.createdDate[2]
          ), // Convert array format to Date
          createdBy: committee.createdBy || "Unknown", // Handle missing createdBy
        }));
        setCommittees(transformedData);
        console.log(transformedData);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Committees...
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch the data
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Committees
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div className="border-l-4 border-blue-500 pl-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <Building2 className="text-blue-600" size={40} />
                Committee Dashboard
              </h1>
              <p className="text-gray-600 text-lg font-medium">
                Manage and monitor all institutional committees
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCreateCommittee}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-blue-600"
              >
                <Plus size={20} />
                Create Committee
              </button>

              <div className="relative">
                <button
                  onClick={toggleSortOptions}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <ArrowUpDown size={20} />
                  Sort Committees
                </button>

                {showSortOptions && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden">
                    <button
                      onClick={sortCommitteesByName}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 flex items-center gap-2"
                    >
                      <Target size={16} className="text-blue-600" />
                      Sort by Name (A-Z)
                    </button>
                    <button
                      onClick={sortCommitteesByDate}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <Calendar size={16} className="text-blue-600" />
                      Sort by Created Date (Newest First)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white shadow-md border border-blue-400 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">
                  Total Committees
                </p>
                <p className="text-2xl font-bold">{committees.length}</p>
              </div>
              <div className="bg-blue-400/30 p-2 rounded-lg border border-blue-300">
                <Building2 size={24} className="text-blue-100" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white shadow-md border border-green-400 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">
                  Active Committees
                </p>
                <p className="text-2xl font-bold">
                  {committees.filter((c) => c.status === "ACTIVE").length}
                </p>
              </div>
              <div className="bg-green-400/30 p-2 rounded-lg border border-green-300">
                <CheckCircle size={24} className="text-green-100" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white shadow-md border border-purple-400 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">
                  Total Members
                </p>
                <p className="text-2xl font-bold">
                  {committees.reduce((sum, c) => sum + c.numberOfMembers, 0)}
                </p>
              </div>
              <div className="bg-purple-400/30 p-2 rounded-lg border border-purple-300">
                <Users size={24} className="text-purple-100" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white shadow-md border border-orange-400 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium">
                  Total Meetings
                </p>
                <p className="text-2xl font-bold">
                  {committees.reduce((sum, c) => sum + c.numberOfMeetings, 0)}
                </p>
              </div>
              <div className="bg-orange-400/30 p-2 rounded-lg border border-orange-300">
                <Calendar size={24} className="text-orange-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Committees Grid */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
          <div className="border-l-4 border-blue-500 pl-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Committee Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {committees.map((committee) => (
              <div
                key={committee.id}
                onClick={() => handleCommitteeClick(committee)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-200 hover:border-blue-300 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white border-b border-blue-400">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold truncate pr-2 group-hover:text-blue-100 transition-colors">
                      {committee.committeeName}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        committee.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-red-100 text-red-800 border-red-300"
                      }`}
                    >
                      {committee.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 border-t border-gray-100">
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 mb-3">
                    <p className="text-gray-700 text-xs leading-relaxed font-medium italic line-clamp-2">
                      "
                      {committee.committeeDescription ||
                        "No description available"}
                      "
                    </p>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 flex items-center gap-1 text-xs">
                      <div className="bg-blue-500 p-1 rounded">
                        <Users size={10} className="text-white" />
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs block">
                          Members
                        </span>
                        <span className="font-bold text-gray-800 text-sm">
                          {committee.numberOfMembers}
                        </span>
                      </div>
                    </div>

                    <div className="bg-green-50 p-2 rounded-lg border border-green-200 flex items-center gap-1 text-xs">
                      <div className="bg-green-500 p-1 rounded">
                        <Calendar size={10} className="text-white" />
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs block">
                          Meetings
                        </span>
                        <span className="font-bold text-gray-800 text-sm">
                          {committee.numberOfMeetings}
                          {committee.maxNoOfMeetings > 0
                            ? `/${committee.maxNoOfMeetings}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Meetings - Only show if maxNoOfMeetings > 0 */}
                  {committee.maxNoOfMeetings > 0 && (
                    <div className="mb-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          Progress
                        </span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1 py-0.5 rounded border border-blue-200">
                          {Math.round(
                            (committee.numberOfMeetings /
                              committee.maxNoOfMeetings) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2 border border-gray-400">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 border border-blue-300"
                          style={{
                            width: `${Math.min(
                              (committee.numberOfMeetings /
                                committee.maxNoOfMeetings) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg border border-gray-200 flex items-center gap-1 text-xs">
                    <div className="bg-gray-500 p-1 rounded">
                      <Clock size={10} className="text-white" />
                    </div>
                    <span className="text-gray-600 font-medium">
                      Created:{" "}
                      <span className="font-bold text-gray-800">
                        {committee.createdDate.toLocaleDateString()}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {committees.length === 0 && (
            <div className="text-center py-16">
              <Building2 size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Committees Found
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by creating your first committee
              </p>
              <button
                onClick={handleCreateCommittee}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Create First Committee
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitteeDashboard;
