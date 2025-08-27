// Action Types
export const PIG_ACTION_TYPES = {
  // Breeding Actions
  ADD_BREEDING_RECORD: "ADD_BREEDING_RECORD",
  FETCH_BREEDING_RECORDS_START: "FETCH_BREEDING_RECORDS_START",
  FETCH_BREEDING_RECORDS_SUCCESS: "FETCH_BREEDING_RECORDS_SUCCESS",
  FETCH_BREEDING_RECORDS_FAILURE: "FETCH_BREEDING_RECORDS_FAILURE",
  UPDATE_BREEDING_RECORD: "UPDATE_BREEDING_RECORD",
  MOVE_TO_GESTATION_START: "MOVE_TO_GESTATION_START",
  MOVE_TO_GESTATION_SUCCESS: "MOVE_TO_GESTATION_SUCCESS",
  MOVE_TO_GESTATION_FAILURE: "MOVE_TO_GESTATION_FAILURE",

  // Gestation Actions
  FETCH_GESTATION_RECORDS_START: "FETCH_GESTATION_RECORDS_START",
  FETCH_GESTATION_RECORDS_SUCCESS: "FETCH_GESTATION_RECORDS_SUCCESS",
  FETCH_GESTATION_RECORDS_FAILURE: "FETCH_GESTATION_RECORDS_FAILURE",
  MOVE_TO_FATTENING_START: "MOVE_TO_FATTENING_START",
  MOVE_TO_FATTENING_SUCCESS: "MOVE_TO_FATTENING_SUCCESS",
  MOVE_TO_FATTENING_FAILURE: "MOVE_TO_FATTENING_FAILURE",
  MOVE_TO_FARROWING_START: "MOVE_TO_FARROWING_START",
  MOVE_TO_FARROWING_SUCCESS: "MOVE_TO_FARROWING_SUCCESS",
  MOVE_TO_FARROWING_FAILURE: "MOVE_TO_FARROWING_FAILURE",

  // farrowing Actions
  FETCH_FARROWING_RECORDS_START: "FETCH_FARROWING_RECORDS_START",
  FETCH_FARROWING_RECORDS_SUCCESS: "FETCH_FARROWING_RECORDS_SUCCESS",
  FETCH_FARROWING_RECORDS_FAILURE: "FETCH_FARROWING_RECORDS_FAILURE",
  UPDATE_FARROWING_RECORD: "UPDATE_FARROWING_RECORD",
  MOVE_TO_NURSERY_START: "MOVE_TO_NURSERY_START",
  MOVE_TO_NURSERY_SUCCESS: "MOVE_TO_NURSERY_SUCCESS",
  MOVE_TO_NURSERY_FAILURE: "MOVE_TO_NURSERY_FAILURE",

  // // Stage Management Actions
  MOVE_TO_NEXT_STAGE_START: "MOVE_TO_NEXT_STAGE_START",
  MOVE_TO_NEXT_STAGE_SUCCESS: "MOVE_TO_NEXT_STAGE_SUCCESS",
  MOVE_TO_NEXT_STAGE_FAILURE: "MOVE_TO_NEXT_STAGE_FAILURE",

  // General Actions
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",

  // Nursery Actions
  FETCH_NURSERYLITTER_RECORDS_START: "FETCH_NURSERYLITTER_RECORDS_START",
  FETCH_NURSERYLITTER_RECORDS_SUCCESS: "FETCH_NURSERYLITTER_RECORDS_SUCCESS",
  FETCH_NURSERYLITTER_RECORDS_FAILURE: "FETCH_NURSERYLITTER_RECORDS_FAILURE",
  UPDATE_PIGLET_RECORD: "UPDATE_PIGLET_RECORD",
  UPDATE_BASIC_PIGLET_RECORD: "UPDATE_BASIC_PIGLET_RECORD",
  MOVE_NURSERY_TO_FATTENING_START: "MOVE_NURSERY_TO_FATTENING_START",
  MOVE_NURSERY_TO_FATTENING_SUCCESS: "MOVE_NURSERY_TO_FATTENING_SUCCESS",
  MOVE_NURSERY_TO_FATTENING_FAILURE: "MOVE_NURSERY_TO_FATTENING_FAILURE",
  MOVE_NURSERY_TO_FARROWING_START: "MOVE_NURSERY_TO_FARROWING_START",
  MOVE_NURSERY_TO_FARROWING_SUCCESS: "MOVE_NURSERY_TO_FARROWING_SUCCESS",
  MOVE_NURSERY_TO_FARROWING_FAILURE: "MOVE_NURSERY_TO_FARROWING_FAILURE",
  FETCH_NURSERY_RECORDS_START: "FETCH_NURSERY_RECORDS_START",
  FETCH_NURSERY_RECORDS_SUCCESS: "FETCH_NURSERY_RECORDS_SUCCESS",
  FETCH_NURSERY_RECORDS_FAILURE: "FETCH_NURSERY_RECORDS_FAILURE",

  // Dashboard Actions
  ADD_FARM_RECORD: "ADD_FARM_RECORD",
  FETCH_FARM_RECORDS_START: "FETCH_FARM_RECORDS_START",
  FETCH_FARM_RECORDS_SUCCESS: "FETCH_FARM_RECORDS_SUCCESS",
  FETCH_FARM_RECORDS_FAILURE: "FETCH_FARM_RECORDS_FAILURE",
  SET_FARM_RECORD: "SET_FARM_RECORD",
  FETCH_SELECTED_FARM_RECORDS_START: "FETCH_SELECTED_FARM_RECORDS_START",
  FETCH_SELECTED_FARM_RECORDS_SUCCESS: "FETCH_SELECTED_FARM_RECORDS_SUCCESS",
  FETCH_SELECTED_FARM_RECORDS_FAILURE: "FETCH_SELECTED_FARM_RECORDS_FAILURE",
};

