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

export const getPigDetailsByPigId = async (selectedFarm, pigId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    // console.log(pigId);

    const response = await fetch(
      `${API_BASE_URL}/getPigDetailsByPigId/${pigId}/${selectedFarm}`,
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
      console.log("errorBody ->", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch pig data",
      };
    }

    const data = await response.json();
    console.log("data -------------->", data);
    return { success: true, data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

export const getPigStageHistoryByPigId = async (selectedFarm, pigId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `https://a965c4z4db.execute-api.ap-south-1.amazonaws.com/beta/getPigStageHistoryById/${pigId}/${selectedFarm}`,
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

export const getPigMedicalHistoryByPigId = async (selectedFarm, pigId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `https://a965c4z4db.execute-api.ap-south-1.amazonaws.com/beta/getPigMedicalHistoryById/${pigId}/${selectedFarm}`,
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

export const getAllFarms = async () => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `https://a965c4z4db.execute-api.ap-south-1.amazonaws.com/beta/farm/getAllFarms`,
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
        data: errorBody.message || "Failed to fetch all farms",
      };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getCurrentFarm = async () => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `https://a965c4z4db.execute-api.ap-south-1.amazonaws.com/beta/farm/getCurrentFarm`,
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
        data: errorBody.message || "Failed to fetch !!",
      };
    }

    const data = await response.json();
    console.log("data ->", data);
    return { success: true, data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

export const createFarmRecord = async (farmData) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(`${API_BASE_URL}/farm/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(farmData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.log("Create farm record error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to create new farm record",
      };
    }

    const data = await response.json();
    console.log("Create farm record data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

export const setCurrentfarm = async (selectedFarmId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    const response = await fetch(`${API_BASE_URL}/farm/set/${selectedFarmId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.log("set Farm record error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to set farm record",
      };
    }

    const data = await response.json();
    console.log("set farm record data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

export const updatePigId = async (selectedFarm, oldPigId, newPigId) => {
  try {
    const payload = { selectedFarm, oldPigId, newPigId };
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(`${API_BASE_URL}/updatePigId`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // parse JSON once
    const responseData = await response.json();
    console.log("Raw response data ->", responseData);

    if (!response.ok) {
      console.log("update pigId record error -> ", responseData);
      return {
        success: false,
        data: responseData.message || "Failed to update pigId record",
      };
    }

    console.log("update pigId record data -> ", responseData);
    return { success: true, data: responseData.data };
  } catch (err) {
    console.log("error ->", err);
    return { success: false, data: err.message };
  }
};

export const getAllUpdatedPigIds = async () => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `https://a965c4z4db.execute-api.ap-south-1.amazonaws.com/beta/getAllUpdatedPigIds`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    // console.log("response ->", response);

    if (!response.ok) {
      const errorBody = await response.json();
      return {
        success: false,
        data: errorBody.message || "Failed to fetch all updated pig Ids",
      };
    }

    const data = await response.json();
    console.log("updated PigIds ->", data);
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getAllPigsByStage = async (
  selectedFarm,
  stageName,
  lastEvaluatedKey = null,
  limit = 50
) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const currentStage = stageName;

    const queryParams = { limit };
    if (lastEvaluatedKey) {
      queryParams.lastEvaluatedKey = lastEvaluatedKey;
    }

    console.log("stageName ->", stageName);
    console.log(
      "******* ",
      `${API_BASE_URL}/current/${selectedFarm}/${currentStage}`
    );
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
      console.log("active error -> ", errorBody);
      return {
        success: false,
        data:
          errorBody.message || `Failed to fetch current ${stageName} records`,
      };
    }

    const data = await response.json();
    console.log("active data pig population -> ", data);
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

export const getAllActiveLivingMales = async (
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
      `${API_BASE_URL}/allActiveLivingMales/${selectedFarm}?${queryString}`,
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
      console.log("Active male error -> ", errorBody);
      return {
        success: false,
        data:
          errorBody.message || "Failed to fetch current living male records",
      };
    }

    const data = await response.json();
    console.log("Active living male data -> ", data);
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

export const getFeedingDataByMonth = async (
  selectedFarm,
  selectedMonth,
  selectedYear,
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
      `${API_BASE_URL}/feedingData/${selectedFarm}/${selectedYear}/${selectedMonth}?${queryString}`,
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
      console.log("Feeding data error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch feeding data",
      };
    }

    const data = await response.json();
    console.log("Feeding  data -> ", data);
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

export const updateFeedingData = async (payload) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(`${API_BASE_URL}/updateFeed`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // parse JSON once
    const responseData = await response.json();
    console.log("Raw response data ->", responseData);

    if (!response.ok) {
      console.log("update feed record error -> ", responseData);
      return {
        success: false,
        data: responseData.message || "Failed to update feed record",
      };
    }

    console.log("update feed record data -> ", responseData);
    return { success: true, data: responseData.data };
  } catch (err) {
    console.log("error ->", err);
    return { success: false, data: err.message };
  }
};
