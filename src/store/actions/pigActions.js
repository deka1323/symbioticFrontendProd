// Action Types
export const PIG_ACTION_TYPES = {
  // Breeding Actions
  ADD_BREEDING_RECORD: 'ADD_BREEDING_RECORD',
  MOVE_TO_GESTATION_START: 'MOVE_TO_GESTATION_START',
  MOVE_TO_GESTATION_SUCCESS: 'MOVE_TO_GESTATION_SUCCESS',
  MOVE_TO_GESTATION_FAILURE: 'MOVE_TO_GESTATION_FAILURE',
  
  // Stage Management Actions
  MOVE_TO_NEXT_STAGE_START: 'MOVE_TO_NEXT_STAGE_START',
  MOVE_TO_NEXT_STAGE_SUCCESS: 'MOVE_TO_NEXT_STAGE_SUCCESS',
  MOVE_TO_NEXT_STAGE_FAILURE: 'MOVE_TO_NEXT_STAGE_FAILURE',
  
  // General Actions
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Action Creators
export const addBreedingRecord = (breedingRecord) => ({
  type: PIG_ACTION_TYPES.ADD_BREEDING_RECORD,
  payload: breedingRecord
});

export const moveToGestationStart = (breedingId) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_GESTATION_START,
  payload: { breedingId }
});

export const moveToGestationSuccess = (breedingId, gestationRecord) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_GESTATION_SUCCESS,
  payload: { breedingId, gestationRecord }
});

export const moveToGestationFailure = (error) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_GESTATION_FAILURE,
  payload: { error }
});

export const moveToNextStageStart = (pigId, currentStage) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_START,
  payload: { pigId, currentStage }
});

export const moveToNextStageSuccess = (pigId, fromStage, toStage) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_SUCCESS,
  payload: { pigId, fromStage, toStage }
});

export const moveToNextStageFailure = (error) => ({
  type: PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_FAILURE,
  payload: { error }
});

export const setLoading = (isLoading) => ({
  type: PIG_ACTION_TYPES.SET_LOADING,
  payload: isLoading
});

export const setError = (error) => ({
  type: PIG_ACTION_TYPES.SET_ERROR,
  payload: error
});

export const clearError = () => ({
  type: PIG_ACTION_TYPES.CLEAR_ERROR
});

// Thunk Actions (Async Actions)
export const moveToGestation = (breedingId, targetStage = 'gestation') => {
  return async (dispatch, getState) => {
    dispatch(moveToGestationStart(breedingId));
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { pig } = getState();
      const today = new Date().toISOString().split('T')[0];
      
      // Find the breeding record
      const breedingRecord = pig.breedingRecords.find(record => record.id === breedingId);
      
      if (breedingRecord) {
        // Create new gestation record
        const newGestationRecord = {
          id: `GS${Date.now()}`,
          pigId: breedingRecord.sowId,
          entryDate: today,
          expectedExitDate: new Date(Date.now() + 114 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          daysInStage: 0,
          breed: breedingRecord.sowBreed,
          weight: 45.5, // Default weight
          status: 'active',
          notes: `Moved from breeding (${breedingRecord.id})`
        };
        
        dispatch(moveToGestationSuccess(breedingId, newGestationRecord));
        return { success: true, targetStage };
      } else {
        throw new Error('Breeding record not found');
      }
    } catch (error) {
      dispatch(moveToGestationFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};

export const moveToNextStage = (pigId, currentStage) => {
  return async (dispatch) => {
    const nextStageMap = {
      gestation: 'farrowing',
      farrowing: 'nursery',
      nursery: 'fattening'
    };
    
    const nextStage = nextStageMap[currentStage];
    if (!nextStage) {
      dispatch(moveToNextStageFailure('Invalid stage transition'));
      return { success: false };
    }
    
    dispatch(moveToNextStageStart(pigId, currentStage));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      dispatch(moveToNextStageSuccess(pigId, currentStage, nextStage));
      return { success: true, nextStage };
    } catch (error) {
      dispatch(moveToNextStageFailure(error.message));
      return { success: false, error: error.message };
    }
  };
};