// Action Creators
export const addFarmRecord = (farmRecord) => ({
  type: PIG_ACTION_TYPES.ADD_FARM_RECORD,
  payload: farmRecord,
});

export const fetchFarmRecordsStart = () => ({
  type: PIG_ACTION_TYPES.FETCH_FARM_RECORDS_START,
});

export const fetchFarmRecordsSuccess = (records) => ({
  type: PIG_ACTION_TYPES.FETCH_FARM_RECORDS_SUCCESS,
  payload: records,
});

export const fetchFarmRecordsFailure = (error) => ({
  type: PIG_ACTION_TYPES.FETCH_FARM_RECORDS_FAILURE,
  payload: error,
});

export const fetchSelectedFarmRecordStart = () => ({
  type: PIG_ACTION_TYPES.FETCH_SELECTED_FARM_RECORDS_START,
});

export const fetchSelectedFarmRecordSuccess = (records) => ({
  type: PIG_ACTION_TYPES.FETCH_SELECTED_FARM_RECORDS_SUCCESS,
  payload: records,
});

export const fetchSelectedFarmRecordFailure = (error) => ({
  type: PIG_ACTION_TYPES.FETCH_SELECTED_FARM_RECORDS_FAILURE,
  payload: error,
});

export const setFarmRecordAction = (record) => ({
  type: PIG_ACTION_TYPES.SET_FARM_RECORD,
  payload: record,
});

export const addBreedingRecord = (breedingRecord) => ({
  type: PIG_ACTION_TYPES.ADD_BREEDING_RECORD,
  payload: breedingRecord,
});

export const fetchBreedingRecordsStart = () => ({
  type: PIG_ACTION_TYPES.FETCH_BREEDING_RECORDS_START,
});

export const fetchBreedingRecordsSuccess = (records) => ({
  type: PIG_ACTION_TYPES.FETCH_BREEDING_RECORDS_SUCCESS,
  payload: records,
});

