import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "PigFarm-Data";

// Helper function to generate unique IDs
const generateId = (prefix) => {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to get current date
const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

// Get all breeding records
export const getBreedingRecordsHandler = async (event) => {
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: {
        ":pk": "BREEDING_RECORDS",
      },
    });

    const response = await docClient.send(command);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        data: response.Items || [],
      }),
    };
  } catch (error) {
    console.error("Error fetching breeding records:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};

// Get current active breeding records
export const getCurrentBreedingRecordsHandler = async (event) => {
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk",
      ExpressionAttributeValues: {
        ":pk": "STATUS#active",
      },
      FilterExpression: "begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": "STATUS#active",
        ":sk": "BREEDING#",
      },
    });

    const response = await docClient.send(command);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        data: response.Items || [],
      }),
    };
  } catch (error) {
    console.error("Error fetching current breeding records:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};

// Get breeding history by month
export const getBreedingHistoryByMonthHandler = async (event) => {
  try {
    const { year, month } = event.pathParameters;
    const monthStr = `${year}-${month.padStart(2, "0")}`;

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk AND begins_with(GSI2SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": "STATUS#completed",
        ":sk": `DATE#${monthStr}`,
      },
      FilterExpression: "begins_with(SK, :breeding)",
      ExpressionAttributeValues: {
        ":pk": "STATUS#completed",
        ":sk": `DATE#${monthStr}`,
        ":breeding": "BREEDING#",
      },
    });

    const response = await docClient.send(command);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        data: response.Items || [],
      }),
    };
  } catch (error) {
    console.error("Error fetching breeding history:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};

// Create new breeding record
export const createBreedingRecordHandler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { sowId, boarId, sowBreed, boarBreed, sowAge, boarAge, matingDate } =
      body;

    if (!sowId || !boarId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Sow ID and Boar ID are required",
        }),
      };
    }

    const breedingId = generateId("BR");
    const currentDate = getCurrentDate();
    const actualMatingDate = matingDate || currentDate;

    const breedingRecord = {
      PK: `BREEDING#${breedingId}`,
      SK: "RECORD",
      breedingId,
      sowId,
      boarId,
      matingDate: actualMatingDate,
      inDate: currentDate,
      outDate: null,
      sowBreed: sowBreed || "Yorkshire",
      boarBreed: boarBreed || "Duroc",
      sowAge: sowAge || 18,
      boarAge: boarAge || 24,
      status: "active",
      expectedDeliveryDate: new Date(Date.now() + 114 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      GSI1PK: "BREEDING_RECORDS",
      GSI1SK: `BREEDING#${actualMatingDate}#${breedingId}`,
      GSI2PK: "STATUS#active",
      GSI2SK: `DATE#${currentDate}#${breedingId}`,
    };

    // Create pig stage record
    const stageRecord = {
      PK: `PIG#${sowId}`,
      SK: `STAGE#${Date.now()}#breeding#${breedingId}`,
      pigId: sowId,
      stageName: "breeding",
      stageNumber: 1, // This should be calculated based on pig's history
      recordId: breedingId,
      inDate: currentDate,
      outDate: null,
      status: "active",
      stageSpecificData: {
        breedingRecordId: breedingId,
        boarId,
        matingDate: actualMatingDate,
        expectedDeliveryDate: breedingRecord.expectedDeliveryDate,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      GSI1PK: "STAGE#breeding#active",
      GSI1SK: `DATE#${currentDate}#${sowId}`,
    };

    // Transaction to create both records
    const transactCommand = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: breedingRecord,
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: stageRecord,
          },
        },
        {
          Update: {
            TableName: TABLE_NAME,
            Key: { PK: `PIG#${sowId}`, SK: "PROFILE" },
            UpdateExpression: "SET currentStage = :stage, updatedAt = :updated",
            ExpressionAttributeValues: {
              ":stage": "breeding",
              ":updated": new Date().toISOString(),
            },
          },
        },
      ],
    });

    await docClient.send(transactCommand);

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        data: breedingRecord,
        message: "Breeding record created successfully",
      }),
    };
  } catch (error) {
    console.error("Error creating breeding record:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};

// Update breeding record
export const updateBreedingRecordHandler = async (event) => {
  try {
    const { breedingId } = event.pathParameters;
    const body = JSON.parse(event.body);

    if (!breedingId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Breeding ID is required",
        }),
      };
    }

    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    // Build dynamic update expression
    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined && key !== "breedingId") {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = body[key];
        expressionAttributeNames[`#${key}`] = key;
      }
    });

    // Always update the updatedAt timestamp
    updateExpression.push("#updatedAt = :updatedAt");
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();
    expressionAttributeNames["#updatedAt"] = "updatedAt";

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `BREEDING#${breedingId}`,
        SK: "RECORD",
      },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(command);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        data: response.Attributes,
        message: "Breeding record updated successfully",
      }),
    };
  } catch (error) {
    console.error("Error updating breeding record:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};

// Move breeding to gestation
export const moveBreedingToGestationHandler = async (event) => {
  try {
    const { breedingId } = event.pathParameters;

    if (!breedingId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Breeding ID is required",
        }),
      };
    }

    // Get the breeding record first
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `BREEDING#${breedingId}`,
        SK: "RECORD",
      },
    });

    const breedingResponse = await docClient.send(getCommand);

    if (!breedingResponse.Item) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Breeding record not found",
        }),
      };
    }

    const breedingRecord = breedingResponse.Item;
    const currentDate = getCurrentDate();
    const gestationId = generateId("GS");

    // Create gestation record
    const gestationRecord = {
      PK: `PIG#${breedingRecord.sowId}`,
      SK: `STAGE#${Date.now()}#gestation#${gestationId}`,
      pigId: breedingRecord.sowId,
      stageName: "gestation",
      stageNumber: 2, // This should be calculated based on pig's history
      recordId: gestationId,
      inDate: currentDate,
      outDate: null,
      status: "active",
      stageSpecificData: {
        breedingRecordId: breedingId,
        expectedExitDate: breedingRecord.expectedDeliveryDate,
        daysInStage: 0,
        breed: breedingRecord.sowBreed,
        weight: 45.5, // This should come from pig profile
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      GSI1PK: "STAGE#gestation#active",
      GSI1SK: `DATE#${currentDate}#${breedingRecord.sowId}`,
    };

    // Transaction to update breeding and create gestation
    const transactCommand = new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: TABLE_NAME,
            Key: {
              PK: `BREEDING#${breedingId}`,
              SK: "RECORD",
            },
            UpdateExpression:
              "SET outDate = :outDate, #status = :status, GSI2PK = :newStatus, GSI2SK = :newStatusDate, updatedAt = :updated",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
              ":outDate": currentDate,
              ":status": "completed",
              ":newStatus": "STATUS#completed",
              ":newStatusDate": `DATE#${currentDate}#${breedingId}`,
              ":updated": new Date().toISOString(),
            },
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: gestationRecord,
          },
        },
        {
          Update: {
            TableName: TABLE_NAME,
            Key: { PK: `PIG#${breedingRecord.sowId}`, SK: "PROFILE" },
            UpdateExpression: "SET currentStage = :stage, updatedAt = :updated",
            ExpressionAttributeValues: {
              ":stage": "gestation",
              ":updated": new Date().toISOString(),
            },
          },
        },
      ],
    });

    await docClient.send(transactCommand);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        data: {
          breedingId,
          gestationRecord,
          targetStage: "gestation",
        },
        message: "Successfully moved to gestation stage",
      }),
    };
  } catch (error) {
    console.error("Error moving to gestation:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};

// Get breeding record by ID
export const getBreedingRecordByIdHandler = async (event) => {
  try {
    const { breedingId } = event.pathParameters;

    if (!breedingId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Breeding ID is required",
        }),
      };
    }

    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `BREEDING#${breedingId}`,
        SK: "RECORD",
      },
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Breeding record not found",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        data: response.Item,
      }),
    };
  } catch (error) {
    console.error("Error fetching breeding record:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};

// Handle CORS preflight requests
export const corsHandler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    },
    body: JSON.stringify({ message: "CORS preflight" }),
  };
};
