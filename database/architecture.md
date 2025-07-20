# Single-Table DynamoDB Architecture for Pig Farm Management System

## Overview

This document provides a comprehensive single-table DynamoDB design that consolidates all pig farm management data into one optimized table while maintaining full functionality and query performance.

## Design Philosophy

- **Single Table Design**: All entities in one table using composite keys
- **Access Pattern Driven**: Designed around specific query requirements
- **Hierarchical Data**: Using sort key patterns for relationships
- **Cost Optimization**: Minimal table count reduces overhead
- **Scalability**: Optimized for 1000+ pigs with room for growth

## Single Table Structure

### Table Name: `PigFarm-Data`

**Primary Key**: `PK` (Partition Key), `SK` (Sort Key)

## Entity Patterns & Access Patterns

### 1. Pig Profile Records

```
PK: PIG#{pigId}
SK: PROFILE

Attributes:
- pigId (String) - Unique identifier
- sex (String) - "male" | "female"
- breed (String) - Yorkshire, Landrace, etc.
- motherPigId (String) - Reference to mother
- fatherPigId (String) - Reference to father
- weight (Number) - Current weight in kg
- dateOfBirth (String) - ISO date format
- currentStatus (String) - "living" | "dead"
- currentStage (String) - "breeding" | "gestation" | "farrowing" | "nursery" | "fattening" | "sold" | "inhouse"
- origin (String) - "in-house" | "purchased"
- isBoar (Boolean) - True if designated as breeding boar
- pregnancyCount (Number) - For sows only
- pregnancyFailed (Boolean) - True if moved from gestation to fattening due to pregnancy failure
- soldDate (String) - Date when sold (if applicable)
- createdAt (String) - ISO timestamp
- updatedAt (String) - ISO timestamp
- GSI1PK (String) - STATUS#{currentStatus}
- GSI1SK (String) - STAGE#{currentStage}#{pigId}
- GSI2PK (String) - STAGE#{currentStage}
- GSI2SK (String) - CREATED#{createdAt}
```

### 2. Medical Records

```
PK: PIG#{pigId}
SK: MEDICAL#{recordType}#{date}#{sequenceId}

Attributes:
- pigId (String)
- recordType (String) - "vaccination" | "deworming" | "medicine"
- date (String) - ISO date
- medicineType (String) - Vaccine/medicine name
- dosage (String) - Amount given
- nextDueDate (String) - For vaccinations
- administeredBy (String) - Staff member
- notes (String) - Additional notes
- createdAt (String)
- GSI1PK (String) - VACCINE#{medicineType}
- GSI1SK (String) - DUE#{nextDueDate}#{pigId}
```

### 3. Stage Records (All Stages)

```
PK: PIG#{pigId}
SK: STAGE#{stageNumber}#{stageName}#{recordId}

Attributes:
- pigId (String)
- stageName (String) - "breeding" | "gestation" | "farrowing" | "nursery" | "fattening"
- stageNumber (Number) - Sequential stage number (1, 2, 3...)
- recordId (String) - Unique record ID for this stage
- inDate (String) - Entry date to stage
- outDate (String) - Exit date from stage
- status (String) - "active" | "completed"
- pregnancyFailed (Boolean) - True if moved from gestation due to pregnancy failure
- stageSpecificData (Map) - Stage-specific attributes
  - For Farrowing stage:
    - farrowingDate (String)
    - stillBorn (Number)
    - mummyBorn (Number)
    - liveBorn (Number)
    - deathDuringFarrowing (Number)
    - atw (Number) - Average total weight
    - totalBorn (Number) - Calculated total
    - weaningCount (Number) - Calculated weaning count
    - remarks (String)
  - For Breeding stage:
    - matingDate (String)
    - sowBreed (String)
    - boarBreed (String)
    - sowAge (Number)
    - boarAge (Number)
    - notes (String)
- createdAt (String)
- updatedAt (String)
- GSI1PK (String) - STAGE#{stageName}#{status}
- GSI1SK (String) - DATE#{inDate}#{pigId}
- GSI2PK (String) - STAGE#{stageName}
- GSI2SK (String) - STATUS#{status}#{inDate}
```