export const fetchBreedingRecordsFailure = (error) => ({
  type: PIG_ACTION_TYPES.FETCH_BREEDING_RECORDS_FAILURE,
  payload: error,
});

export const updateBreedingRecordAction = (record) => ({
  type: PIG_ACTION_TYPES.UPDATE_BREEDING_RECORD,
  payload: record,
});

export const moveToGestationStart = (breedingId) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_GESTATION_START,
  payload: { breedingId },
});

export const moveToGestationSuccess = (breedingId, gestationRecord) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_GESTATION_SUCCESS,
  payload: { breedingId, gestationRecord },
});

export const moveToGestationFailure = (error) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_GESTATION_FAILURE,
  payload: { error },
});

// Gestation Action Creators
export const fetchGestationRecordsStart = () => ({
  type: PIG_ACTION_TYPES.FETCH_GESTATION_RECORDS_START,
});

export const fetchGestationRecordsSuccess = (records) => ({
  type: PIG_ACTION_TYPES.FETCH_GESTATION_RECORDS_SUCCESS,
  payload: records,
});

export const fetchGestationRecordsFailure = (error) => ({
  type: PIG_ACTION_TYPES.FETCH_GESTATION_RECORDS_FAILURE,
  payload: error,
});

export const moveToFarrowingStart = (gestationId) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_FARROWING_START,
  payload: { gestationId },
});

export const moveToFarrowingSuccess = (gestationId, farrowingRecord) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_FARROWING_SUCCESS,
  payload: { gestationId, farrowingRecord },
});

export const moveToFarrowingFailure = (error) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_FARROWING_FAILURE,
  payload: { error },
});

export const moveToFatteningStart = (gestationId) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_FATTENING_START,
  payload: { gestationId },
});

export const moveToFatteningSuccess = (gestationId, fatteningRecord) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_FATTENING_SUCCESS,
  payload: { gestationId, fatteningRecord },
});

export const moveToFatteningFailure = (error) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_FATTENING_FAILURE,
  payload: { error },
});

export const moveToNextStageStart = (pigId, currentStage) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_START,
  payload: { pigId, currentStage },
});

export const moveToNextStageSuccess = (pigId, fromStage, toStage) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_SUCCESS,
  payload: { pigId, fromStage, toStage },
});

export const moveToNextStageFailure = (error) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_FAILURE,
  payload: { error },
});

// Farrowing
export const fetchFarrowingRecordsStart = () => ({
  type: PIG_ACTION_TYPES.FETCH_FARROWING_RECORDS_START,
});

export const fetchFarrowingRecordsSuccess = (records) => ({
  type: PIG_ACTION_TYPES.FETCH_FARROWING_RECORDS_SUCCESS,
  payload: records,
});

export const fetchFarrowingRecordsFailure = (error) => ({
  type: PIG_ACTION_TYPES.FETCH_GESTATION_RECORDS_FAILURE,
  payload: error,
});

export const moveToNurseryStart = (farrowingId) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_NURSERY_START,
  payload: { farrowingId },
});

export const moveToNurserySuccess = (farrowingId, nurseryRecord) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_NURSERY_SUCCESS,
  payload: { farrowingId, nurseryRecord },
});

export const moveToNurseryFailure = (error) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_NURSERY_FAILURE,
  payload: { error },
});

export const updateFarrowingRecordAction = (record) => ({
  type: PIG_ACTION_TYPES.UPDATE_FARROWING_RECORD,
  payload: record,
});

export const moveNurseryToFatteningStart = (nurseryId) => ({
  type: PIG_ACTION_TYPES.MOVE_NURSERY_TO_FATTENING_START,
  payload: { nurseryId },
});

export const moveNurseryToFatteningSuccess = (nurseryId, fatteningRecord) => ({
  type: PIG_ACTION_TYPES.MOVE_NURSERY_TO_FATTENING_SUCCESS,
  payload: { nurseryId, fatteningRecord },
});

