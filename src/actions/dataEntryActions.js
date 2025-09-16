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

    console.log("breedingData ---->", breedingData);

    const response = await fetch(`${API_BASE_URL}/dataEntry/breeding`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(breedingData),
    });

    // parse JSON once
    const responseData = await response.json();
    console.log("Raw response data ->", responseData);

    if (!response.ok) {
      console.log("Create Breeding record error -> ", responseData);
      return {
        success: false,
        data: responseData.message || "Failed to create breeding record",
      };
    }

    console.log("Create Breeding record data -> ", responseData);
    return { success: true, data: responseData.data };
  } catch (err) {
    console.log("error ->", err);
    return { success: false, data: err.message };
  }
};

export const entryGestationRecord = async (gestationData) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    console.log("gestationData ---->", gestationData);

    const response = await fetch(`${API_BASE_URL}/dataEntry/gestation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gestationData),
    });

    // parse JSON once
    const responseData = await response.json();
    console.log("Raw response data ->", responseData);

    if (!response.ok) {
      console.log("Create gestation record error -> ", responseData);
      return {
        success: false,
        data: responseData.message || "Failed to gestation record",
      };
    }

    console.log("Create gestation record data -> ", responseData);
    return { success: true, data: responseData.data };
  } catch (err) {
    console.log("error ->", err);
    return { success: false, data: err.message };
  }
};

export const entryFarrowingRecord = async (farrowingData) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    console.log("farrowingData ---->", farrowingData);

    const response = await fetch(`${API_BASE_URL}/dataEntry/farrowing`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(farrowingData),
    });

    // parse JSON once
    const responseData = await response.json();
    console.log("Raw response data ->", responseData);

    if (!response.ok) {
      console.log("Create farrowing record error -> ", responseData);
      return {
        success: false,
        data: responseData.message || "Failed to farrowing record",
      };
    }

    console.log("Create farrowing record data -> ", responseData);
    return { success: true, data: responseData.data };
  } catch (err) {
    console.log("error ->", err);
    return { success: false, data: err.message };
  }
};

export const entryNurseryRecord = async (nurseryData) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    console.log("nurseryData ---->", nurseryData);

    const response = await fetch(`${API_BASE_URL}/dataEntry/nursery`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nurseryData),
    });

    // parse JSON once
    const responseData = await response.json();
    console.log("Raw response data ->", responseData);

    if (!response.ok) {
      console.log("Create nursery record error -> ", responseData);
      return {
        success: false,
        data: responseData.message || "Failed to nursery record",
      };
    }

    console.log("Create nursery record data -> ", responseData);
    return { success: true, data: responseData.data };
  } catch (err) {
    console.log("error ->", err);
    return { success: false, data: err.message };
  }
};
