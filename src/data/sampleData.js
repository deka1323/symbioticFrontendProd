// Sample data for testing - 100 pigs across different stages
export const samplePigs = [
  // Breeding Stage Pigs (20 pigs)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `PIG${String(i + 1).padStart(3, "0")}`,
    pigId: `PIG${String(i + 1).padStart(3, "0")}`,
    sex: i % 2 === 0 ? "female" : "male",
    breed: ["Yorkshire", "Landrace", "Duroc", "Hampshire"][i % 4],
    motherPigId:
      i > 9
        ? `PIG${String(Math.floor(Math.random() * 10) + 1).padStart(3, "0")}`
        : null,
    fatherPigId:
      i > 9
        ? `BOAR${String(Math.floor(Math.random() * 5) + 1).padStart(2, "0")}`
        : null,
    weight: 45 + Math.random() * 20,
    dateOfBirth: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toISOString()
      .split("T")[0],
    currentStatus: "living",
    currentStage: "breeding",
    vaccinationRecords: [
      {
        date: new Date(2024, 1, 15 + i).toISOString().split("T")[0],
        vaccineType: "PRRS",
        nextDueDate: new Date(2024, 13, 15 + i).toISOString().split("T")[0],
      },
    ],
    createdAt: new Date().toISOString(),
  })),

  // Gestation Stage Pigs (15 pigs)
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `PIG${String(i + 21).padStart(3, "0")}`,
    pigId: `PIG${String(i + 21).padStart(3, "0")}`,
    sex: "female",
    breed: ["Yorkshire", "Landrace", "Duroc"][i % 3],
    motherPigId: `PIG${String(Math.floor(Math.random() * 10) + 1).padStart(
      3,
      "0"
    )}`,
    fatherPigId: `BOAR${String(Math.floor(Math.random() * 5) + 1).padStart(
      2,
      "0"
    )}`,
    weight: 50 + Math.random() * 15,
    dateOfBirth: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toISOString()
      .split("T")[0],
    currentStatus: "living",
    currentStage: "gestation",
    vaccinationRecords: [
      {
        date: new Date(2024, 0, 10 + i).toISOString().split("T")[0],
        vaccineType: "FMD",
        nextDueDate: new Date(2024, 12, 10 + i).toISOString().split("T")[0],
      },
    ],
    createdAt: new Date().toISOString(),
  })),

  // Farrowing Stage Pigs (10 pigs)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `PIG${String(i + 36).padStart(3, "0")}`,
    pigId: `PIG${String(i + 36).padStart(3, "0")}`,
    sex: "female",
    breed: ["Yorkshire", "Landrace"][i % 2],
    motherPigId: `PIG${String(Math.floor(Math.random() * 10) + 1).padStart(
      3,
      "0"
    )}`,
    fatherPigId: `BOAR${String(Math.floor(Math.random() * 5) + 1).padStart(
      2,
      "0"
    )}`,
    weight: 55 + Math.random() * 10,
    dateOfBirth: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toISOString()
      .split("T")[0],
    currentStatus: "living",
    currentStage: "farrowing",
    vaccinationRecords: [
      {
        date: new Date(2024, 0, 5 + i).toISOString().split("T")[0],
        vaccineType: "Swine Flu",
        nextDueDate: new Date(2024, 12, 5 + i).toISOString().split("T")[0],
      },
    ],
    createdAt: new Date().toISOString(),
  })),

  // Nursery Stage Pigs (30 piglets)
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `PIG${String(i + 46).padStart(3, "0")}`,
    pigId: `PIG${String(i + 46).padStart(3, "0")}`,
    sex: i % 2 === 0 ? "female" : "male",
    breed: ["Yorkshire-Duroc", "Landrace-Hampshire"][i % 2],
    motherPigId: `PIG${String(Math.floor(i / 6) + 36).padStart(3, "0")}`,
    fatherPigId: `BOAR${String(Math.floor(Math.random() * 5) + 1).padStart(
      2,
      "0"
    )}`,
    weight: 8 + Math.random() * 12,
    dateOfBirth: new Date(2024, 1, Math.floor(Math.random() * 28) + 1)
      .toISOString()
      .split("T")[0],
    currentStatus: "living",
    currentStage: "nursery",
    vaccinationRecords: [
      {
        date: new Date(2024, 2, 1 + i).toISOString().split("T")[0],
        vaccineType: "CSF",
        nextDueDate: new Date(2024, 14, 1 + i).toISOString().split("T")[0],
      },
    ],
    createdAt: new Date().toISOString(),
  })),

  // Fattening Stage Pigs (20 pigs)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `PIG${String(i + 76).padStart(3, "0")}`,
    pigId: `PIG${String(i + 76).padStart(3, "0")}`,
    sex: i % 2 === 0 ? "female" : "male",
    breed: ["Yorkshire-Duroc", "Landrace-Hampshire", "Yorkshire"][i % 3],
    motherPigId: `PIG${String(Math.floor(Math.random() * 15) + 21).padStart(
      3,
      "0"
    )}`,
    fatherPigId: `BOAR${String(Math.floor(Math.random() * 5) + 1).padStart(
      2,
      "0"
    )}`,
    weight: 25 + Math.random() * 40,
    dateOfBirth: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toISOString()
      .split("T")[0],
    currentStatus: "living",
    currentStage: "fattening",
    vaccinationRecords: [
      {
        date: new Date(2024, 0, 1 + i).toISOString().split("T")[0],
        vaccineType: "PRRS",
        nextDueDate: new Date(2024, 12, 1 + i).toISOString().split("T")[0],
      },
    ],
    createdAt: new Date().toISOString(),
  })),

  // Sold Pigs (3 pigs)
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `PIG${String(i + 96).padStart(3, "0")}`,
    pigId: `PIG${String(i + 96).padStart(3, "0")}`,
    sex: i % 2 === 0 ? "female" : "male",
    breed: ["Yorkshire", "Duroc"][i % 2],
    motherPigId: `PIG${String(Math.floor(Math.random() * 15) + 21).padStart(
      3,
      "0"
    )}`,
    fatherPigId: `BOAR${String(Math.floor(Math.random() * 5) + 1).padStart(
      2,
      "0"
    )}`,
    weight: 60 + Math.random() * 20,
    dateOfBirth: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toISOString()
      .split("T")[0],
    currentStatus: "living",
    currentStage: "sold",
    vaccinationRecords: [
      {
        date: new Date(2023, 11, 1 + i).toISOString().split("T")[0],
        vaccineType: "FMD",
        nextDueDate: new Date(2024, 11, 1 + i).toISOString().split("T")[0],
      },
    ],
    soldDate: new Date(2024, 2, 15 + i).toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  })),

  // In-house Use Pigs (2 pigs)
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `PIG${String(i + 99).padStart(3, "0")}`,
    pigId: `PIG${String(i + 99).padStart(3, "0")}`,
    sex: i % 2 === 0 ? "female" : "male",
    breed: ["Yorkshire", "Landrace"][i % 2],
    motherPigId: `PIG${String(Math.floor(Math.random() * 15) + 21).padStart(
      3,
      "0"
    )}`,
    fatherPigId: `BOAR${String(Math.floor(Math.random() * 5) + 1).padStart(
      2,
      "0"
    )}`,
    weight: 55 + Math.random() * 15,
    dateOfBirth: new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toISOString()
      .split("T")[0],
    currentStatus: "living",
    currentStage: "inhouse",
    vaccinationRecords: [
      {
        date: new Date(2023, 10, 1 + i).toISOString().split("T")[0],
        vaccineType: "PRRS",
        nextDueDate: new Date(2024, 10, 1 + i).toISOString().split("T")[0],
      },
    ],
    createdAt: new Date().toISOString(),
  })),
];