### 4. Breeding Records

```
PK: BREEDING#{breedingId}
SK: RECORD

Attributes:
- breedingId (String) - Unique breeding record ID
- sowId (String) - Female pig ID
- boarId (String) - Male pig ID
- matingDate (String) - ISO date
- inDate (String) - Entry date to breeding stage
- outDate (String) - Exit date from breeding stage
- sowBreed (String)
- boarBreed (String)
- sowAge (Number) - Age in months
- boarAge (Number) - Age in months
- status (String) - "active" | "completed"
- expectedDeliveryDate (String) - matingDate + 114 days
- notes (String)
- createdAt (String)
- updatedAt (String)
- GSI1PK (String) - SOW#{sowId}
- GSI1SK (String) - BREEDING#{matingDate}
- GSI2PK (String) - STATUS#{status}
- GSI2SK (String) - DATE#{matingDate}
```

### 5. Litter Records (Nursery)

```
PK: LITTER#{litterId}
SK: METADATA

Attributes:
- litterId (String) - Unique litter ID
- sowId (String) - Mother pig ID
- boarId (String) - Father pig ID
- farrowingDate (String) - Birth date of piglets
- weaningDate (String) - Weaning date
- totalPiglets (Number) - Total piglets in litter
- stillBorn (Number) - Number of stillborn piglets
- mummyBorn (Number) - Number of mummy born piglets
- liveBorn (Number) - Number of live born piglets
- deathDuringFarrowing (Number) - Deaths during farrowing process
- atw (Number) - Average total weight in kg
- totalBorn (Number) - Total piglets born (calculated: stillBorn + mummyBorn + liveBorn)
- weaningCount (Number) - Number of piglets weaned (calculated: liveBorn - deathDuringFarrowing)
- inDate (String) - Entry to nursery
- outDate (String) - Exit from nursery
- status (String) - "active" | "completed"
- createdAt (String)
- updatedAt (String)
- GSI1PK (String) - NURSERY#{status}
- GSI1SK (String) - LITTER#{litterId}
```

### 6. Piglet Records (Individual piglets in litter)

```
PK: LITTER#{litterId}
SK: PIGLET#{pigletId}

Attributes:
- pigletId (String) - Unique piglet ID
- litterId (String) - Parent litter ID
- pigId (String) - Assigned pig ID
- dob (String) - Date of birth (farrowing date)
- dow (String) - Date of weaning
- weight (Number) - Current weight
- sex (String) - "male" | "female"
- breed (String) - Breed combination
- csfDate (String) - CSF vaccination date
- otherVaccination (String) - Other vaccination date
- otherVaccinationName (String) - Other vaccination name
- inDate (String) - Entry to nursery
- outDate (String) - Exit from nursery
- currentStage (String) - Current stage of piglet
- status (String) - "active" | "moved"
- createdAt (String)
- updatedAt (String)
- GSI1PK (String) - PIGLET#{pigId}
- GSI1SK (String) - STAGE#{currentStage}
```

### 7. Sales Records

```
PK: SALE#{saleId}
SK: RECORD

Attributes:
- saleId (String) - Unique sale ID
- receiptNumber (String) - Generated receipt number
- saleDate (String) - Date of sale
- buyerName (String) - Buyer's name
- buyerAddress (String) - Buyer's address
- buyerPhone (String) - Buyer's phone
- managerName (String) - Manager who handled sale
- pigIds (List) - List of pig IDs sold
- pigletCount (Number) - Number of piglets sold
- adultCount (Number) - Number of adults sold
- totalPigs (Number) - Total pigs sold
- createdAt (String)
- GSI1PK (String) - DATE#{saleDate}
- GSI1SK (String) - SALE#{saleId}
- GSI2PK (String) - BUYER#{buyerName}
- GSI2SK (String) - DATE#{saleDate}
```

