# Pig Farm Management System - Database Architecture

## Overview
This document outlines the complete database architecture for the Pig Farm Management System using AWS DynamoDB as the primary database with supporting AWS services.

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
- currentStage (String) - "breeding" | "gestation" | "farrowing" | "nursery" | "fattening" | "sold"
- origin (String) - "in-house" | "purchased" (for boars)
- isBoar (Boolean) - True if designated as breeding boar
- pregnancyCount (Number) - For sows only
- createdAt (String) - ISO timestamp
- updatedAt (String) - ISO timestamp
- GSI1PK (String) - For secondary access patterns
- GSI1SK (String) - For secondary access patterns
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
- matingDate (String) - ISO date
- sowBreed (String)
- boarBreed (String)
- sowAge (Number) - Age in months
- boarAge (Number) - Age in months
- status (String) - "active" | "completed" | "failed"
- expectedDeliveryDate (String) - matingDate + 114 days
- notes (String)
- createdAt (String)
- updatedAt (String)
- GSI1PK (String) - SOW#{sowId} for sow-based queries
- GSI1SK (String) - BREEDING#{matingDate}
- GSI2PK (String) - BOAR#{boarId} for boar-based queries
- GSI2SK (String) - BREEDING#{matingDate}
```

### 4. Stage Management Table
**Table Name**: `PigFarm-StageRecords`
**Primary Key**: `PK`, `SK`

```
PK: STAGE#{stage}#{pigId}
SK: RECORD#{entryDate}

Attributes:
- pigId (String)
- stage (String) - "breeding" | "gestation" | "farrowing" | "nursery" | "fattening"
- entryDate (String) - ISO date
- exitDate (String) - ISO date (null if current)
- expectedExitDate (String) - Calculated based on stage
- stageSpecificData (Map) - Stage-specific attributes
- status (String) - "active" | "completed"
- notes (String)
- createdAt (String)
- updatedAt (String)
- GSI1PK (String) - STAGE#{stage} for stage-based queries
- GSI1SK (String) - STATUS#{status}#{entryDate}
```

### 5. Farrowing Records Table
**Table Name**: `PigFarm-FarrowingRecords`
**Primary Key**: `PK`, `SK`

```
PK: FARROWING#{sowId}
SK: PREGNANCY#{pregnancyNumber}

Attributes:
- sowId (String)
- pregnancyNumber (Number)
- breedingRecordId (String) - Reference to breeding record
- farrowingDate (String) - ISO date
- totalBorn (Number)
- totalLive (Number)
- totalDead (Number)
- pigletIds (List) - Array of piglet IDs
- complications (String) - Any delivery issues
- notes (String)
- createdAt (String)
- GSI1PK (String) - FARROWING#{farrowingDate} for date-based queries
- GSI1SK (String) - SOW#{sowId}
```

### 6. Weight Tracking Table
**Table Name**: `PigFarm-WeightRecords`
**Primary Key**: `PK`, `SK`

```
PK: PIG#{pigId}
SK: WEIGHT#{date}#{timestamp}

Attributes:
- pigId (String)
- weight (Number) - Weight in kg
- date (String) - ISO date
- stage (String) - Current stage when weighed
- measuredBy (String) - Staff member
- notes (String)
- createdAt (String)
- GSI1PK (String) - WEIGHT#{date} for date-based queries
- GSI1SK (String) - PIG#{pigId}
```

## Global Secondary Indexes (GSI)

### GSI1: Stage-Based Queries
**Index Name**: `StageStatusIndex`
- **PK**: GSI1PK
- **SK**: GSI1SK
- **Purpose**: Query pigs by stage and status

### GSI2: Date-Based Queries
**Index Name**: `DateBasedIndex`
- **PK**: GSI2PK
- **SK**: GSI2SK
- **Purpose**: Query records by date ranges

### GSI3: Status-Based Queries
**Index Name**: `StatusIndex`
- **PK**: GSI3PK
- **SK**: GSI3SK
- **Purpose**: Query by pig status (living/dead)

## Access Patterns & Queries

### 1. Pig Management Queries
```
# Get pig profile
PK = PIG#{pigId}, SK = PROFILE

# Get all pigs by status
GSI3: GSI3PK = STATUS#{living|dead}

