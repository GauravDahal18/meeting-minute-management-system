import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const CommitteeDetails = () => {
  const { committeeId } = useParams();
  const [committee, setCommittee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommitteeDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/getCommitteeDetails?committeeId=${committeeId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data); // Debug log
          // Fix: Extract committee from the nested structure
          setCommittee(data.mainBody.committee);
        } else {
          setError(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching committee details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommitteeDetails();
  }, [committeeId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Committee Details</h1>
      <p>Committee ID: {committeeId}</p>

      {committee ? (
        <div>
          <h2>{committee.committeeName || "No name available"}</h2>
          <p>{committee.committeeDescription || "No description available"}</p>
          {/* <pre>{JSON.stringify(committee, null, 2)}</pre> Debug output */}
        </div>
      ) : (
        <div>No committee data found</div>
      )}
    </div>
  );
};

export default CommitteeDetails;