// Breeding Records
export const sampleBreedingRecords = [
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `BR${String(i + 1).padStart(3, "0")}`,
    sowId: `PIG${String(i + 1).padStart(3, "0")}`,
    boarId: `BOAR${String((i % 5) + 1).padStart(2, "0")}`,
    matingDate: new Date(2024, 1, i + 1).toISOString().split("T")[0],
    inDate: new Date(2024, 1, i + 1).toISOString().split("T")[0],
    outDate:
      i < 10 ? null : new Date(2024, 2, i - 5).toISOString().split("T")[0],
    sowBreed: ["Yorkshire", "Landrace", "Duroc"][i % 3],
    boarBreed: ["Duroc", "Hampshire", "Yorkshire"][i % 3],
    sowAge: 18 + Math.floor(Math.random() * 12),
    boarAge: 24 + Math.floor(Math.random() * 18),
    status: i < 10 ? "active" : "completed",
  })),
];

// Gestation Records
export const sampleGestationRecords = [
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `GS${String(i + 1).padStart(3, "0")}`,
    pigId: `PIG${String(i + 21).padStart(3, "0")}`,
    inDate: new Date(2024, 1, i + 5).toISOString().split("T")[0],
    outDate:
      i < 8 ? null : new Date(2024, 3, i - 3).toISOString().split("T")[0],
    expectedExitDate: new Date(2024, 5, i + 5).toISOString().split("T")[0],
    daysInStage: 30 + i * 5,
    breed: ["Yorkshire", "Landrace", "Duroc"][i % 3],
    weight: 50 + Math.random() * 15,
    status: i < 8 ? "active" : "completed",
  })),
];

