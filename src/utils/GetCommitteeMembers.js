// utils/getCommitteeDetails.js

export const getCommitteeDetails = async (committeeId) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/getCommitteeDetails?committeeId=${committeeId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch committee details");

    return await response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};