### 8. Lookup Records (For quick counts and statistics)

```
PK: LOOKUP#{entityType}
SK: COUNT#{date}

Attributes:
- entityType (String) - "TOTAL_PIGS" | "LIVING_PIGS" | "DEAD_PIGS" | "STAGE_COUNTS"
- date (String) - Date of count
- counts (Map) - Count data by category
- lastUpdated (String)
- GSI1PK (String) - LOOKUP#{entityType}
- GSI1SK (String) - DATE#{date}
```

## Global Secondary Indexes

### GSI1: Entity-Status-Date Index

**Index Name**: `EntityStatusDateIndex`

- **PK**: GSI1PK
- **SK**: GSI1SK
- **Purpose**: Query by entity type, status, and date ranges

### GSI2: Stage-Status Index

**Index Name**: `StageStatusIndex`

- **PK**: GSI2PK
- **SK**: GSI2SK
- **Purpose**: Query by stage and status combinations

## Complete Query Documentation by Page

### 1. Dashboard Page

#### Get Pig Details by ID

```javascript
// Query: Get pig profile
const params = {
  TableName: "PigFarm-Data",
  Key: {
    PK: `PIG#${pigId}`,
    SK: "PROFILE",
  },
};

// Query: Get pig stage history
const historyParams = {
  TableName: "PigFarm-Data",
  KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
  ExpressionAttributeValues: {
    ":pk": `PIG#${pigId}`,
    ":sk": "STAGE#",
  },
  ScanIndexForward: true,
};