// Farrowing Records
export const sampleFarrowingRecords = [
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `FR${String(i + 1).padStart(3, "0")}`,
    pigId: `PIG${String(i + 36).padStart(3, "0")}`,
    inDate: new Date(2024, 2, i + 1).toISOString().split("T")[0],
    outDate:
      i < 5 ? null : new Date(2024, 3, i - 2).toISOString().split("T")[0],
    farrowingDate: new Date(2024, 2, i + 5).toISOString().split("T")[0],
    stillBorn: Math.floor(Math.random() * 3),
    mummyBorn: Math.floor(Math.random() * 2),
    liveBorn: 6 + Math.floor(Math.random() * 4),
    weaningDate:
      i < 5 ? null : new Date(2024, 3, i + 10).toISOString().split("T")[0],
    weaningCount: 6 + Math.floor(Math.random() * 4),
    atw: function () {
      return this.stillBorn + this.mummyBorn + this.liveBorn;
    },
    breed: ["Yorkshire", "Landrace"][i % 2],
    status: i < 5 ? "active" : "completed",
    remarks:
      i % 3 === 0
        ? "Healthy delivery"
        : i % 3 === 1
        ? "Minor complications"
        : "Excellent condition",
  })),
];

// Nursery Records (Litters with piglets)
export const sampleNurseryRecords = [
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `NR${String(i + 1).padStart(3, "0")}`,
    litterId: `LT${String(i + 1).padStart(3, "0")}`,
    sowId: `PIG${String(i + 36).padStart(3, "0")}`,
    boarId: `BOAR${String((i % 3) + 1).padStart(2, "0")}`,
    inDate: new Date(2024, 2, i + 10).toISOString().split("T")[0],
    farrowingDate: new Date(2024, 2, i + 5).toISOString().split("T")[0],
    weaningDate: new Date(2024, 2, i + 10).toISOString().split("T")[0],
    totalPiglets: 6,
    status: "active",
    piglets: Array.from({ length: 6 }, (_, j) => ({
      id: `P${i + 1}${j + 1}`,
      pigId: `PIG${String(i * 6 + j + 46).padStart(3, "0")}`,
      dob: new Date(2024, 2, i + 5).toISOString().split("T")[0],
      dow: new Date(2024, 2, i + 10).toISOString().split("T")[0],
      weight: 8 + Math.random() * 12,
      sex: j % 2 === 0 ? "female" : "male",
      breed: ["Yorkshire-Duroc", "Landrace-Hampshire"][i % 2],
      csfDate: new Date(2024, 2, i + 15).toISOString().split("T")[0],
      otherVaccination:
        j % 2 === 0
          ? new Date(2024, 2, i + 20).toISOString().split("T")[0]
          : "",
      otherVaccinationName: j % 2 === 0 ? "FMD" : "",
      inDate: new Date(2024, 2, i + 10).toISOString().split("T")[0],
      outDate: null,
      currentStage: "nursery",
    })),
  })),
];

// Company Information
export const companyInfo = {
  name: "SYMBIOTIC FOODS PVT. LTD.",
  address: "Village - Dhekidol, P.O- Ghoramari, Tezpur, Sonitpur, Assam",
  phone: "9560998889",
  email: "symbioticfoods@gmail.com",
  website: "symbioticfoods.in",
  registrationNumber: "REG-PPF-2020-001",
  ownerName: "John Smith",
  ownerSignature: "John Smith",
  DoctorName: "Dr. Deepak Pathak Chetry",
  doctorRegistrationNumber: "ASM 2355",
};

// Generate unique receipt number
export const generateReceiptNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const time = String(date.getTime()).slice(-6);
  return `SF-${year}${month}${day}-${time}`;
};
