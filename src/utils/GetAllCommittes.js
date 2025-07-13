export const getCommittees = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/getCommittees", {
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
  }
};