// Query: Get pig medical records
const medicalParams = {
  TableName: "PigFarm-Data",
  KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
  ExpressionAttributeValues: {
    ":pk": `PIG#${pigId}`,
    ":sk": "MEDICAL#",
  },
};
```

### 2. Breeding Stage Page

#### Get Current Breeding Records

```javascript
// Query: Get all active breeding records
const params = {
  TableName: "PigFarm-Data",
  IndexName: "StageStatusIndex",
  KeyConditionExpression: "GSI2PK = :stage AND begins_with(GSI2SK, :status)",
  ExpressionAttributeValues: {
    ":stage": "STAGE#breeding",
    ":status": "STATUS#active",
  },
};
```

#### Get Breeding History (Month-wise)

```javascript
// Query: Get completed breeding records for specific month
const params = {
  TableName: "PigFarm-Data",
  IndexName: "StageStatusIndex",
  KeyConditionExpression:
    "GSI2PK = :stage AND begins_with(GSI2SK, :statusMonth)",
  ExpressionAttributeValues: {
    ":stage": "STAGE#breeding",
    ":statusMonth": `STATUS#completed#${year}-${month.padStart(2, "0")}`,
  },
};
```

#### Add New Breeding Record

```javascript
// Transaction: Create breeding record and update pig stage
const transactParams = {
  TransactItems: [
    {
      Put: {
        TableName: "PigFarm-Data",
        Item: {
          PK: `BREEDING#${breedingId}`,
          SK: "RECORD",
          breedingId,
          sowId,
          boarId,
          matingDate: today,
          inDate: today,
          status: "active",
          // ... other attributes
          GSI1PK: `SOW#${sowId}`,
          GSI1SK: `BREEDING#${today}`,
          GSI2PK: "STAGE#breeding",
          GSI2SK: `STATUS#active#${today}`,
        },
      },
    },
    {
      Put: {
        TableName: "PigFarm-Data",
        Item: {
          PK: `PIG#${sowId}`,
          SK: `STAGE#${stageNumber}#breeding#${breedingId}`,
          pigId: sowId,
          stageName: "breeding",
          stageNumber,
          recordId: breedingId,
          inDate: today,
          status: "active",
          stageSpecificData: {
            breedingRecordId: breedingId,
            boarId,
            matingDate: today,
          },
        },
      },
    },
    {
      Update: {
        TableName: "PigFarm-Data",
        Key: { PK: `PIG#${sowId}`, SK: "PROFILE" },
        UpdateExpression: "SET currentStage = :stage",
        ExpressionAttributeValues: { ":stage": "breeding" },
      },
    },
  ],
};
```

#### Move to Gestation

```javascript
// Transaction: Update breeding record, create gestation record, update pig
const transactParams = {
  TransactItems: [
    {
      Update: {
        TableName: "PigFarm-Data",
        Key: { PK: `BREEDING#${breedingId}`, SK: "RECORD" },
        UpdateExpression:
          "SET outDate = :outDate, #status = :status, GSI2SK = :newStatusDate",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":outDate": today,
          ":status": "completed",
          ":newStatusDate": `STATUS#completed#${today}`,
        },
      },
    },
    {
      Update: {
        TableName: "PigFarm-Data",
        Key: {
          PK: `PIG#${sowId}`,
          SK: `STAGE#${currentStageNumber}#breeding#${breedingId}`,
        },
        UpdateExpression: "SET outDate = :outDate, #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":outDate": today,
          ":status": "completed",
        },
      },
    },
    {
      Put: {
        TableName: "PigFarm-Data",
        Item: {
          PK: `PIG#${sowId}`,
          SK: `STAGE#${nextStageNumber}#gestation#${gestationId}`,
          pigId: sowId,
          stageName: "gestation",
          stageNumber: nextStageNumber,
          recordId: gestationId,
          inDate: today,
          status: "active",
          pregnancyFailed: false,
          stageSpecificData: {
            breedingRecordId: breedingId,
            expectedExitDate: expectedDate,
            daysInStage: 0,
          },
        },
      },
    },
    {
      Update: {
        TableName: "PigFarm-Data",
        Key: { PK: `PIG#${sowId}`, SK: "PROFILE" },
        UpdateExpression: "SET currentStage = :stage",
        ExpressionAttributeValues: { ":stage": "gestation" },
      },
    },
  ],
};
```

### 3. Gestation Stage Page

#### Move to Fattening (Pregnancy Failed)

```javascript
// Transaction: Mark pregnancy as failed and move to fattening
const transactParams = {
  TransactItems: [
    {
      Update: {
        TableName: "PigFarm-Data",
        Key: {
          PK: `PIG#${sowId}`,
          SK: `STAGE#${currentStageNumber}#gestation#${gestationId}`,
        },
        UpdateExpression:
          "SET outDate = :outDate, #status = :status, pregnancyFailed = :failed",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":outDate": today,
          ":status": "completed",
          ":failed": true,
        },
      },
    },
    {
      Put: {
        TableName: "PigFarm-Data",
        Item: {
          PK: `PIG#${sowId}`,
          SK: `STAGE#${nextStageNumber}#fattening#${fatteningId}`,
          pigId: sowId,
          stageName: "fattening",
          stageNumber: nextStageNumber,
          recordId: fatteningId,
          inDate: today,
          status: "active",
          pregnancyFailed: true,
          stageSpecificData: {
            previousStage: "gestation",
            pregnancyFailedDate: today,
            reason: "pregnancy_failed",
          },
        },
      },
    },
    {
      Update: {
        TableName: "PigFarm-Data",
        Key: { PK: `PIG#${sowId}`, SK: "PROFILE" },
        UpdateExpression:
          "SET currentStage = :stage, pregnancyFailed = :failed",
        ExpressionAttributeValues: {
          ":stage": "fattening",
          ":failed": true,
        },
      },
    },
  ],
};
```

#### Get Current Gestation Records

```javascript
// Query: Get all active gestation records
const params = {
  TableName: "PigFarm-Data",
  IndexName: "EntityStatusDateIndex",
  KeyConditionExpression: "GSI1PK = :stage",
  FilterExpression: "stageName = :stageName AND #status = :status",
  ExpressionAttributeNames: { "#status": "status" },
  ExpressionAttributeValues: {
    ":stage": "STAGE#gestation#active",
    ":stageName": "gestation",
    ":status": "active",
  },
};
```

#### Get Gestation History (Month-wise)

```javascript
// Query: Get completed gestation records for specific month
const params = {
  TableName: "PigFarm-Data",
  IndexName: "EntityStatusDateIndex",
  KeyConditionExpression: "GSI1PK = :stage AND begins_with(GSI1SK, :month)",
  FilterExpression: "stageName = :stageName AND #status = :status",
  ExpressionAttributeNames: { "#status": "status" },
  ExpressionAttributeValues: {
    ":stage": "STAGE#gestation#completed",
    ":month": `DATE#${year}-${month.padStart(2, "0")}`,
    ":stageName": "gestation",
    ":status": "completed",
  },
};
```

### 4. Farrowing Stage Page

#### Get Current Farrowing Records

```javascript
// Query: Get all active farrowing records
const params = {
  TableName: "PigFarm-Data",
  IndexName: "EntityStatusDateIndex",
  KeyConditionExpression: "GSI1PK = :stage",
  FilterExpression: "stageName = :stageName AND #status = :status",
  ExpressionAttributeNames: { "#status": "status" },
  ExpressionAttributeValues: {
    ":stage": "STAGE#farrowing#active",
    ":stageName": "farrowing",
    ":status": "active",
  },
};
```

#### Update Farrowing Details

```javascript
// Mutation: Update farrowing stage record
const params = {
  TableName: "PigFarm-Data",
  Key: { PK: `PIG#${pigId}`, SK: `STAGE#${stageNumber}#farrowing#${recordId}` },
  UpdateExpression:
    "SET stageSpecificData.farrowingDate = :fDate, stageSpecificData.stillBorn = :still, stageSpecificData.mummyBorn = :mummy, stageSpecificData.liveBorn = :live, stageSpecificData.deathDuringFarrowing = :death, stageSpecificData.atw = :atw, stageSpecificData.totalBorn = :total, stageSpecificData.weaningCount = :weaning, stageSpecificData.remarks = :remarks",
  ExpressionAttributeValues: {
    ":fDate": farrowingDate,
    ":still": stillBorn,
    ":mummy": mummyBorn,
    ":live": liveBorn,
    ":death": deathDuringFarrowing,
    ":atw": atw,
    ":total": stillBorn + mummyBorn + liveBorn,
    ":weaning": liveBorn - deathDuringFarrowing,
    ":remarks": remarks,
  },
};
```

### 5. Nursery Stage Page

#### Get Current Nursery Records with Piglets

```javascript
// Query: Get all active litters
const litterParams = {
  TableName: "PigFarm-Data",
  IndexName: "EntityStatusDateIndex",
  KeyConditionExpression: "GSI1PK = :nursery",
  ExpressionAttributeValues: {
    ":nursery": "NURSERY#active",
  },
};

