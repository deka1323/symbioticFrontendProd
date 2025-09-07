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

export const getPigPopulationReports = async (
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
      `${API_BASE_URL}/report/pigPopulation/${selectedFarm}?${queryString}`,
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
        data: errorBody.message || "Failed to fetch current breeding records",
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

export const getStageDistributionReports = async (
  selectedFarm,
  stageName,
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
      `${API_BASE_URL}/report/stageDistribution/${selectedFarm}/${stageName}/?${queryString}`,
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
        data: errorBody.message || "Failed to fetch current breeding records",
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

export const getPigMedicineReports = async (
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
      `${API_BASE_URL}/report/upcomingMedicine/${selectedFarm}/${selectedYear}/${selectedMonth}?${queryString}`,
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
        data: errorBody.message || "Failed to fetch upcoming medicine records",
      };
    }

    const data = await response.json();
    console.log("upcoming medicine data -> ", data);
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

export const getExpectedDeliveryReports = async (
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
      `${API_BASE_URL}/report/expectedDelivery/${selectedFarm}/${selectedYear}/${selectedMonth}?${queryString}`,
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
        data: errorBody.message || "Failed to fetch upcoming delivery records",
      };
    }

    const data = await response.json();
    console.log("upcoming delivery data -> ", data);
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
