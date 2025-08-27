import { create } from 'zustand';


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