import { create } from 'zustand';

// Mock data for demonstration
const mockBreedingRecords = [
  {
    id: 'BR001',
    sowId: 'PIG001',
    boarId: 'BOAR003',
    matingDate: '2024-01-15',
    inDate: '2024-01-15',
    outDate: null,
    sowBreed: 'Yorkshire',
    boarBreed: 'Duroc',
    sowAge: 18,
    boarAge: 24,
    status: 'active'
  },
  {
    id: 'BR002',
    sowId: 'PIG025',
    boarId: 'BOAR005',
    matingDate: '2024-01-10',
    inDate: '2024-01-10',
    outDate: null,
    sowBreed: 'Landrace',
    boarBreed: 'Hampshire',
    sowAge: 22,
    boarAge: 30,
    status: 'active'
  },
  {
    id: 'BR003',
    sowId: 'PIG015',
    boarId: 'BOAR003',
    matingDate: '2023-12-20',
    inDate: '2023-12-20',
    outDate: '2024-01-05',
    sowBreed: 'Yorkshire',
    boarBreed: 'Duroc',
    sowAge: 20,
    boarAge: 24,
    status: 'completed'
  }
];

const mockGestationRecords = [
  {
    id: 'GS001',
    pigId: 'PIG001',
    entryDate: '2024-01-15',
    expectedExitDate: '2024-05-08',
    daysInStage: 15,
    breed: 'Yorkshire',
    weight: 45.5,
    status: 'active',
    notes: 'Regular monitoring required'
  }
];

const usePigStore = create((set, get) => ({
  // Breeding Records
  breedingRecords: mockBreedingRecords,
  gestationRecords: mockGestationRecords,
  
  // Loading states
  isMovingPig: false,
  movingPigId: null,

  // Actions
  moveToGestation: async (breedingId, targetStage = 'gestation') => {
    set({ isMovingPig: true, movingPigId: breedingId });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { breedingRecords, gestationRecords } = get();
    const today = new Date().toISOString().split('T')[0];
    
    // Find the breeding record
    const breedingRecord = breedingRecords.find(record => record.id === breedingId);
    
    if (breedingRecord) {
      // Update breeding record with out date and status
      const updatedBreedingRecords = breedingRecords.map(record =>
        record.id === breedingId
          ? { ...record, outDate: today, status: 'completed' }
          : record
      );
      
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
      
      set({
        breedingRecords: updatedBreedingRecords,
        gestationRecords: [...gestationRecords, newGestationRecord],
        isMovingPig: false,
        movingPigId: null
      });
      
      return { success: true, targetStage };
    }
    
    set({ isMovingPig: false, movingPigId: null });
    return { success: false };
  },

  addBreedingRecord: (newRecord) => {
    const { breedingRecords } = get();
    const today = new Date().toISOString().split('T')[0];
    
    const record = {
      ...newRecord,
      id: `BR${Date.now()}`,
      matingDate: today,
      inDate: today,
      outDate: null,
      status: 'active'
    };
    
    set({
      breedingRecords: [...breedingRecords, record]
    });
  },

  // Get current and history records
  getCurrentBreedingRecords: () => {
    const { breedingRecords } = get();
    return breedingRecords.filter(record => record.status === 'active');
  },

  getBreedingHistory: () => {
    const { breedingRecords } = get();
    return breedingRecords.filter(record => record.status === 'completed');
  }
}));

export default usePigStore;
</parameter>