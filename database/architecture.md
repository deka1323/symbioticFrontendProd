# Pig Farm Management System - Complete Database Architecture & Query Documentation

## Overview

This document provides comprehensive database architecture and detailed query specifications for the Pig Farm Management System using AWS DynamoDB with supporting services.

## Database Design Philosophy

- **Single Table Design**: Leveraging DynamoDB's strengths with composite keys
- **Access Patterns First**: Designed around query requirements
- **Scalability**: Optimized for 1000+ pigs with room for growth
- **Cost Efficiency**: Minimized read/write operations

## Core Tables Structure

### 1. Pigs Table (Primary Entity Table)

**Table Name**: `PigFarm-Pigs`
**Primary Key**: `PK` (Partition Key), `SK` (Sort Key)

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
- soldDate (String) - Date when sold (if applicable)
- createdAt (String) - ISO timestamp
- updatedAt (String) - ISO timestamp
- GSI1PK (String) - STATUS#{currentStatus}
- GSI1SK (String) - STAGE#{currentStage}#{pigId}
- GSI2PK (String) - STAGE#{currentStage}
- GSI2SK (String) - CREATED#{createdAt}
```

### 2. Medical Records Table

**Table Name**: `PigFarm-MedicalRecords`
**Primary Key**: `PK`, `SK`

```
PK: PIG#{pigId}
SK: MEDICAL#{recordType}#{date}#{id}

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

### 3. Breeding Records Table

**Table Name**: `PigFarm-BreedingRecords`
**Primary Key**: `PK`, `SK`

```
PK: BREEDING#{breedingId}
SK: RECORD

Attributes:
- breedingId (String) - Unique breeding record ID
- sowId (String) - Female pig ID
- boarId (String) - Male pig ID
- matingDate (String) - ISO date (also inDate)
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

### 4. Gestation Records Table

**Table Name**: `PigFarm-GestationRecords`
**Primary Key**: `PK`, `SK`

```
PK: GESTATION#{gestationId}
SK: RECORD

Attributes:
- gestationId (String) - Unique gestation record ID
- pigId (String) - Sow ID
- breedingRecordId (String) - Reference to breeding record
- inDate (String) - Entry date to gestation
- outDate (String) - Exit date from gestation
- expectedExitDate (String) - inDate + 114 days
- daysInStage (Number) - Current days in gestation
- breed (String)
- weight (Number) - Current weight
- status (String) - "active" | "completed"
- notes (String)
- createdAt (String)
- updatedAt (String)
- GSI1PK (String) - STATUS#{status}
- GSI1SK (String) - PIG#{pigId}
- GSI2PK (String) - EXPECTED#{expectedExitDate}
- GSI2SK (String) - PIG#{pigId}
```

### 5. Farrowing Records Table

**Table Name**: `PigFarm-FarrowingRecords`
**Primary Key**: `PK`, `SK`

```
PK: FARROWING#{farrowingId}
SK: RECORD

Attributes:
- farrowingId (String) - Unique farrowing record ID
- pigId (String) - Sow ID
- gestationRecordId (String) - Reference to gestation record
- inDate (String) - Entry date to farrowing
- outDate (String) - Exit date from farrowing
- farrowingDate (String) - Actual delivery date
- stillBorn (Number) - Number of stillborn piglets
- mummyBorn (Number) - Number of mummy piglets
- liveBorn (Number) - Number of live piglets
- atw (Number) - All Total Weight (stillBorn + mummyBorn + liveBorn)
- weaningDate (String) - Date of weaning
- weaningCount (Number) - Number weaned
- breed (String)
- status (String) - "active" | "completed"
- remarks (String) - Additional notes
- createdAt (String)
- updatedAt (String)
- GSI1PK (String) - STATUS#{status}
- GSI1SK (String) - FARROWING#{farrowingDate}
- GSI2PK (String) - SOW#{pigId}
- GSI2SK (String) - DATE#{farrowingDate}
```

### 6. Nursery Records Table

**Table Name**: `PigFarm-NurseryRecords`
**Primary Key**: `PK`, `SK`

```
PK: NURSERY#{litterId}
SK: RECORD

