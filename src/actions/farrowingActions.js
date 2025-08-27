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
export const getAllActiveFarrowingRecords = async (
  selectedFarm,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const currentStage = "farrowing";

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
      console.log("Active farrowing error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch current farrowing records",
      };
    }

    const data = await response.json();
    console.log("Active farrowing data -> ", data);
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
export const getFarrowingHistoryByMonth = async (
  year,
  month,
  selectedFarm,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const currentStage = "farrowing";

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
      console.log("Farrowing history error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch farrowing history",
      };
    }

    const data = await response.json();
    console.log("Farrowing history data -> ", data);
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

// Send farrowing pig to nursery stage
export const sendToNursery = async (record) => {
  console.log("record ->", record);
  try {
    console.log("Sending to nursery ->", record);
    const farrowingId = record.recordId;
    const updateData = {
      pigId: record.pigId,
      selectedFarm: record.selectedFarm,
    };
    console.log("updateData ->", updateData);
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `${API_BASE_URL}/farrowing/sendToNursery/${farrowingId}`,
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
      console.log("Send to nursery error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to move to nursery",
      };
    }

    const data = await response.json();
    console.log("Send to nursery data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

// Update farrowing record - API DONE
export const updateFarrowingRecord = async (updateData) => {
  try {
    const farrowingId = updateData.recordId;
    const pigId = updateData.pigId;
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    console.log("updateData :", updateData);

    const response = await fetch(
      `${API_BASE_URL}/farrowing/update/${farrowingId}/${pigId}`,
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
      console.log("Update farrowing record error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to update farrowing record",
      };
    }

    const data = await response.json();
    console.log("Update farrowing record data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};
