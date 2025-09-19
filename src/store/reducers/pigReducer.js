import { PIG_ACTION_TYPES } from "../actions/pigActions";

const initialState = {
  // breedingRecords: mockBreedingRecords,
  farmRecords: [],
  selectedFarm: null,
  breedingRecords: [],
  gestationRecords: [],
  currentGestationRecords: [],
  gestationHistory: [],
  farrowingRecords: [],
  fatteningRecords: [],
  driedRecords: [],
  nurseryLitterRecords: [],
  currentNurseryRecords: [],
  nurseryHistory: [],
  inHouseRecords: [],
  isLoading: false,
  isMovingPig: false,
  movingPigId: null,
  error: null,
};

const pigReducer = (state = initialState, action) => {
  switch (action.type) {
    case PIG_ACTION_TYPES.FETCH_FARM_RECORDS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_FARM_RECORDS_SUCCESS:
      return {
        ...state,
        farmRecords: action.payload,
        isLoading: false,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_FARM_RECORDS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case PIG_ACTION_TYPES.FETCH_SELECTED_FARM_RECORDS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_SELECTED_FARM_RECORDS_SUCCESS:
      return {
        ...state,
        selectedFarm: action.payload,
        isLoading: false,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_SELECTED_FARM_RECORDS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case PIG_ACTION_TYPES.ADD_FARM_RECORD: {
      return {
        ...state,
        farmRecords: [...state.farmRecords, action.payload],
        selectedFarm: action.payload.farmId,
      };
    }

    case PIG_ACTION_TYPES.SET_FARM_RECORD: {
      return {
        ...state,
        selectedFarm: action.payload.currentFarmId,
      };
    }

    case PIG_ACTION_TYPES.FETCH_BREEDING_RECORDS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_BREEDING_RECORDS_SUCCESS:
      return {
        ...state,
        breedingRecords: action.payload,
        isLoading: false,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_BREEDING_RECORDS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case PIG_ACTION_TYPES.FETCH_GESTATION_RECORDS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_GESTATION_RECORDS_SUCCESS:
      return {
        ...state,
        currentGestationRecords: action.payload,
        gestationHistory: action.payload,
        isLoading: false,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_GESTATION_RECORDS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case PIG_ACTION_TYPES.UPDATE_BREEDING_RECORD:
      return {
        ...state,
        breedingRecords: state.breedingRecords.map((record) =>
          record.breedingId === action.payload.breedingId
            ? { ...record, ...action.payload }
            : record
        ),
      };

    case PIG_ACTION_TYPES.ADD_BREEDING_RECORD: {
      const today = new Date().toISOString().split("T")[0];
      const newRecord = {
        ...action.payload,
        id: `BR${Date.now()}`,
        // matingDate: today,
        inDate: today,
        outDate: null,
        status: "active",
      };

      return {
        ...state,
        breedingRecords: [...state.breedingRecords, newRecord],
      };
    }

    case PIG_ACTION_TYPES.MOVE_TO_GESTATION_START:
      return {
        ...state,
        isMovingPig: true,
        movingPigId: action.payload.breedingId,
        error: null,
      };

    case PIG_ACTION_TYPES.MOVE_TO_GESTATION_SUCCESS: {
      const { breedingId, gestationRecord } = action.payload;
      const today = new Date().toISOString().split("T")[0];

      // Update breeding record with out date and status
      const updatedBreedingRecords = state.breedingRecords.map((record) =>
        record.recordId === breedingId
          ? { ...record, outDate: today, status: "completed" }
          : record
      );

      return {
        ...state,
        breedingRecords: updatedBreedingRecords,
        gestationRecords: [...state.gestationRecords, gestationRecord],
        isMovingPig: false,
        movingPigId: null,
        error: null,
      };
    }

    case PIG_ACTION_TYPES.MOVE_TO_GESTATION_FAILURE:
      return {
        ...state,
        isMovingPig: false,
        movingPigId: null,
        error: action.payload.error,
      };

    case PIG_ACTION_TYPES.MOVE_TO_FARROWING_START:
      return {
        ...state,
        isMovingPig: true,
        movingPigId: action.payload.gestationId,
        error: null,
      };

    case PIG_ACTION_TYPES.MOVE_TO_FARROWING_SUCCESS: {
      const { gestationId, farrowingRecord } = action.payload;
      const today = new Date().toISOString().split("T")[0];

      // Update gestation record with out date and status
      const updatedGestationRecords = state.currentGestationRecords.map(
        (record) =>
          record.recordId === gestationId
            ? { ...record, outDate: today, status: "completed" }
            : record
      );

      return {
        ...state,
        currentGestationRecords: updatedGestationRecords,
        farrowingRecords: [...state.farrowingRecords, farrowingRecord],
        isMovingPig: false,
        movingPigId: null,
        error: null,
      };
    }

    case PIG_ACTION_TYPES.MOVE_TO_FARROWING_FAILURE:
      return {
        ...state,
        isMovingPig: false,
        movingPigId: null,
        error: action.payload.error,
      };

    case PIG_ACTION_TYPES.MOVE_TO_FATTENING_START:
      return {
        ...state,
        isMovingPig: true,
        movingPigId: action.payload.gestationId,
        error: null,
      };

    case PIG_ACTION_TYPES.MOVE_TO_FATTENING_SUCCESS: {
      const { gestationId, fatteningRecord } = action.payload;
      const today = new Date().toISOString().split("T")[0];

      // Update gestation record with out date and status
      const updatedGestationRecords = state.currentGestationRecords.map(
        (record) =>
          record.recordId === gestationId
            ? {
                ...record,
                outDate: today,
                status: "completed",
                pregnancyFailed: true,
              }
            : record
      );

      console.log("updatedGestationRecords -->", updatedGestationRecords);

      return {
        ...state,
        currentGestationRecords: updatedGestationRecords,
        isMovingPig: false,
        movingPigId: null,
        error: null,
      };
    }

    case PIG_ACTION_TYPES.MOVE_TO_FATTENING_FAILURE:
      return {
        ...state,
        isMovingPig: false,
        movingPigId: null,
        error: action.payload.error,
      };

    // farrowing page
    case PIG_ACTION_TYPES.UPDATE_FARROWING_RECORD:
      return {
        ...state,
        farrowingRecords: state.farrowingRecords.map((record) =>
          record.recordId === action.payload.recordId
            ? { ...record, ...action.payload }
            : record
        ),
      };

    case PIG_ACTION_TYPES.FETCH_FARROWING_RECORDS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_FARROWING_RECORDS_SUCCESS:
      return {
        ...state,
        farrowingRecords: action.payload,
        isLoading: false,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_FARROWING_RECORDS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case PIG_ACTION_TYPES.MOVE_TO_NURSERY_START:
      return {
        ...state,
        isMovingPig: true,
        movingPigId: action.payload.farrowingId,
        error: null,
      };

    case PIG_ACTION_TYPES.MOVE_TO_NURSERY_SUCCESS: {
      const { farrowingId, litterRecord } = action.payload;
      const today = new Date().toISOString().split("T")[0];

      // Update farrowing record with out date and status
      const updatedFarrowingRecords = state.farrowingRecords.map((record) =>
        record.recordId === farrowingId
          ? { ...record, outDate: today, status: "completed" }
          : record
      );

      return {
        ...state,
        farrowingRecords: updatedFarrowingRecords,
        nurseryLitterRecords: [...state.nurseryLitterRecords, litterRecord],
        isMovingPig: false,
        movingPigId: null,
        error: null,
      };
    }

    case PIG_ACTION_TYPES.MOVE_TO_NURSERY_FAILURE:
      return {
        ...state,
        isMovingPig: false,
        movingPigId: null,
        error: action.payload.error,
      };

      // case PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_START:
      //   return {
      //     ...state,
      //     isMovingPig: true,
      //     movingPigId: action.payload.pigId,
      //     error: null,
      //   };

      // case PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_SUCCESS: {
      //   const { pigId, fromStage, toStage } = action.payload;

      //   // This would handle moving records between different stage arrays
      //   // For now, we'll just update the loading state
      //   return {
      //     ...state,
      //     isMovingPig: false,
      //     movingPigId: null,
      //     error: null,
      //   };
      // }

      // case PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_FAILURE:
      return {
        ...state,
        isMovingPig: false,
        movingPigId: null,
        error: action.payload.error,
      };

    // Nursery
    case PIG_ACTION_TYPES.FETCH_NURSERYLITTER_RECORDS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_NURSERYLITTER_RECORDS_SUCCESS:
      return {
        ...state,
        nurseryLitterRecords: action.payload,
        isLoading: false,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_NURSERYLITTER_RECORDS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // case PIG_ACTION_TYPES.UPDATE_BASIC_PIGLET_RECORD:
    //   return {
    //     ...state,
    //     nurseryLitterRecords: state.nurseryLitterRecords.map((record) =>
    //       record.recordId === action.payload.recordId
    //         ? { ...record, ...action.payload }
    //         : record
    //     ),
    //   };

    case PIG_ACTION_TYPES.UPDATE_BASIC_PIGLET_RECORD:
      return {
        ...state,
        nurseryLitterRecords: state.nurseryLitterRecords.map((record) =>
          record.recordId === action.payload.litterId
            ? {
                ...record,
                piglets: record.piglets.map((piglet) =>
                  piglet.pigletId === action.payload.pigletId
                    ? { ...piglet, ...action.payload }
                    : piglet
                ),
              }
            : record
        ),
      };

    case PIG_ACTION_TYPES.UPDATE_PIGLET_RECORD:
      return {
        ...state,
        nurseryLitterRecords: state.nurseryLitterRecords.map((record) =>
          record.recordId === action.payload.litterId
            ? {
                ...record,
                piglets: record.piglets.map((piglet) =>
                  piglet.pigletId === action.payload.pigletId
                    ? { ...piglet, ...action.payload }
                    : piglet
                ),
              }
            : record
        ),
      };

    case PIG_ACTION_TYPES.FETCH_NURSERY_RECORDS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_NURSERY_RECORDS_SUCCESS:
      return {
        ...state,
        currentNurseryRecords: action.payload,
        nurseryHistory: action.payload,
        isLoading: false,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_NURSERY_RECORDS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case PIG_ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case PIG_ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case PIG_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    // FATTENING
    case PIG_ACTION_TYPES.FETCH_FATTENING_RECORDS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_FATTENING_RECORDS_SUCCESS:
      return {
        ...state,
        fatteningRecords: action.payload,
        isLoading: false,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_FATTENING_RECORDS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case PIG_ACTION_TYPES.MOVE_FATTENING_TO_DRIED_START:
      return {
        ...state,
        isMovingPig: true,
        movingPigId: action.payload.fatteningId,
        error: null,
      };

    case PIG_ACTION_TYPES.MOVE_FATTENING_TO_DRIED_SUCCESS: {
      const { fatteningId, driedRecord } = action.payload;
      const today = new Date().toISOString().split("T")[0];

      const updatedFatteningRecords = state.fatteningRecords.map((record) =>
        record.recordId === fatteningId
          ? { ...record, outDate: today, status: "completed" }
          : record
      );

      return {
        ...state,
        fatteningRecords: updatedFatteningRecords,
        driedRecords: [...state.driedRecords, driedRecord],
        isMovingPig: false,
        movingPigId: null,
        error: null,
      };
    }

    case PIG_ACTION_TYPES.MOVE_FATTENING_TO_DRIED_FAILURE:
      return {
        ...state,
        isMovingPig: false,
        movingPigId: null,
        error: action.payload.error,
      };
    case PIG_ACTION_TYPES.MOVE_FATTENING_TO_INHOUSE_START:
      return {
        ...state,
        isMovingPig: true,
        movingPigId: action.payload.fatteningId,
        error: null,
      };

    case PIG_ACTION_TYPES.MOVE_FATTENING_TO_INHOUSE_SUCCESS: {
      const { fatteningId, inHouseRecord } = action.payload;
      const today = new Date().toISOString().split("T")[0];

      const updatedFatteningRecords = state.fatteningRecords.map((record) =>
        record.recordId === fatteningId
          ? { ...record, outDate: today, status: "completed" }
          : record
      );

      return {
        ...state,
        fatteningRecords: updatedFatteningRecords,
        driedRecords: [...state.inHouseRecords, inHouseRecord],
        isMovingPig: false,
        movingPigId: null,
        error: null,
      };
    }

    case PIG_ACTION_TYPES.MOVE_FATTENING_TO_INHOUSE_FAILURE:
      return {
        ...state,
        isMovingPig: false,
        movingPigId: null,
        error: action.payload.error,
      };

    case PIG_ACTION_TYPES.FETCH_DRIED_RECORDS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_DRIED_RECORDS_SUCCESS:
      return {
        ...state,
        driedRecords: action.payload,
        isLoading: false,
        error: null,
      };

    case PIG_ACTION_TYPES.FETCH_DRIED_RECORDS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default pigReducer;
