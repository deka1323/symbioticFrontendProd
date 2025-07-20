import { PIG_ACTION_TYPES } from "../actions/pigActions";

// Mock data for demonstration
const mockBreedingRecords = [
  {
    id: "BR001",
    sowId: "PIG001",
    boarId: "BOAR003",
    matingDate: "2024-01-15",
    inDate: "2024-01-15",
    outDate: null,
    sowBreed: "Yorkshire",
    boarBreed: "Duroc",
    sowAge: 18,
    boarAge: 24,
    status: "active",
  },
  {
    id: "BR002",
    sowId: "PIG025",
    boarId: "BOAR005",
    matingDate: "2024-01-10",
    inDate: "2024-01-10",
    outDate: null,
    sowBreed: "Landrace",
    boarBreed: "Hampshire",
    sowAge: 22,
    boarAge: 30,
    status: "active",
  },
  {
    id: "BR003",
    sowId: "PIG015",
    boarId: "BOAR003",
    matingDate: "2023-12-20",
    inDate: "2023-12-20",
    outDate: "2024-01-05",
    sowBreed: "Yorkshire",
    boarBreed: "Duroc",
    sowAge: 20,
    boarAge: 24,
    status: "completed",
  },
];

const mockGestationRecords = [
  {
    id: "GS001",
    pigId: "PIG001",
    entryDate: "2024-01-15",
    expectedExitDate: "2024-05-08",
    daysInStage: 15,
    breed: "Yorkshire",
    weight: 45.5,
    status: "active",
    notes: "Regular monitoring required",
  },
];

const initialState = {
  breedingRecords: mockBreedingRecords,
  gestationRecords: mockGestationRecords,
  farrowingRecords: [],
  nurseryRecords: [],
  isLoading: false,
  isMovingPig: false,
  movingPigId: null,
  error: null,
};

const pigReducer = (state = initialState, action) => {
  switch (action.type) {
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
        matingDate: today,
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
        record.id === breedingId
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

    case PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_START:
      return {
        ...state,
        isMovingPig: true,
        movingPigId: action.payload.pigId,
        error: null,
      };

    case PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_SUCCESS: {
      const { pigId, fromStage, toStage } = action.payload;

      // This would handle moving records between different stage arrays
      // For now, we'll just update the loading state
      return {
        ...state,
        isMovingPig: false,
        movingPigId: null,
        error: null,
      };
    }

    case PIG_ACTION_TYPES.MOVE_TO_NEXT_STAGE_FAILURE:
      return {
        ...state,
        isMovingPig: false,
        movingPigId: null,
        error: action.payload.error,
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

    default:
      return state;
  }
};

export default pigReducer;
