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

// Get all active dried records with pagination
export const getAllActiveDriedRecords = async (
  selectedFarm,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const currentStage = "dried";

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
      console.log("Active dried error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch current dried records",
      };
    }

    const data = await response.json();
    console.log("Active dried data -> ", data);
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

// Get dried history by month with pagination
export const getDriedHistoryByMonth = async (
  year,
  month,
  selectedFarm,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const currentStage = "dried";

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
      console.log("Dried history error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch dried history",
      };
    }

    const data = await response.json();
    console.log("dried history data -> ", data);
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

// Send dried pig to in-house stage
export const sendToInHouse = async (record) => {
  console.log("record ->", record);
  try {
    console.log("Sending to in-house ->", record);
    const driedId = record.recordId;
    const updateData = {
      pigId: record.pigId,
      selectedFarm: record.selectedFarm,
    };
    console.log("updateData ->", updateData);
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `${API_BASE_URL}/dried/sendToInHouse/${driedId}`,
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
      console.log("Send to in-house error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to move to in-house",
      };
    }

    const data = await response.json();
    console.log("Send to inhouse data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};
