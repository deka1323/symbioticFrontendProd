import { fetchAuthSession } from "aws-amplify/auth";

export const getPigDetailsByPigId = async (pigId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `https://your-api-id.execute-api.region.amazonaws.com/prod/pigs/${pigId}`,
      {
        method: "GET",
        headers: {
          Authorization: idToken,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || "Failed to fetch pig data");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
