import { fetchAuthSession } from "aws-amplify/auth";

export const getPigDetailsByPigId = async (pigId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    // console.log(pigId);

    const response = await fetch(
      `https://a965c4z4db.execute-api.ap-south-1.amazonaws.com/beta/getPigDetailsByPigId/${pigId} `,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    // console.log("response -> ", response);

    if (!response.ok) {
      const errorBody = await response.json();
      return {
        success: false,
        data: errorBody.message || "Failed to fetch pig data",
      };
    }

    const data = await response.json();
    console.log("data ->", data);
    return { success: true, data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

export const getPigStageHistoryByPigId = async (pigId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `https://a965c4z4db.execute-api.ap-south-1.amazonaws.com/beta/getPigStageHistoryById/${pigId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    console.log("response ->", response);

    if (!response.ok) {
      const errorBody = await response.json();
      return {
        success: false,
        data: errorBody.message || "Failed to fetch stage history",
      };
    }

    const data = await response.json();
    console.log("StageData ->", data);
    return { success: true, data };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getPigMedicalHistoryByPigId = async (pigId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `https://a965c4z4db.execute-api.ap-south-1.amazonaws.com/beta/getPigMedicalHistoryById/${pigId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      return {
        success: false,
        data: errorBody.message || "Failed to fetch medical history",
      };
    }

    const data = await response.json();
    console.log("MedicalData ->", data);
    return { success: true, data };
  } catch (error) {
    return { success: false, data: error.message };
  }
};