export const moveNurseryToFatteningFailure = (error) => ({
  type: PIG_ACTION_TYPES.MOVE_NURSERY_TO_FATTENING_FAILURE,
  payload: { error },
});

export const fetchNurseryRecordsStart = () => ({
  type: PIG_ACTION_TYPES.FETCH_NURSERY_RECORDS_START,
});

export const fetchNurseryRecordsSuccess = (records) => ({
  type: PIG_ACTION_TYPES.FETCH_NURSERY_RECORDS_SUCCESS,
  payload: records,
});

export const fetchNurseryRecordsFailure = (error) => ({
  type: PIG_ACTION_TYPES.FETCH_NURSERY_RECORDS_FAILURE,
  payload: error,
});

export const setLoading = (isLoading) => ({
  type: PIG_ACTION_TYPES.SET_LOADING,
  payload: isLoading,
});

export const setError = (error) => ({
  type: PIG_ACTION_TYPES.SET_ERROR,
  payload: error,
});

export const clearError = () => ({
  type: PIG_ACTION_TYPES.CLEAR_ERROR,
});

// Nursery
export const fetchNurseryLitterRecordsStart = () => ({
  type: PIG_ACTION_TYPES.FETCH_NURSERYLITTER_RECORDS_START,
});

export const fetchNurseryLitterRecordsSuccess = (records) => ({
  type: PIG_ACTION_TYPES.FETCH_NURSERYLITTER_RECORDS_SUCCESS,
  payload: records,
});

export const fetchNurseryLitterRecordsFailure = (error) => ({
  type: PIG_ACTION_TYPES.FETCH_NURSERYLITTER_RECORDS_FAILURE,
  payload: error,
});

export const updateBasicPigletRecordAction = (record) => ({
  type: PIG_ACTION_TYPES.UPDATE_BASIC_PIGLET_RECORD,
  payload: record,
});

export const updatePigletRecordAction = (record) => ({
  type: PIG_ACTION_TYPES.UPDATE_PIGLET_RECORD,
  payload: record,
});

// Thunk Actions (Async Actions)
import * as breedingAPI from "../../actions/breedingActions";
import * as gestationAPI from "../../actions/gestationActions";
import * as farrowingAPI from "../../actions/farrowingActions";
import * as nurseryAPI from "../../actions/nurseryActions";
import * as farmAPI from "../../actions/dashboardActions";