// Query: Get piglets for each litter
const pigletParams = {
  TableName: "PigFarm-Data",
  KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
  ExpressionAttributeValues: {
    ":pk": `LITTER#${litterId}`,
    ":sk": "PIGLET#",
  },
};
```

#### Update Piglet Details

```javascript
// Mutation: Update individual piglet
const params = {
  TableName: "PigFarm-Data",
  Key: { PK: `LITTER#${litterId}`, SK: `PIGLET#${pigletId}` },
  UpdateExpression:
    "SET pigId = :pigId, weight = :weight, sex = :sex, breed = :breed, csfDate = :csf, otherVaccination = :otherVacc, otherVaccinationName = :otherVaccName",
  ExpressionAttributeValues: {
    ":pigId": newPigId,
    ":weight": weight,
    ":sex": sex,
    ":breed": breed,
    ":csf": csfDate,
    ":otherVacc": otherVaccination,
    ":otherVaccName": otherVaccinationName,
  },
};
```

#### Move Individual Piglet to Fattening

```javascript
// Transaction: Move piglet to fattening
const transactParams = {
  TransactItems: [
    {
      Update: {
        TableName: "PigFarm-Data",
        Key: { PK: `LITTER#${litterId}`, SK: `PIGLET#${pigletId}` },
        UpdateExpression:
          "SET outDate = :outDate, currentStage = :stage, #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":outDate": today,
          ":stage": "fattening",
          ":status": "moved",
        },
      },
    },
    {
      Put: {
        TableName: "PigFarm-Data",
        Item: {
          PK: `PIG#${pigletId}`,
          SK: `STAGE#${stageNumber}#fattening#${fatteningId}`,
          pigId: pigletId,
          stageName: "fattening",
          stageNumber,
          recordId: fatteningId,
          inDate: today,
          status: "active",
          stageSpecificData: {
            fatherPigId: boarId,
            motherPigId: sowId,
            breed,
            sex,
            weight,
          },
        },
      },
    },
    {
      Put: {
        TableName: "PigFarm-Data",
        Item: {
          PK: `PIG#${pigletId}`,
          SK: "PROFILE",
          pigId: pigletId,
          sex,
          breed,
          motherPigId: sowId,
          fatherPigId: boarId,
          weight,
          dateOfBirth: dob,
          currentStatus: "living",
          currentStage: "fattening",
          origin: "in-house",
          createdAt: now,
          GSI1PK: "STATUS#living",
          GSI1SK: "STAGE#fattening#" + pigletId,
          GSI2PK: "STAGE#fattening",
          GSI2SK: "CREATED#" + now,
        },
      },
    },
  ],
};
```

### 6. Fattening Stage Page

#### Get Current Fattening Records

```javascript
// Query: Get all active fattening records
const params = {
  TableName: "PigFarm-Data",
  IndexName: "EntityStatusDateIndex",
  KeyConditionExpression: "GSI1PK = :stage",
  FilterExpression: "stageName = :stageName AND #status = :status",
  ExpressionAttributeNames: { "#status": "status" },
  ExpressionAttributeValues: {
    ":stage": "STAGE#fattening#active",
    ":stageName": "fattening",
    ":status": "active",
  },
};
```

#### Filter by Weight Range

```javascript
// Query: Get fattening records within weight range
const params = {
  TableName: "PigFarm-Data",
  IndexName: "EntityStatusDateIndex",
  KeyConditionExpression: "GSI1PK = :stage",
  FilterExpression:
    "stageName = :stageName AND #status = :status AND stageSpecificData.weight BETWEEN :minWeight AND :maxWeight",
  ExpressionAttributeNames: { "#status": "status" },
  ExpressionAttributeValues: {
    ":stage": "STAGE#fattening#active",
    ":stageName": "fattening",
    ":status": "active",
    ":minWeight": minWeight,
    ":maxWeight": maxWeight,
  },
};
```

#### Mark as In-House Use

```javascript
// Transaction: Move pig to in-house use
const transactParams = {
  TransactItems: [
    {
      Update: {
        TableName: "PigFarm-Data",
        Key: {
          PK: `PIG#${pigId}`,
          SK: `STAGE#${stageNumber}#fattening#${recordId}`,
        },
        UpdateExpression: "SET outDate = :outDate, #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":outDate": today,
          ":status": "completed",
        },
      },
    },
    {
      Put: {
        TableName: "PigFarm-Data",
        Item: {
          PK: `PIG#${pigId}`,
          SK: `STAGE#${nextStageNumber}#inhouse#${inhouseId}`,
          pigId,
          stageName: "inhouse",
          stageNumber: nextStageNumber,
          recordId: inhouseId,
          inDate: today,
          status: "active",
          stageSpecificData: {
            previousStage: "fattening",
            inhouseDate: today,
          },
        },
      },
    },
    {
      Update: {
        TableName: "PigFarm-Data",
        Key: { PK: `PIG#${pigId}`, SK: "PROFILE" },
        UpdateExpression: "SET currentStage = :stage",
        ExpressionAttributeValues: { ":stage": "inhouse" },
      },
    },
  ],
};
```

### 7. Sales Management Page

#### Create Sale Record

```javascript
// Transaction: Create sale and update pig statuses
const transactItems = [
  {
    Put: {
      TableName: "PigFarm-Data",
      Item: {
        PK: `SALE#${saleId}`,
        SK: "RECORD",
        saleId,
        receiptNumber,
        saleDate: today,
        buyerName,
        buyerAddress,
        buyerPhone,
        managerName,
        pigIds,
        pigletCount,
        adultCount,
        totalPigs: pigIds.length,
        createdAt: now,
        GSI1PK: `DATE#${today}`,
        GSI1SK: `SALE#${saleId}`,
        GSI2PK: `BUYER#${buyerName}`,
        GSI2SK: `DATE#${today}`,
      },
    },
  },
];