# Get pigs by current stage
GSI1: GSI1PK = STAGE#{stage}, GSI1SK begins_with STATUS#active
```

### 2. Medical Record Queries
```
# Get all medical records for a pig
PK = PIG#{pigId}, SK begins_with MEDICAL#

# Get vaccination records
PK = PIG#{pigId}, SK begins_with MEDICAL#vaccination

# Get upcoming vaccinations (requires scan with filter)
Scan with FilterExpression on nextDueDate
```

### 3. Breeding Queries
```
# Get breeding record
PK = BREEDING#{breedingId}

# Get breeding history for sow
GSI1: GSI1PK = SOW#{sowId}

# Get breeding history for boar
GSI2: GSI2PK = BOAR#{boarId}

# Get active breeding records
Scan with FilterExpression: status = "active"
```

### 4. Stage Management Queries
```
# Get current pigs in a stage
GSI1: GSI1PK = STAGE#{stage}, GSI1SK begins_with STATUS#active

# Get stage history
PK = STAGE#{stage}#{pigId}

# Get pigs entering/exiting on specific dates
GSI2: GSI2PK = STAGE#{stage}, GSI2SK = DATE#{date}
```

### 5. Reporting Queries
```
# Monthly vaccination report
Scan WeightRecords with date range filter

# Expected deliveries
Query BreedingRecords with expectedDeliveryDate filter

# Population reports
Aggregate queries on Pigs table with status filters

# Stage distribution
Aggregate queries using GSI1 on StageRecords
```

## Data Consistency Patterns

### 1. Pig Profile Updates
- Update main pig record
- Update related stage records
- Update breeding records if applicable

### 2. Stage Transitions
- Close current stage record (set exitDate)
- Create new stage record
- Update pig's currentStage

### 3. Breeding to Gestation
- Update breeding record status
- Create gestation stage record
- Update sow's stage

## Backup and Recovery Strategy

### 1. Point-in-Time Recovery
- Enable PITR on all tables
- 35-day retention period

### 2. Cross-Region Backup
- Daily snapshots to S3
- Cross-region replication for disaster recovery

### 3. Data Export
- Weekly full export to S3 for analytics
- Parquet format for cost-effective storage

## Performance Optimization

### 1. Read Optimization
- Use eventually consistent reads where possible
- Implement caching layer with ElastiCache
- Batch operations for bulk queries

### 2. Write Optimization
- Use batch writes for related records
- Implement write sharding for high-volume operations
- Use DynamoDB Streams for real-time processing

### 3. Cost Optimization
- Use on-demand billing for variable workloads
- Implement TTL for temporary records
- Archive old records to S3

## Capacity Planning (1000 Pigs)

### Estimated Storage Requirements
- Pigs Table: ~500KB (500 bytes per pig)
- Medical Records: ~5MB (50 records per pig, 100 bytes each)
- Breeding Records: ~200KB (200 breeding events, 1KB each)
- Stage Records: ~2MB (20 stage transitions per pig, 100 bytes each)
- Farrowing Records: ~100KB (100 farrowing events, 1KB each)
- Weight Records: ~10MB (100 weight records per pig, 100 bytes each)

**Total Storage**: ~18MB

### Estimated Monthly Operations (1000 Pigs)
- **Read Operations**: 100,000 (daily monitoring, reports)
- **Write Operations**: 10,000 (updates, new records)

### Monthly Cost Estimate (Mumbai Region)
- **Storage**: $0.25 per GB = $0.01
- **Read Operations**: $0.25 per million = $0.025
- **Write Operations**: $1.25 per million = $0.0125
- **GSI Storage & Operations**: $0.02

**Total Monthly DynamoDB Cost**: ~$0.07 USD (~₹6)

## Security Considerations

### 1. Access Control
- IAM roles for different user types
- Fine-grained permissions per table
- API Gateway with authentication

### 2. Data Encryption
- Encryption at rest enabled
- Encryption in transit (HTTPS)
- KMS key management

### 3. Audit Trail
- CloudTrail for API calls
- DynamoDB Streams for data changes
- Application-level logging

## Migration Strategy

### 1. Initial Data Load
- Bulk import existing pig data
- Validate data integrity
- Gradual cutover from legacy system

### 2. Zero-Downtime Migration
- Dual-write pattern during transition
- Data synchronization validation
- Rollback procedures

This architecture provides a robust, scalable foundation for your pig farm management system with optimized query patterns and cost-effective storage for 1000+ pigs.