import { fetchAuthSession } from "aws-amplify/auth";
import { PIG_ACTION_TYPES } from "../store/actions/pigActions";

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

export const getCurrentNurseryLitterRecords = async (
  selectedFarm,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const queryParams = { limit };
    if (lastEvaluatedKey) {
      queryParams.lastEvaluatedKey = lastEvaluatedKey;
    }

    const queryString = buildQueryString(queryParams);
    const response = await fetch(
      `${API_BASE_URL}/nursery/currentLitters/${selectedFarm}?${queryString}`,
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
      console.log("active error -> ", errorBody);
      return {
        success: false,
        data:
          errorBody.message || "Failed to fetch current nursery Litter records",
      };
    }

    const data = await response.json();
    console.log("active data -> ", data);
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

export const getNurseryLittersHistoryByMonth = async (
  year,
  month,
  selectedFarm,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const queryParams = { limit };
    if (lastEvaluatedKey) {
      queryParams.lastEvaluatedKey = lastEvaluatedKey;
    }

    const queryString = buildQueryString(queryParams);
    const response = await fetch(
      `${API_BASE_URL}/nursery/historyLitters/${selectedFarm}/${year}/${month}?${queryString}`,
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
      console.log("By month error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch Nursery Litter history",
      };
    }

    const data = await response.json();
    console.log("By month data -> ", data);
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

export const updateNurseryPigletBasicRecord = async (updateData) => {
  try {
    const litterId = updateData.litterId;
    const pigletId = updateData.pigletId;

    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    console.log("updateData :", updateData);

    const response = await fetch(
      `${API_BASE_URL}/nursery/updateBasicLitter/${litterId}/${pigletId}`,
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
      console.log("Update nursery record error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to update nursery record",
      };
    }

    const data = await response.json();
    console.log("Update nursery record data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

export const updateNurseryPigletRecord = async (updateData) => {
  try {
    const litterId = updateData.litterId;
    const pigletId = updateData.pigletId;

    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    console.log("updateData :", updateData);

    const response = await fetch(
      `${API_BASE_URL}/nursery/updateLitter/${litterId}/${pigletId}`,
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
      console.log("Update nursery record error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to update nursery record",
      };
    }

    const data = await response.json();
    console.log("Update nursery record data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

// Send nursery pig to fattening stage
export const sendToFattening = async (record) => {
  try {
    console.log("Sending to fattening ->", record);
    const updateData = {
      currentStage: "nursery",
      currentStageId: record.recordId,
      pigId: record.pigId,
      isPregnancyFailed: false,
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

// Get all active nursery records with pagination
export const getAllActiveNurseryRecords = async (
  selectedFarm,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const currentStage = "nursery";

    const queryParams = { limit };
    if (lastEvaluatedKey) {
      queryParams.lastEvaluatedKey = lastEvaluatedKey;
    }

    const queryString = buildQueryString(queryParams);
    const response = await fetch(
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
      console.log("Active nursery error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch current nursery records",
      };
    }

    const data = await response.json();
    console.log("Active nursery data -> ", data);
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