Attributes:
- litterId (String) - Unique litter ID
- sowId (String) - Mother pig ID
- boarId (String) - Father pig ID
- farrowingRecordId (String) - Reference to farrowing record
- inDate (String) - Entry date to nursery
- outDate (String) - Exit date from nursery
- farrowingDate (String) - Birth date of piglets
- weaningDate (String) - Weaning date
- totalPiglets (Number) - Total piglets in litter
- status (String) - "active" | "completed"
- createdAt (String)
- updatedAt (String)
- GSI1PK (String) - STATUS#{status}
- GSI1SK (String) - LITTER#{litterId}
```

### 7. Piglet Records Table (Sub-records of Nursery)

**Table Name**: `PigFarm-PigletRecords`
**Primary Key**: `PK`, `SK`

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

### 8. Fattening Records Table

**Table Name**: `PigFarm-FatteningRecords`
**Primary Key**: `PK`, `SK`

```
PK: FATTENING#{fatteningId}
SK: RECORD

Attributes:
- fatteningId (String) - Unique fattening record ID
- pigId (String) - Pig ID
- fatherPigId (String) - Father pig ID
- motherPigId (String) - Mother pig ID
- breed (String) - Breed
- sex (String) - "male" | "female"
- weight (Number) - Current weight
- inDate (String) - Entry date to fattening
- outDate (String) - Exit date from fattening
- status (String) - "active" | "completed"
- outcome (String) - "sold" | "inhouse"
- createdAt (String)
- updatedAt (String)
- GSI1PK (String) - STATUS#{status}
- GSI1SK (String) - PIG#{pigId}
- GSI2PK (String) - WEIGHT#{weight}
- GSI2SK (String) - PIG#{pigId}
```

### 9. Sales Records Table

**Table Name**: `PigFarm-SalesRecords`
**Primary Key**: `PK`, `SK`

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

### 10. Stage History Table

**Table Name**: `PigFarm-StageHistory`
**Primary Key**: `PK`, `SK`

```
PK: PIG#{pigId}
SK: STAGE#{stageNumber}#{stage}

Attributes:
- pigId (String)
- stage (String) - Stage name
- stageNumber (Number) - Sequential stage number
- inDate (String) - Entry date to stage
- outDate (String) - Exit date from stage
- daysInStage (Number) - Total days in stage
- stageSpecificData (Map) - Stage-specific information
- createdAt (String)
- GSI1PK (String) - STAGE#{stage}
- GSI1SK (String) - DATE#{inDate}#{pigId}
```

## Global Secondary Indexes (GSI)

### GSI1: Status-Stage Index

**Index Name**: `StatusStageIndex`

- **PK**: GSI1PK
- **SK**: GSI1SK
- **Purpose**: Query by status and stage combinations

### GSI2: Stage-Date Index

**Index Name**: `StageDateIndex`

- **PK**: GSI2PK
- **SK**: GSI2SK
- **Purpose**: Query by stage and date ranges

### GSI3: Weight-Based Index

**Index Name**: `WeightIndex`

- **PK**: GSI2PK (for fattening records)
- **SK**: GSI2SK
- **Purpose**: Query by weight ranges in fattening stage

## Complete Query Documentation by Page

### 1. Dashboard Page

#### Get Pig Details by ID

```javascript
// Query: Get pig profile
const params = {
  TableName: "PigFarm-Pigs",
  Key: {
    PK: `PIG#${pigId}`,
    SK: "PROFILE",
  },
};

// Query: Get pig stage history
const historyParams = {
  TableName: "PigFarm-StageHistory",
  KeyConditionExpression: "PK = :pk",
  ExpressionAttributeValues: {
    ":pk": `PIG#${pigId}`,
  },
  ScanIndexForward: true,
};