// Add pig status updates and stage records
pigIds.forEach((pigId, index) => {
  const stageNumber = index + 1; // This would be calculated based on pig's history

  transactItems.push({
    Update: {
      TableName: "PigFarm-Data",
      Key: { PK: `PIG#${pigId}`, SK: "PROFILE" },
      UpdateExpression: "SET currentStage = :stage, soldDate = :soldDate",
      ExpressionAttributeValues: {
        ":stage": "sold",
        ":soldDate": today,
      },
    },
  });

  transactItems.push({
    Put: {
      TableName: "PigFarm-Data",
      Item: {
        PK: `PIG#${pigId}`,
        SK: `STAGE#${stageNumber}#sold#${saleId}`,
        pigId,
        stageName: "sold",
        stageNumber,
        recordId: saleId,
        inDate: today,
        status: "active",
        stageSpecificData: {
          saleId,
          buyerName,
          saleDate: today,
        },
      },
    },
  });
});

const transactParams = { TransactItems: transactItems };
```

### 8. Reports Page

#### Upcoming Vaccinations (Month-wise)

```javascript
// Query: Get vaccinations due in specific month
const params = {
  TableName: "PigFarm-Data",
  IndexName: "EntityStatusDateIndex",
  KeyConditionExpression: "GSI1PK = :vaccine AND begins_with(GSI1SK, :month)",
  ExpressionAttributeValues: {
    ":vaccine": `VACCINE#${vaccineType}`,
    ":month": `DUE#${year}-${month.padStart(2, "0")}`,
  },
};
```

#### Expected Deliveries (Month-wise)

```javascript
// Query: Get expected deliveries for specific month
const params = {
  TableName: "PigFarm-Data",
  IndexName: "EntityStatusDateIndex",
  KeyConditionExpression: "GSI1PK = :gestation AND begins_with(GSI1SK, :month)",
  FilterExpression: "stageName = :stageName AND #status = :status",
  ExpressionAttributeNames: { "#status": "status" },
  ExpressionAttributeValues: {
    ":gestation": "STAGE#gestation#active",
    ":month": `DATE#${year}-${month.padStart(2, "0")}`,
    ":stageName": "gestation",
    ":status": "active",
  },
};
```

#### Population Report by Stage

```javascript
// Query: Get pigs by current stage
const params = {
  TableName: "PigFarm-Data",
  IndexName: "StageStatusIndex",
  KeyConditionExpression: "GSI2PK = :stage",
  ExpressionAttributeValues: {
    ":stage": `STAGE#${stageName}`,
  },
};
```

#### Sales Report (Month-wise)

```javascript
// Query: Get sales for specific month
const params = {
  TableName: "PigFarm-Data",
  IndexName: "EntityStatusDateIndex",
  KeyConditionExpression: "GSI1PK = :date",
  ExpressionAttributeValues: {
    ":date": `DATE#${year}-${month.padStart(2, "0")}`,
  },
};
```

#### In-House Report (Month-wise)

```javascript
// Query: Get in-house pigs for specific month
const params = {
  TableName: "PigFarm-Data",
  IndexName: "EntityStatusDateIndex",
  KeyConditionExpression: "GSI1PK = :stage AND begins_with(GSI1SK, :month)",
  FilterExpression: "stageName = :stageName",
  ExpressionAttributeValues: {
    ":stage": "STAGE#inhouse#active",
    ":month": `DATE#${year}-${month.padStart(2, "0")}`,
    ":stageName": "inhouse",
  },
};
```

## Performance Optimization Strategies

### 1. Read Optimization

- **Hot Partition Management**: Distribute reads across multiple partitions
- **Eventually Consistent Reads**: Use for non-critical real-time data
- **Batch Operations**: Group related queries together
- **Caching Layer**: Implement ElastiCache for frequently accessed data

### 2. Write Optimization

- **Transaction Batching**: Group related writes in transactions
- **Write Sharding**: Use random suffixes for high-volume writes
- **Conditional Writes**: Prevent overwrites with conditions
- **DynamoDB Streams**: Use for real-time processing and triggers

### 3. Cost Optimization

- **On-Demand vs Provisioned**: Choose based on traffic patterns
- **TTL Implementation**: Auto-delete old records
- **Data Archiving**: Move historical data to S3
- **GSI Optimization**: Only create necessary indexes

## Capacity Planning & Cost Estimates

### Storage Requirements (1000 Pigs)

- **Pig Profiles**: ~1MB (1KB per pig)
- **Medical Records**: ~10MB (100 records per pig, 100 bytes each)
- **Stage Records**: ~5MB (50 stage transitions per pig, 100 bytes each)
- **Breeding Records**: ~500KB (500 breeding events, 1KB each)
- **Litter & Piglet Records**: ~2MB (200 litters with piglet details)
- **Sales Records**: ~200KB (200 sales transactions, 1KB each)
- **Lookup Records**: ~100KB (Statistics and counts)

**Total Storage**: ~18MB

### Monthly Operations (1000 Pigs)

- **Read Operations**: 100,000 (daily monitoring, reports, searches)
- **Write Operations**: 10,000 (updates, new records, stage transitions)

### Monthly Cost Estimate (Mumbai Region)

- **Storage**: $0.25 per GB = $0.0045 (~₹0.38)
- **Read Operations**: $0.25 per million = $0.025 (~₹2.10)
- **Write Operations**: $1.25 per million = $0.0125 (~₹1.05)
- **GSI Storage & Operations**: $0.02 (~₹1.68)

**Total Monthly DynamoDB Cost**: ~$0.062 (~₹5.21)

## Advantages of Single-Table Design

### 1. Performance Benefits

- **Fewer Network Calls**: Related data in same table
- **Atomic Transactions**: All related updates in single transaction
- **Consistent Performance**: Predictable query patterns
- **Reduced Latency**: Single table lookups

### 2. Cost Benefits

- **Lower Base Costs**: Single table overhead
- **Reduced GSI Costs**: Fewer indexes needed
- **Simplified Billing**: Single table to monitor
- **Better Resource Utilization**: Shared capacity

### 3. Operational Benefits

- **Simplified Management**: One table to maintain
- **Easier Monitoring**: Single table metrics
- **Consistent Backup**: Single backup strategy
- **Reduced Complexity**: Fewer moving parts

### 4. Scalability Benefits

- **Horizontal Scaling**: DynamoDB handles partitioning
- **Flexible Schema**: Easy to add new entity types
- **Query Optimization**: Access patterns drive design
- **Future-Proof**: Easy to extend functionality

This single-table architecture provides all the functionality of the multi-table design while offering better performance, lower costs, and simplified operations - making it the optimal choice for a pig farm management system.
