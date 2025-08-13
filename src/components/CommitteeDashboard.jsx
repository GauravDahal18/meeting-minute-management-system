import React, { useState, useEffect } from "react";
import { Plus, ArrowUpDown, Users, Calendar, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants.js";

const CommitteeDashboard = () => {
   const [committees, setCommittees] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showSortOptions, setShowSortOptions] = useState(false);

   const navigate = useNavigate();

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
         return data.mainBody || [];
      } catch (error) {
         console.error("Error fetching Committees:", error);
         setError(error.message);
         return [];
      }
   };

   useEffect(() => {
      const fetchCommittees = async () => {
         setLoading(true);
         try {
            const data = await getCommittees();
            const transformedData = data.map((committee) => ({
               id: committee.id,
               committeeName: committee.name,
               committeeDescription: committee.description,
               maxNoOfMeetings: committee.maxNoOfMeetings || 0,
               numberOfMeetings: committee.numberOfMeetings || 0,
               numberOfMembers: committee.numberOfMembers || 0,
               status: committee.status,
               createdDate: new Date(
                  committee.createdDate[0],
                  committee.createdDate[1] - 1,
                  committee.createdDate[2]
               ),
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

   const sortCommitteesByDate = () => {
      setCommittees((prev) =>
         [...prev].sort(
            (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
         )
      );
      setShowSortOptions(false);
   };

   const sortCommitteesByName = () => {
      setCommittees((prev) =>
         [...prev].sort((a, b) =>
            a.committeeName.localeCompare(b.committeeName)
         )
      );
      setShowSortOptions(false);
   };

   const toggleSortOptions = () => setShowSortOptions((s) => !s);

   const handleCreateCommittee = () => navigate("/home/createCommittee");
   const handleCommitteeClick = (committee) =>
      navigate(`/committee/${committee.id}`);

   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-600">
               Loading committees...
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center bg-white p-6 rounded-lg shadow border">
               <div className="text-4xl mb-2">⚠️</div>
               <div className="font-semibold mb-1">
                  Error Loading Committees
               </div>
               <div className="text-sm text-gray-600 mb-4">{error}</div>
               <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
               >
                  Try Again
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6 bg-white rounded-lg shadow border p-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Building2 className="text-blue-600" size={28} />
                     <div>
                        <h1 className="text-xl font-semibold text-gray-800">
                           Committee Dashboard
                        </h1>
                        <p className="text-sm text-gray-500">
                           Manage your committees, meetings, and members
                        </p>
                     </div>
                  </div>

                  <div className="flex gap-2">
                     <button
                        onClick={handleCreateCommittee}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                     >
                        <Plus size={16} /> Create Committee
                     </button>
                     <div className="relative">
                        <button
                           onClick={toggleSortOptions}
                           className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors font-medium"
                        >
                           <ArrowUpDown size={16} /> Sort
                        </button>
                        {showSortOptions && (
                           <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                 onClick={sortCommitteesByName}
                                 className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors font-medium text-sm first:rounded-t-lg"
                              >
                                 Sort by Name (A-Z)
                              </button>
                              <button
                                 onClick={sortCommitteesByDate}
                                 className="block w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors font-medium text-sm last:rounded-b-lg border-t border-gray-100"
                              >
                                 Sort by Created Date
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="bg-white border rounded shadow p-4">
                  <div className="flex items-center gap-3">
                     <Building2 className="text-blue-600" size={20} />
                     <div>
                        <div className="text-xs text-gray-500">
                           Total Committees
                        </div>
                        <div className="text-xl font-semibold text-gray-800">
                           {committees.length}
                        </div>
                     </div>
                  </div>
               </div>
               <div className="bg-white border rounded shadow p-4">
                  <div className="flex items-center gap-3">
                     <Users className="text-green-600" size={20} />
                     <div>
                        <div className="text-xs text-gray-500">
                           Total Members
                        </div>
                        <div className="text-xl font-semibold text-gray-800">
                           {committees.reduce(
                              (sum, c) => sum + c.numberOfMembers,
                              0
                           )}
                        </div>
                     </div>
                  </div>
               </div>
               <div className="bg-white border rounded shadow p-4">
                  <div className="flex items-center gap-3">
                     <Calendar className="text-orange-600" size={20} />
                     <div>
                        <div className="text-xs text-gray-500">Meetings</div>
                        <div className="text-2xl font-semibold text-gray-800">
                           {committees.reduce(
                              (sum, c) => sum + c.numberOfMeetings,
                              0
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white border rounded-lg shadow p-5">
               <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                     Committees
                  </h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                  {committees.map((committee) => (
                     <button
                        key={committee.id}
                        onClick={() => handleCommitteeClick(committee)}
                        className="text-left bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 hover:bg-gray-100"
                        style={{ border: "1px solid #c4c9d0" }}
                     >
                        <div className="flex items-center justify-between mb-3 ">
                           <div className="font-semibold text-gray-800 truncate mr-2">
                              {committee.committeeName}
                           </div>
                           <span
                              className={`text-xs px-2 py-0.5 rounded border ${
                                 committee.status === "ACTIVE"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                              }`}
                           >
                              {committee.status}
                           </span>
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2 mb-4">
                           {committee.committeeDescription || "No description"}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                           <span className="inline-flex items-center gap-1">
                              <Users size={14} />{" "}
                              <span className="text-xs text-gray-600">
                                 Members:
                              </span>{" "}
                              <span className="font-semibold">
                                 {committee.numberOfMembers}
                              </span>
                           </span>
                           <span className="inline-flex items-center gap-1 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                              <Calendar size={14} className="text-orange-600" />
                              <span className="text-xs font-semibold text-orange-700">
                                 Meetings:
                              </span>
                              <span className="font-bold text-orange-800">
                                 {committee.numberOfMeetings}
                              </span>
                              {committee.maxNoOfMeetings > 0 ? (
                                 <span className="text-orange-600">
                                    /{committee.maxNoOfMeetings}
                                 </span>
                              ) : (
                                 ""
                              )}
                           </span>
                        </div>
                     </button>
                  ))}
               </div>
               {committees.length === 0 && (
                  <div className="text-center text-gray-500 py-10">
                     No committees found
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default CommitteeDashboard;