// Query: Get pig medical records
const medicalParams = {
  TableName: "PigFarm-MedicalRecords",
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
  TableName: "PigFarm-BreedingRecords",
  IndexName: "StatusStageIndex",
  KeyConditionExpression: "GSI2PK = :status",
  ExpressionAttributeValues: {
    ":status": "STATUS#active",
  },
};
```

#### Get Breeding History (Month-wise)

```javascript
// Query: Get completed breeding records for specific month
const params = {
  TableName: "PigFarm-BreedingRecords",
  IndexName: "StatusStageIndex",
  KeyConditionExpression: "GSI2PK = :status AND begins_with(GSI2SK, :month)",
  ExpressionAttributeValues: {
    ":status": "STATUS#completed",
    ":month": `DATE#${year}-${month.padStart(2, "0")}`,
  },
};
```

#### Add New Breeding Record

```javascript
// Mutation: Create new breeding record
const params = {
  TableName: "PigFarm-BreedingRecords",
  Item: {
    PK: `BREEDING#${breedingId}`,
    SK: "RECORD",
    breedingId,
    sowId,
    boarId,
    matingDate: today,
    inDate: today,
    outDate: null,
    status: "active",
    // ... other attributes
    GSI1PK: `SOW#${sowId}`,
    GSI1SK: `BREEDING#${today}`,
    GSI2PK: "STATUS#active",
    GSI2SK: `DATE#${today}`,
  },
};
```

#### Move to Gestation

```javascript
// Transaction: Update breeding record and create gestation record
const transactParams = {
  TransactItems: [
    {
      Update: {
        TableName: "PigFarm-BreedingRecords",
        Key: { PK: `BREEDING#${breedingId}`, SK: "RECORD" },
        UpdateExpression:
          "SET outDate = :outDate, #status = :status, GSI2PK = :newStatus",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":outDate": today,
          ":status": "completed",
          ":newStatus": "STATUS#completed",
        },
      },
    },
    {
      Put: {
        TableName: "PigFarm-GestationRecords",
        Item: {
          PK: `GESTATION#${gestationId}`,
          SK: "RECORD",
          gestationId,
          pigId: sowId,
          breedingRecordId: breedingId,
          inDate: today,
          expectedExitDate: expectedDate,
          status: "active",
          // ... other attributes
        },
      },
    },
    {
      Update: {
        TableName: "PigFarm-Pigs",
        Key: { PK: `PIG#${sowId}`, SK: "PROFILE" },
        UpdateExpression: "SET currentStage = :stage",
        ExpressionAttributeValues: { ":stage": "gestation" },
      },
    },
  ],
};
```

### 3. Gestation Stage Page

#### Get Current Gestation Records

```javascript
// Query: Get all active gestation records
const params = {
  TableName: "PigFarm-GestationRecords",
  IndexName: "StatusStageIndex",
  KeyConditionExpression: "GSI1PK = :status",
  ExpressionAttributeValues: {
    ":status": "STATUS#active",
  },
};
```

#### Get Gestation History (Month-wise)

```javascript
// Query: Get completed gestation records for specific month
const params = {
  TableName: "PigFarm-GestationRecords",
  FilterExpression: "#status = :status AND begins_with(outDate, :month)",
  ExpressionAttributeNames: { "#status": "status" },
  ExpressionAttributeValues: {
    ":status": "completed",
    ":month": `${year}-${month.padStart(2, "0")}`,
  },
};
```

### 4. Farrowing Stage Page

#### Get Current Farrowing Records

```javascript
// Query: Get all active farrowing records
const params = {
  TableName: "PigFarm-FarrowingRecords",
  IndexName: "StatusStageIndex",
  KeyConditionExpression: "GSI1PK = :status",
  ExpressionAttributeValues: {
    ":status": "STATUS#active",
  },
};
```

#### Update Farrowing Details

```javascript
// Mutation: Update farrowing record details
const params = {
  TableName: "PigFarm-FarrowingRecords",
  Key: { PK: `FARROWING#${farrowingId}`, SK: "RECORD" },
  UpdateExpression:
    "SET farrowingDate = :fDate, stillBorn = :still, mummyBorn = :mummy, liveBorn = :live, atw = :atw, remarks = :remarks",
  ExpressionAttributeValues: {
    ":fDate": farrowingDate,
    ":still": stillBorn,
    ":mummy": mummyBorn,
    ":live": liveBorn,
    ":atw": stillBorn + mummyBorn + liveBorn,
    ":remarks": remarks,
  },
};
```

### 5. Nursery Stage Page

#### Get Current Nursery Records with Piglets

```javascript
// Query: Get all active nursery records
const nurseryParams = {
  TableName: "PigFarm-NurseryRecords",
  IndexName: "StatusStageIndex",
  KeyConditionExpression: "GSI1PK = :status",
  ExpressionAttributeValues: {
    ":status": "STATUS#active",
  },
};

