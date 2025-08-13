import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

const statusOptions = ["ACTIVE", "INACTIVE"];

const UpdateCommittee = () => {
   const navigate = useNavigate();
   const { committeeId } = useParams();

   const [loading, setLoading] = useState(true);
   const [initial, setInitial] = useState(null);

   const [name, setName] = useState("");
   const [description, setDescription] = useState("");
   const [status, setStatus] = useState(statusOptions[0]);
   const [maximumNumberOfMeetings, setMaximumNumberOfMeetings] = useState("");

   useEffect(() => {
      (async () => {
         try {
            const res = await fetch(
               `http://localhost:8080/api/getCommitteeDetails?committeeId=${committeeId}`,
               { method: "GET", credentials: "include" }
            );
            if (!res.ok)
               throw new Error(`Failed to load committee ${committeeId}`);
            const data = await res.json();
            const c = data?.mainBody || {};
            const init = {
               id: Number(committeeId),
               name: c.name || "",
               description: c.description || "",
               status: c.status || statusOptions[0],
               maximumNumberOfMeetings:
                  c.maximumNumberOfMeetings || c.maxNoOfMeetings || "",
            };
            setInitial(init);
            setName(init.name);
            setDescription(init.description);
            setStatus(init.status);
            setMaximumNumberOfMeetings(init.maximumNumberOfMeetings);
         } catch (e) {
            console.error(e);
            toast.error("Failed to load committee details");
            navigate(-1);
         } finally {
            setLoading(false);
         }
      })();
   }, [committeeId, navigate]);

   const handleBackToCommittees = () => navigate("/home");

   const buildPayload = useMemo(() => {
      return () => {
         const payload = { id: Number(committeeId) };
         if (!initial) return payload;

         const trimmedName = name.trim();
         const trimmedDesc = description.trim();
         const maxMeetNum =
            maximumNumberOfMeetings === ""
               ? ""
               : Number(maximumNumberOfMeetings);

         if (trimmedName && trimmedName !== initial.name)
            payload.name = trimmedName;
         if (trimmedDesc && trimmedDesc !== initial.description)
            payload.description = trimmedDesc;
         if (status && status !== initial.status) payload.status = status;
         if (
            maxMeetNum !== "" &&
            Number.isInteger(maxMeetNum) &&
            maxMeetNum > 0 &&
            maxMeetNum !== initial.maximumNumberOfMeetings
         ) {
            payload.maximumNumberOfMeetings = maxMeetNum;
         }
         return payload;
      };
   }, [
      committeeId,
      description,
      initial,
      maximumNumberOfMeetings,
      name,
      status,
   ]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!initial) return;

      const payload = buildPayload();

      // If only id present and nothing changed, warn and exit
      if (Object.keys(payload).length <= 1) {
         toast.info("No changes to update");
         return;
      }

      try {
         const response = await axios.post(
            "http://localhost:8080/api/updateCommitteeDetails",
            payload,
            {
               headers: { "Content-Type": "application/json" },
               withCredentials: true,
            }
         );
         if (response.status === 200 || response.status === 201) {
            toast.success("Committee updated successfully");
            navigate(`/committee/${committeeId}`);
         } else {
            toast.error("Failed to update committee");
         }
      } catch (error) {
         console.error("Update committee error:", error);
         toast.error(
            error.response?.data?.message || "An error occurred during update"
         );
      }
   };

   if (loading) return null;

   return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
         <div className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
               <button
                  onClick={handleBackToCommittees}
                  className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors"
               >
                  <ArrowLeft size={16} /> Back
               </button>

               <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
                  <div className="border-b pb-3">
                     <h2 className="text-2xl font-bold text-gray-800">
                        Update Committee
                     </h2>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                     <div>
                        <label className="block mb-1 font-semibold text-gray-700">
                           Name
                        </label>
                        <input
                           className="w-full border upborder-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Committee name"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                        />
                     </div>

                     <div>
                        <label className="block mb-1 font-semibold text-gray-700">
                           Description
                        </label>
                        <textarea
                           className="w-full border border-gray-300 p-2 rounded min-h-[90px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Committee description"
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                        />
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block mb-1 font-semibold text-gray-700">
                              Status
                           </label>
                           <select
                              className="w-full border border-gray-300 p-2 rounded bg-white"
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                           >
                              {statusOptions.map((s) => (
                                 <option key={s} value={s}>
                                    {s}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block mb-1 font-semibold text-gray-700">
                              Maximum No. of Meetings
                           </label>
                           <input
                              type="number"
                              min="1"
                              step="1"
                              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., 12"
                              value={maximumNumberOfMeetings}
                              onChange={(e) =>
                                 setMaximumNumberOfMeetings(e.target.value)
                              }
                           />
                        </div>
                     </div>

                     <div className="flex justify-end gap-3 pt-2">
                        <button
                           type="button"
                           onClick={() => navigate(-1)}
                           className="bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                           Update
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
};

export default UpdateCommittee;
