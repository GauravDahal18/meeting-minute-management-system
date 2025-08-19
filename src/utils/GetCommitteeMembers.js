// utils/getCommitteeDetails.js
import { BASE_URL } from "./constants.js";

export const getCommitteeDetails = async (committeeId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/getCommitteeDetails?committeeId=${committeeId}`,
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
