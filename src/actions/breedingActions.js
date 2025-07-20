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

// Validate pig for breeding
export const validatePigForBreeding = async (sowId, boarId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const queryString = buildQueryString({ sowId, boarId });
    const response = await fetch(
      `${API_BASE_URL}/breeding/validate?${queryString}`,
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
      return {
        success: false,
        data: errorBody.message || "Failed to validate pigs for breeding",
        errors: errorBody.errors || [],
      };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message, errors: [err.message] };
  }
};

// Get all breeding records with pagination
export const getBreedingRecords = async (
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
      return {
        success: false,
        data: errorBody.message || "Failed to fetch breeding records",
      };
    }

    const data = await response.json();
    // console.log("data -> ", data);
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

// Get current active breeding records with pagination - API DONE
export const getCurrentBreedingRecords = async (
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
      `${API_BASE_URL}/breeding/current?${queryString}`,
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

// Get breeding history by month with pagination - API DONE
export const getBreedingHistoryByMonth = async (
  year,
  month,
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
      `${API_BASE_URL}/breeding/history/${year}/${month}?${queryString}`,
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
export const updateBreedingRecord = async (breedingId, updateData) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(
      `${API_BASE_URL}/breeding/update/${breedingId}`,
      {
        method: "PUT",
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
export const moveBreedingToGestation = async (breedingId) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(`${API_BASE_URL}/${breedingId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });

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
