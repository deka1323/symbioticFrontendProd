// Pig data structure definitions for JavaScript
export const PigStages = {
  BREEDING: 'breeding',
  GESTATION: 'gestation',
  FARROWING: 'farrowing',
  NURSERY: 'nursery',
  FATTENING: 'fattening',
  SOLD: 'sold'
};

export const PigStatus = {
  LIVING: 'living',
  DEAD: 'dead'
};

export const PigSex = {
  MALE: 'male',
  FEMALE: 'female'
};

// Helper functions for pig data validation
export const validatePigId = (pigId) => {
  return pigId && typeof pigId === 'string' && pigId.trim().length > 0;
};

export const validateWeight = (weight) => {
  return weight && typeof weight === 'number' && weight > 0;
};

export const validateDate = (date) => {
  return date && !isNaN(Date.parse(date));
};

// Default pig structure
export const createDefaultPig = () => ({
  pigId: '',
  sex: PigSex.FEMALE,
  breed: '',
  motherPigId: null,
  fatherPigId: null,
  weight: 0,
  dateOfBirth: '',
  vaccinationDates: [],
  dewormingDates: [],
  otherMedicines: [],
  currentStatus: PigStatus.LIVING,
  currentStage: PigStages.BREEDING,
  matingPartners: [],
  pregnancyCount: 0,
  pigletDetails: [],
  totalPigletsSummary: {
    totalBorn: 0,
    totalLive: 0,
    totalDead: 0
  },
  isBoar: false,
  origin: 'in-house'
});