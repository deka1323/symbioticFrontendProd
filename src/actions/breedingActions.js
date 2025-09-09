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

// Get all breeding records with pagination
export const getBreedingRecords =
  (lastEvaluatedKey = null, limit = 50) =>
  async (dispatch) => {
    try {
      dispatch({ type: PIG_ACTION_TYPES.FETCH_BREEDING_RECORDS_START });
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      const queryParams = { limit };
      if (lastEvaluatedKey) {
        queryParams.lastEvaluatedKey = lastEvaluatedKey;
      }

      const queryString = buildQueryString(queryParams);
      const response = await fetch(
        `${API_BASE_URL}/breeding/allRecords?${queryString}`,
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
        console.log("errorBody -> ", errorBody);
        dispatch({
          type: PIG_ACTION_TYPES.FETCH_BREEDING_RECORDS_FAILURE,
          payload: errorBody.message || "Failed to fetch breeding records", // error message
        });
        return {
          success: false,
          data: errorBody.message || "Failed to fetch breeding records",
        };
      }

      const data = await response.json();
      // console.log("data -> ", data);
      dispatch({
        type: PIG_ACTION_TYPES.FETCH_BREEDING_RECORDS_SUCCESS,
        payload: data.data,
      });
      return {
        success: true,
        data: data.data,
        lastEvaluatedKey: data.lastEvaluatedKey,
        hasMore: data.hasMore,
      };
    } catch (err) {
      dispatch({
        type: PIG_ACTION_TYPES.FETCH_BREEDING_RECORDS_FAILURE,
        payload: err.message, // error message
      });
      return { success: false, data: err.message };
    }
  };

// Get current active breeding records with pagination - API DONE
export const getCurrentBreedingRecords = async (
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
      `${API_BASE_URL}/breeding/current/${selectedFarm}?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("response --->", response);

    if (!response.ok) {
      const errorBody = await response.json();
      console.log("active error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to fetch current breeding records",
      };
    }

    const data = await response.json();
    console.log("active  BREEDING data -> ", data);
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

// Get breeding history by month with pagination - API DONE
export const getBreedingHistoryByMonth = async (
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
      `${API_BASE_URL}/breeding/history/${selectedFarm}/${year}/${month}?${queryString}`,
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
        data: errorBody.message || "Failed to fetch breeding history",
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

// Create new breeding record with validation - API DONE
export const createBreedingRecord = async (breedingData) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(`${API_BASE_URL}/breeding/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(breedingData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.log("Create Breeding record error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to create breeding record",
      };
    }

    const data = await response.json();
    console.log("Create Breeding record data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

// Update breeding record - API DONE
export const updateBreedingRecord = async (updateData) => {
  try {
    const breedingId = updateData.breedingId;
    const sowId = updateData.sowId;
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    console.log("updateData :", updateData);
    console.log("breedingId :", breedingId);
    console.log("sowId :", sowId);

    const response = await fetch(
      `${API_BASE_URL}/breeding/update/${breedingId}/${sowId}`,
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
      console.log("Update Breeding record error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to update breeding record",
      };
    }

    const data = await response.json();
    console.log("Update Breeding record data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

// Move breeding record to gestation - API DONE
export const moveBreedingToGestation = async (record) => {
  try {
    console.log("record from sednddddd ->", record);
    const breedingId = record.recordId;
    const updateData = {
      selectedFarm: record.selectedFarm,
    };
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `${API_BASE_URL}/breeding/moveToGestation/${breedingId}`,
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
      console.log("Move to gestation error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to move to gestation",
      };
    }

    const data = await response.json();
    console.log("Move to gestation data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

// Get breeding record by ID
export const getBreedingRecordById = async (breedingId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(`${API_BASE_URL}/breeding/${breedingId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      return {
        success: false,
        data: errorBody.message || "Failed to fetch breeding record",
      };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};

// Delete breeding record
export const deleteBreedingRecord = async (breedingId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `${API_BASE_URL}/breeding/delete/${breedingId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      return {
        success: false,
        data: errorBody.message || "Failed to delete breeding record",
      };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};
