// Selectors for accessing state data
export const selectBreedingRecords = (state) => state.pig.breedingRecords;
// export const selectCurrentBreedingRecords = (state) =>
//   state.pig.currentBreedingRecords;
export const selectCurrentBreedingRecords = (state) =>
  state.pig.breedingRecords.filter((record) => record.status === "active");
// export const selectBreedingHistory = (state) => state.pig.breedingHistory;
export const selectBreedingHistory = (state) =>
  state.pig.breedingRecords.filter((record) => record.status === "completed");

export const selectGestationRecords = (state) => state.pig.gestationRecords;
export const selectCurrentGestationRecords = (state) =>
  state.pig.currentGestationRecords.filter(
    (record) => record.status === "active"
  );
export const selectGestationHistory = (state) =>
  state.pig.gestationHistory.filter((record) => record.status === "completed");
export const selectFarrowingRecords = (state) => state.pig.farrowingRecords;
export const selectNurseryRecords = (state) => state.pig.nurseryRecords;

export const selectIsMovingPig = (state) => state.pig.isMovingPig;
export const selectMovingPigId = (state) => state.pig.movingPigId;
export const selectIsLoading = (state) => state.pig.isLoading;
export const selectError = (state) => state.pig.error;
export const selectBreedingPagination = (state) => state.pig.pagination;

export const selectCurrentFarrowingRecords = (state) =>
  state.pig.farrowingRecords.filter((record) => record.status === "active");
// export const selectBreedingHistory = (state) => state.pig.breedingHistory;
export const selectFarrowingHistory = (state) =>
  state.pig.farrowingRecords.filter((record) => record.status === "completed");

// Nursery
export const selectCurrentNurseryLitterRecords = (state) =>
  state.pig.nurseryLitterRecords.filter((record) => record.status === "active");
export const selectCurrentNurseryRecords = (state) =>
  state.pig.currentNurseryRecords.filter(
    (record) => record.status === "active"
  );

// farm
export const selectFarmRecords = (state) => state.pig.farmRecords;
export const currentFarmRecord = (state) => state.pig.selectedFarm;

// Computed selectors
export const selectBreedingStats = (state) => {
  const breedingRecords = selectBreedingRecords(state);
  return {
    total: breedingRecords.length,
    active: breedingRecords.filter((record) => record.status === "active")
      .length,
    completed: breedingRecords.filter((record) => record.status === "completed")
      .length,
  };
};

export const selectGestationStats = (state) => {
  const currentGestationRecords = selectCurrentGestationRecords(state);
  const gestationHistory = selectGestationHistory(state);
  return {
    total: currentGestationRecords.length + gestationHistory.length,
    active: currentGestationRecords.length,
    completed: gestationHistory.length,
  };
};
