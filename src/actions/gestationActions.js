import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE_URL =
  "https://a965c4z4db.execute-api.ap-south-1.amazonaws.com/beta";

// Helper function to build query string with pagination
const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined) {
      searchParams.append(key, params[key]);
    }
  });
  return searchParams.toString();
};

// Get all active gestation records with pagination
export const getAllActiveGestationRecords = async (
  selectedFarm,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const currentStage = "gestation";

    const queryParams = { limit };
    if (lastEvaluatedKey) {
      queryParams.lastEvaluatedKey = lastEvaluatedKey;
    }

    const queryString = buildQueryString(queryParams);
    const response = await fetch(
      //   `${API_BASE_URL}/gestation/current?${queryString}`,
      //   `${API_BASE_URL}/${currentStage}/current?${queryString}`,
      `${API_BASE_URL}/current/${selectedFarm}/${currentStage}?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      console.log("Active gestation error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch current gestation records",
      };
    }

    const data = await response.json();
    console.log("Active gestation data -> ", data);
    return {
      success: true,
      data: data.data,
      lastEvaluatedKey: data.lastEvaluatedKey,
      hasMore: data.hasMore,
    };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

// Get gestation history by month with pagination
export const getGestationHistoryByMonth = async (
  year,
  month,
  selectedFarm,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const currentStage = "gestation";

    const queryParams = { limit };
    if (lastEvaluatedKey) {
      queryParams.lastEvaluatedKey = lastEvaluatedKey;
    }

    const queryString = buildQueryString(queryParams);
    const response = await fetch(
      `${API_BASE_URL}/history/${selectedFarm}/${currentStage}/${year}/${month}?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      console.log("Gestation history error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch gestation history",
      };
    }

    const data = await response.json();
    console.log("Gestation history data -> ", data);
    return {
      success: true,
      data: data.data,
      lastEvaluatedKey: data.lastEvaluatedKey,
      hasMore: data.hasMore,
      month: data.month,
    };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

// Send gestation pig to farrowing stage
export const sendToFarrowing = async (record) => {
  try {
    console.log("Sending to farrowing ->", record);
    const gestationId = record.recordId;
    const updateData = {
      pigId: record.pigId,
      selectedFarm: record.selectedFarm,
    };
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `${API_BASE_URL}/gestation/sendToFarrowing/${gestationId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      console.log("Send to farrowing error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to move to farrowing",
      };
    }

    const data = await response.json();
    console.log("Send to farrowing data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

// Send gestation pig to fattening stage (pregnancy failed)
export const sendToFattening = async (record) => {
  try {
    console.log("Sending to fattening (pregnancy failed) ->", record);
    const updateData = {
      currentStage: "gestation",
      currentStageId: record.recordId,
      pigId: record.pigId,
      isPregnancyFailed: true,
      selectedFarm: record.selectedFarm,
    };
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(`${API_BASE_URL}/gestation/sendToFattening`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.log("Send to fattening error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to move to fattening",
      };
    }

    const data = await response.json();
    console.log("Send to fattening data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};