// Query: Get piglets for each litter
const pigletParams = {
  TableName: "PigFarm-PigletRecords",
  KeyConditionExpression: "PK = :pk",
  ExpressionAttributeValues: {
    ":pk": `LITTER#${litterId}`,
  },
};
```

#### Update Piglet Details

```javascript
// Mutation: Update individual piglet
const params = {
  TableName: "PigFarm-PigletRecords",
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
        TableName: "PigFarm-PigletRecords",
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
        TableName: "PigFarm-FatteningRecords",
        Item: {
          PK: `FATTENING#${fatteningId}`,
          SK: "RECORD",
          fatteningId,
          pigId: pigletId,
          fatherPigId: boarId,
          motherPigId: sowId,
          breed,
          sex,
          weight,
          inDate: today,
          status: "active",
          // ... other attributes
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
  TableName: "PigFarm-FatteningRecords",
  IndexName: "StatusStageIndex",
  KeyConditionExpression: "GSI1PK = :status",
  ExpressionAttributeValues: {
    ":status": "STATUS#active",
  },
};
```

#### Filter by Weight Range

```javascript
// Query: Get fattening records within weight range
const params = {
  TableName: "PigFarm-FatteningRecords",
  IndexName: "StatusStageIndex",
  KeyConditionExpression: "GSI1PK = :status",
  FilterExpression: "weight BETWEEN :minWeight AND :maxWeight",
  ExpressionAttributeValues: {
    ":status": "STATUS#active",
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
        TableName: "PigFarm-FatteningRecords",
        Key: { PK: `FATTENING#${fatteningId}`, SK: "RECORD" },
        UpdateExpression:
          "SET outDate = :outDate, #status = :status, outcome = :outcome",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":outDate": today,
          ":status": "completed",
          ":outcome": "inhouse",
        },
      },
    },
    {
      Update: {
        TableName: "PigFarm-Pigs",
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
      TableName: "PigFarm-SalesRecords",
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

// Add pig status updates
pigIds.forEach((pigId) => {
  transactItems.push({
    Update: {
      TableName: "PigFarm-Pigs",
      Key: { PK: `PIG#${pigId}`, SK: "PROFILE" },
      UpdateExpression: "SET currentStage = :stage, soldDate = :soldDate",
      ExpressionAttributeValues: {
        ":stage": "sold",
        ":soldDate": today,
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
  TableName: "PigFarm-MedicalRecords",
  IndexName: "VaccinationDueIndex",
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
  TableName: "PigFarm-GestationRecords",
  IndexName: "ExpectedDateIndex",
  KeyConditionExpression: "GSI2PK = :expected AND begins_with(GSI2SK, :month)",
  ExpressionAttributeValues: {
    ":expected": `EXPECTED#${year}-${month.padStart(2, "0")}`,
    ":month": "PIG#",
  },
};
```

#### Population Report by Stage

```javascript
// Query: Get pigs by current stage
const params = {
  TableName: "PigFarm-Pigs",
  IndexName: "StatusStageIndex",
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
  TableName: "PigFarm-SalesRecords",
  IndexName: "SalesDateIndex",
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
  TableName: "PigFarm-Pigs",
  IndexName: "StatusStageIndex",
  KeyConditionExpression: "GSI2PK = :stage",
  FilterExpression: "begins_with(createdAt, :month)",
  ExpressionAttributeValues: {
    ":stage": "STAGE#inhouse",
    ":month": `${year}-${month.padStart(2, "0")}`,
  },
};
```

## Performance Optimization Strategies

### 1. Read Optimization

- Use eventually consistent reads for non-critical data
- Implement caching layer with ElastiCache for frequently accessed data
- Batch operations for bulk queries
- Use parallel queries for independent data fetching

### 2. Write Optimization

- Use batch writes for related records
- Implement write sharding for high-volume operations
- Use DynamoDB Streams for real-time processing
- Transaction batching for related updates

### 3. Cost Optimization

- Use on-demand billing for variable workloads
- Implement TTL for temporary records
- Archive old records to S3 for long-term storage
- Monitor and optimize GSI usage

## Capacity Planning & Cost Estimates

### Storage Requirements (1000 Pigs)

- Pigs Table: ~1MB (1KB per pig)
- Medical Records: ~10MB (100 records per pig, 100 bytes each)
- Breeding Records: ~500KB (500 breeding events, 1KB each)
- Gestation Records: ~300KB (300 gestation records, 1KB each)
- Farrowing Records: ~200KB (200 farrowing events, 1KB each)
- Nursery Records: ~1MB (200 litters with piglet details)
- Fattening Records: ~500KB (500 fattening records, 1KB each)
- Sales Records: ~200KB (200 sales transactions, 1KB each)
- Stage History: ~2MB (20 stage transitions per pig, 100 bytes each)

**Total Storage**: ~16MB

### Monthly Operations (1000 Pigs)

- **Read Operations**: 150,000 (daily monitoring, reports, searches)
- **Write Operations**: 15,000 (updates, new records, stage transitions)

### Monthly Cost Estimate (Mumbai Region)

- **Storage**: $0.25 per GB = $0.004
- **Read Operations**: $0.25 per million = $0.0375
- **Write Operations**: $1.25 per million = $0.01875
- **GSI Storage & Operations**: $0.03

**Total Monthly DynamoDB Cost**: ~$0.09 USD (~₹7.5)

This architecture provides a comprehensive, scalable, and cost-effective solution for managing a pig farm with detailed query specifications for every feature across all pages of the application.
