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
export const getAllActiveFatteningRecords = async (
  selectedFarm,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const currentStage = "fattening";

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
      console.log("Active fattening error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch current fattening records",
      };
    }

    const data = await response.json();
    console.log("Active fattening data -> ", data);
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

// Get fattening history by month with pagination
export const getFatteningHistoryByMonth = async (
  year,
  month,
  selectedFarm,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const currentStage = "fattening";

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
      console.log("Fattening history error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch fattening history",
      };
    }

    const data = await response.json();
    console.log("fattening history data -> ", data);
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

// Send fattening pig to dried stage
export const sendToDried = async (record) => {
  try {
    console.log("Sending to dried ->", record);
    const updateData = {
      currentStage: "fattening",
      currentStageId: record.recordId,
      pigId: record.pigId,
      selectedFarm: record.selectedFarm,
    };
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(`${API_BASE_URL}/fattening/sendToDried`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.log("Send to Dried error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to move to Dried",
      };
    }

    const data = await response.json();
    console.log("Send to dried data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

// Send fattening pig to in-house stage
export const sendToInHouse = async (record) => {
  try {
    console.log("Sending to in-House ->", record);
    const updateData = {
      currentStage: "fattening",
      currentStageId: record.recordId,
      pigId: record.pigId,
      selectedFarm: record.selectedFarm,
    };
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(`${API_BASE_URL}/fattening/sendToInHouse`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.log("Send to InHouse error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to move to inHouse",
      };
    }

    const data = await response.json();
    console.log("Send to inHouse data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};
