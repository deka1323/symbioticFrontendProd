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

  // Stage Management Actions
  MOVE_TO_NEXT_STAGE_START: "MOVE_TO_NEXT_STAGE_START",
  MOVE_TO_NEXT_STAGE_SUCCESS: "MOVE_TO_NEXT_STAGE_SUCCESS",
  MOVE_TO_NEXT_STAGE_FAILURE: "MOVE_TO_NEXT_STAGE_FAILURE",

  // General Actions
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Action Creators
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

// Thunk Actions (Async Actions)
import * as breedingAPI from "../../actions/breedingActions";

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

// export const addBreedingRecord = (breedingData) => {
//   return async (dispatch) => {
//     dispatch(setLoading(true));

//     try {
//       const result = await breedingAPI.createBreedingRecord(breedingData);

//       if (result.success) {
//         dispatch(addBreedingRecord(result.data));
//         dispatch(setLoading(false));
//         return { success: true, data: result.data };
//       } else {
//         dispatch(setError(result.data));
//         dispatch(setLoading(false));
//         return { success: false, error: result.data };
//       }
//     } catch (error) {
//       dispatch(setError(error.message));
//       dispatch(setLoading(false));
//       return { success: false, error: error.message };
//     }
//   };
// };

export const updateBreedingRecord = (record) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const result = await breedingAPI.updateBreedingRecord(
        record.breedingId,
        record
      );

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

export const moveToGestation = (breedingId, targetStage = "gestation") => {
  return async (dispatch, getState) => {
    dispatch(moveToGestationStart(breedingId));

    try {
      const result = await breedingAPI.moveBreedingToGestation(breedingId);

      if (result.success) {
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
