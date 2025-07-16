// Selectors for accessing state data
export const selectBreedingRecords = (state) => state.pig.breedingRecords;
export const selectGestationRecords = (state) => state.pig.gestationRecords;
export const selectFarrowingRecords = (state) => state.pig.farrowingRecords;
export const selectNurseryRecords = (state) => state.pig.nurseryRecords;

export const selectCurrentBreedingRecords = (state) => 
  state.pig.breedingRecords.filter(record => record.status === 'active');

export const selectBreedingHistory = (state) => 
  state.pig.breedingRecords.filter(record => record.status === 'completed');

export const selectIsMovingPig = (state) => state.pig.isMovingPig;
export const selectMovingPigId = (state) => state.pig.movingPigId;
export const selectIsLoading = (state) => state.pig.isLoading;
export const selectError = (state) => state.pig.error;

// Computed selectors
export const selectBreedingStats = (state) => {
  const breedingRecords = selectBreedingRecords(state);
  return {
    total: breedingRecords.length,
    active: breedingRecords.filter(record => record.status === 'active').length,
    completed: breedingRecords.filter(record => record.status === 'completed').length
  };
};

export const selectGestationStats = (state) => {
  const gestationRecords = selectGestationRecords(state);
  return {
    total: gestationRecords.length,
    active: gestationRecords.filter(record => record.status === 'active').length
  };
};