export const fetchBreedingRecords = () => {
  return async (dispatch) => {
    dispatch(fetchBreedingRecordsStart());

    try {
      const result = await breedingAPI.getBreedingRecords();

      if (result.success) {
        dispatch(fetchBreedingRecordsSuccess(result.data));
        return { success: true, data: result.data };
      } else {
        dispatch(fetchBreedingRecordsFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(fetchBreedingRecordsFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const updateBreedingRecord = (record) => {
  console.log("record ->>>", record);
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const result = await breedingAPI.updateBreedingRecord(record);
      console.log("result from pigActions.js :", result);
      if (result.success) {
        dispatch(updateBreedingRecordAction(result.data));
        dispatch(setLoading(false));
        return { success: true, data: result.data };
      } else {
        dispatch(setError(result.data));
        dispatch(setLoading(false));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      return { success: false, error: error.message };
    }
  };
};

export const moveToGestation = (record) => {
  return async (dispatch, getState) => {
    const breedingId = record.recordId;
    dispatch(moveToGestationStart(breedingId));

    try {
      const result = await breedingAPI.moveBreedingToGestation(record);
      console.log("moveBreedingToGestation :", result);

      if (result.success) {
        console.log("Hi", breedingId, result.data.gestationRecord);
        dispatch(
          moveToGestationSuccess(breedingId, result.data.gestationRecord)
        );
        return { success: true, targetStage: result.data.targetStage };
      } else {
        dispatch(moveToGestationFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(moveToGestationFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const moveToNextStage = (
  pigId,
  currentStage,
  isPregnancyFailed = false
) => {
  return async (dispatch) => {
    const nextStageMap = {
      gestation: isPregnancyFailed ? "fattening" : "farrowing",
      farrowing: "nursery",
      nursery: "fattening",
    };

    const nextStage = nextStageMap[currentStage];
    if (!nextStage) {
      dispatch(moveToNextStageFailure("Invalid stage transition"));
      return { success: false };
    }

    dispatch(moveToNextStageStart(pigId, currentStage));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      dispatch(moveToNextStageSuccess(pigId, currentStage, nextStage));
      return { success: true, nextStage };
    } catch (error) {
      dispatch(moveToNextStageFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

// import * as breedingAPI from '../../actions/breedingActions'; // make sure path is correct

export const fetchCurrentBreedingRecords = (selectedFarm) => {
  return async (dispatch) => {
    dispatch(fetchBreedingRecordsStart());

    try {
      const result = await breedingAPI.getCurrentBreedingRecords(selectedFarm);

      if (result.success) {
        dispatch(fetchBreedingRecordsSuccess(result.data));
        return { success: true, data: result.data };
      } else {
        dispatch(fetchBreedingRecordsFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(fetchBreedingRecordsFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const fetchBreedingHistoryByMonth = (year, month, selectedFarm) => {
  return async (dispatch) => {
    dispatch(fetchBreedingRecordsStart());

    try {
      const result = await breedingAPI.getBreedingHistoryByMonth(
        year,
        month,
        selectedFarm
      );

      if (result.success) {
        dispatch(fetchBreedingRecordsSuccess(result.data));
        return { success: true, data: result.data };
      } else {
        dispatch(fetchBreedingRecordsFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(fetchBreedingRecordsFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const createBreedingRecord = (breedingData) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const result = await breedingAPI.createBreedingRecord(breedingData);

      if (result.success) {
        console.log("creating returned result.data -", result.data);
        dispatch(addBreedingRecord(result.data));
        dispatch(setLoading(false));
        return { success: true, data: result.data };
      } else {
        dispatch(setError(result.data));
        dispatch(setLoading(false));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      return { success: false, error: error.message };
    }
  };
};

// Gestation Thunk Actions
export const fetchCurrentGestationRecords = (selectedFarm) => {
  return async (dispatch) => {
    dispatch(fetchGestationRecordsStart());

    try {
      const result = await gestationAPI.getAllActiveGestationRecords(
        selectedFarm
      );
      console.log("hey ->", result);

      if (result.success) {
        dispatch(fetchGestationRecordsSuccess(result.data));
        return { success: true, data: result.data };
      } else {
        dispatch(fetchGestationRecordsFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(fetchGestationRecordsFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const fetchGestationHistoryByMonth = (year, month, selectedFarm) => {
  return async (dispatch) => {
    dispatch(fetchGestationRecordsStart());

    try {
      const result = await gestationAPI.getGestationHistoryByMonth(
        year,
        month,
        selectedFarm
      );

      if (result.success) {
        dispatch(fetchGestationRecordsSuccess(result.data));
        return { success: true, data: result.data };
      } else {
        dispatch(fetchGestationRecordsFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(fetchGestationRecordsFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const moveGestationToFarrowing = (record) => {
  return async (dispatch, getState) => {
    const gestationId = record.recordId;
    dispatch(moveToFarrowingStart(gestationId));

    try {
      const result = await gestationAPI.sendToFarrowing(record);
      console.log("moveGestationToFarrowing :", result);

      if (result.success) {
        console.log(
          "Moving to farrowing",
          gestationId,
          result.data.farrowingRecord
        );
        dispatch(
          moveToFarrowingSuccess(gestationId, result.data.farrowingRecord)
        );
        return { success: true, targetStage: result.data.targetStage };
      } else {
        dispatch(moveToFarrowingFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(moveToFarrowingFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const moveGestationToFattening = (record) => {
  return async (dispatch, getState) => {
    const gestationId = record.recordId;
    dispatch(moveToFatteningStart(gestationId));

    try {
      const result = await gestationAPI.sendToFattening(record);
      console.log("moveGestationToFattening :", result);

      if (result.success) {
        console.log(
          "Moving to fattening (pregnancy failed)",
          gestationId,
          result.data.fatteningRecord
        );
        dispatch(
          moveToFatteningSuccess(gestationId, result.data.fatteningRecord)
        );
        return {
          success: true,
          targetStage: result.data.targetStage,
          pregnancyFailed: true,
        };
      } else {
        dispatch(moveToFatteningFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(moveToFatteningFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

// Farrowing Thunk Actions
export const fetchCurrentFarrowingRecords = (selectedFarm) => {
  return async (dispatch) => {
    dispatch(fetchFarrowingRecordsStart());

    try {
      const result = await farrowingAPI.getAllActiveFarrowingRecords(
        selectedFarm
      );
      console.log("hey ->", result);

      if (result.success) {
        dispatch(fetchFarrowingRecordsSuccess(result.data));
        return { success: true, data: result.data };
      } else {
        dispatch(fetchFarrowingRecordsFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(fetchFarrowingRecordsFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const fetchFarrowingHistoryByMonth = (year, month, selectedFarm) => {
  return async (dispatch) => {
    dispatch(fetchFarrowingRecordsStart());

    try {
      const result = await farrowingAPI.getFarrowingHistoryByMonth(
        year,
        month,
        selectedFarm
      );

      if (result.success) {
        dispatch(fetchFarrowingRecordsSuccess(result.data));
        return { success: true, data: result.data };
      } else {
        dispatch(fetchFarrowingRecordsFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(fetchFarrowingRecordsFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const moveFarrowingToNursery = (record) => {
  return async (dispatch, getState) => {
    const farrowingId = record.recordId;
    dispatch(moveToNurseryStart(farrowingId));

    try {
      const result = await farrowingAPI.sendToNursery(record);
      console.log("moveFarrowingToNursery :", result);

      if (result.success) {
        console.log(
          "Moving to nursery",
          farrowingId,
          // result.data.nurseryRecord
          result.data.litterRecord
        );
        dispatch(moveToNurserySuccess(farrowingId, result.data.litterRecord));
        return { success: true, targetStage: result.data.targetStage };
      } else {
        dispatch(moveToNurseryFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(moveToNurseryFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const updateFarrowingRecord = (record) => {
  console.log("record ->>>", record);
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const result = await farrowingAPI.updateFarrowingRecord(record);
      console.log("result from pigActions.js :", result);
      if (result.success) {
        dispatch(updateFarrowingRecordAction(result.data));
        dispatch(setLoading(false));
        return { success: true, data: result.data };
      } else {
        dispatch(setError(result.data));
        dispatch(setLoading(false));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      return { success: false, error: error.message };
    }
  };
};

// Nursery Thunk Actions
export const fetchCurrentNurseryLitterRecords = (selectedFarm) => {
  return async (dispatch) => {
    dispatch(fetchNurseryLitterRecordsStart());

    try {
      const result = await nurseryAPI.getCurrentNurseryLitterRecords(
        selectedFarm
      );
      console.log("hey ->", result);

      if (result.success) {
        dispatch(fetchNurseryLitterRecordsSuccess(result.data));
        return { success: true, data: result.data };
      } else {
        dispatch(fetchNurseryLitterRecordsFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(fetchNurseryLitterRecordsFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const updatePigletBasicRecord = (record) => {
  console.log("record ->>>", record);
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const result = await nurseryAPI.updateNurseryPigletBasicRecord(record);
      console.log("result from pigActions.js :", result);
      if (result.success) {
        dispatch(updateBasicPigletRecordAction(result.data));
        dispatch(setLoading(false));
        return { success: true, data: result.data.litterRecord };
      } else {
        dispatch(setError(result.data));
        dispatch(setLoading(false));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      return { success: false, error: error.message };
    }
  };
};

export const updatePigletRecord = (record) => {
  console.log("record ->>>", record);
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const result = await nurseryAPI.updateNurseryPigletRecord(record);
      console.log("result from pigActions.js :", result);
      if (result.success) {
        dispatch(updatePigletRecordAction(result.data));
        dispatch(setLoading(false));
        return { success: true, data: result.data.litterRecord };
      } else {
        dispatch(setError(result.data));
        dispatch(setLoading(false));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      return { success: false, error: error.message };
    }
  };
};

export const moveNurseryToFattening = (record) => {
  return async (dispatch, getState) => {
    const nurseryId = record.recordId;
    dispatch(moveNurseryToFatteningStart(nurseryId));

    try {
      const result = await nurseryAPI.sendToFattening(record);
      console.log("moveNurseryToFattening :", result);

      if (result.success) {
        console.log(
          "Moving to fattening",
          nurseryId,
          result.data.fatteningRecord
        );
        dispatch(
          moveNurseryToFatteningSuccess(nurseryId, result.data.fatteningRecord)
        );
        return {
          success: true,
          targetStage: result.data.targetStage,
          pregnancyFailed: true,
        };
      } else {
        dispatch(moveNurseryToFatteningFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(moveNurseryToFatteningFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const fetchCurrentNurseryRecords = (selectedFarm) => {
  return async (dispatch) => {
    dispatch(fetchNurseryRecordsStart());

    try {
      const result = await nurseryAPI.getAllActiveNurseryRecords(selectedFarm);
      console.log("hey ->", result);

      if (result.success) {
        dispatch(fetchNurseryRecordsSuccess(result.data));
        return { success: true, data: result.data };
      } else {
        dispatch(fetchNurseryRecordsFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(fetchGestationRecordsFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

// Farm Thunk Actions
export const fetchAllFarms = () => {
  return async (dispatch) => {
    dispatch(fetchFarmRecordsStart());

    try {
      const result = await farmAPI.getAllFarms();

      if (result.success) {
        dispatch(fetchFarmRecordsSuccess(result.data));
        return { success: true, data: result.data };
      } else {
        dispatch(fetchFarmRecordsFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(fetchFarmRecordsFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const fetchCurrentFarm = () => {
  return async (dispatch) => {
    dispatch(fetchSelectedFarmRecordStart());

    try {
      const result = await farmAPI.getCurrentFarm();

      if (result.success) {
        dispatch(
          fetchSelectedFarmRecordSuccess(result.data.data.currentFarmId)
        );
        return { success: true, data: result.data.data.currentFarmId };
      } else {
        dispatch(fetchSelectedFarmRecordFailure(result.data));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(fetchSelectedFarmRecordFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const createFarmRecord = (farmData) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const result = await farmAPI.createFarmRecord(farmData);
      console.log("hey", result);

      if (result.success) {
        console.log("creating returned result.data -", result.data);
        dispatch(addFarmRecord(result.data));
        dispatch(setLoading(false));
        return { success: true, data: result.data };
      } else {
        dispatch(setError(result.data));
        dispatch(setLoading(false));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      return { success: false, error: error.message };
    }
  };
};

export const setCurrentFarm = (farmId) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const result = await farmAPI.setCurrentfarm(farmId);
      console.log("result from pigActions.js :", result);
      if (result.success) {
        dispatch(setFarmRecordAction(result.data));
        dispatch(setLoading(false));
        return { success: true, data: result.data };
      } else {
        dispatch(setError(result.data));
        dispatch(setLoading(false));
        return { success: false, error: result.data };
      }
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      return { success: false, error: error.message };
    }
  };
};
