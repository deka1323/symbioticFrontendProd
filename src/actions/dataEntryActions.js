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

export const entryBreedingRecord = async (breedingData) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(`${API_BASE_URL}/dataEntry/breeding`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(breedingData),
    });

    console.log("response :", response.json());
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

export const entryGestationRecord = async (gestationData) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    const response = await fetch(`${API_BASE_URL}/dataEntry/gestation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gestationData),
    });

    console.log("response :", response.json());
    if (!response.ok) {
      const errorBody = await response.json();
      console.log("Create Gestation record error -> ", errorBody);
      return {
        success: false,
        data: errorBody.message || "Failed to create Gestation record",
      };
    }

    const data = await response.json();
    console.log("Create Gestation record data -> ", data);
    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, data: err.message };
  }
};
