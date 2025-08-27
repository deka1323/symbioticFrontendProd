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

// Helper function to get next stage number for a pig
const getNextStageNumber = async (pigId) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `PIG#${pigId}`,
      ":sk": "STAGE#",
    },
    ScanIndexForward: false,
    Limit: 1,
  });

  const response = await docClient.send(command);
  if (response.Items && response.Items.length > 0) {
    return response.Items[0].stageNumber + 1;
  }
  return 1;
};

// Validate pig exists and get details
const validateAndGetPigDetails = async (pigId) => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `PIG#${pigId}`,
      SK: "PROFILE",
    },
  });

  const response = await docClient.send(command);
  return response.Item || null;
};

// Get all active gestation records with pagination
export const getAllActiveGestationRecordsHandler = async (event) => {
  try {
    const { lastEvaluatedKey, limit = 50 } = event.queryStringParameters || {};

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: {
        ":pk": "STAGE#gestation#active",
      },
      FilterExpression: "stageName = :stageName AND #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":pk": "STAGE#gestation#active",
        ":stageName": "gestation",
        ":status": "active",
      },
      Limit: parseInt(limit),
      ExclusiveStartKey: lastEvaluatedKey
        ? JSON.parse(decodeURIComponent(lastEvaluatedKey))
        : undefined,
    });

    const response = await docClient.send(command);

    // Enrich data with pig profile information
    const enrichedItems = await Promise.all(
      (response.Items || []).map(async (item) => {
        try {
          const pigProfile = await validateAndGetPigDetails(item.pigId);
          return {
            ...item,
            breed: pigProfile?.breed || "Unknown",
            weight: pigProfile?.weight || 0,
            sex: pigProfile?.sex || "unknown",
          };
        } catch (error) {
          console.error(`Error fetching pig profile for ${item.pigId}:`, error);
          return item;
        }
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        data: enrichedItems,
        lastEvaluatedKey: response.LastEvaluatedKey
          ? encodeURIComponent(JSON.stringify(response.LastEvaluatedKey))
          : null,
        hasMore: !!response.LastEvaluatedKey,
      }),
    };
  } catch (error) {
    console.error("Error fetching active gestation records:", error);
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

// Get gestation history by month with pagination
export const getGestationHistoryByMonthHandler = async (event) => {
  try {
    const { year, month } = event.pathParameters;
    const { lastEvaluatedKey, limit = 50 } = event.queryStringParameters || {};
    const monthStr = `${year}-${month.padStart(2, "0")}`;

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI2",
      KeyConditionExpression: "GSI2PK = :pk AND begins_with(GSI2SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": "STAGE#gestation",
        ":sk": `STATUS#completed#${monthStr}`,
      },
      FilterExpression: "stageName = :stageName AND #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":pk": "STAGE#gestation",
        ":sk": `STATUS#completed#${monthStr}`,
        ":stageName": "gestation",
        ":status": "completed",
      },
      Limit: parseInt(limit),
      ExclusiveStartKey: lastEvaluatedKey
        ? JSON.parse(decodeURIComponent(lastEvaluatedKey))
        : undefined,
    });

    const response = await docClient.send(command);

    // Enrich data with pig profile information
    const enrichedItems = await Promise.all(
      (response.Items || []).map(async (item) => {
        try {
          const pigProfile = await validateAndGetPigDetails(item.pigId);
          return {
            ...item,
            breed: pigProfile?.breed || "Unknown",
            finalWeight: pigProfile?.weight || 0,
            totalDays:
              item.outDate && item.inDate
                ? Math.ceil(
                    (new Date(item.outDate) - new Date(item.inDate)) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0,
            outcome: item.pregnancyFailed
              ? "Moved to fattening (pregnancy failed)"
              : "Moved to farrowing",
          };
        } catch (error) {
          console.error(`Error fetching pig profile for ${item.pigId}:`, error);
          return item;
        }
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      },
      body: JSON.stringify({
        success: true,
        data: enrichedItems,
        lastEvaluatedKey: response.LastEvaluatedKey
          ? encodeURIComponent(JSON.stringify(response.LastEvaluatedKey))
          : null,
        hasMore: !!response.LastEvaluatedKey,
        month: monthStr,
      }),
    };
  } catch (error) {
    console.error("Error fetching gestation history:", error);
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

// Send gestation pig to farrowing stage
export const sendToFarrowingHandler = async (event) => {
  try {
    const { gestationId } = event.pathParameters;
    const body = JSON.parse(event.body || "{}");
    const { stageNumber } = body;

    if (!gestationId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Gestation ID is required",
        }),
      };
    }

    // Get the current gestation stage record
    const getGestationCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      FilterExpression:
        "recordId = :recordId AND stageName = :stageName AND #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":pk": `PIG#${gestationId}`,
        ":sk": "STAGE#",
        ":recordId": gestationId,
        ":stageName": "gestation",
        ":status": "active",
      },
      Limit: 1,
    });

    const gestationResponse = await docClient.send(getGestationCommand);

    if (!gestationResponse.Items || gestationResponse.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Active gestation record not found",
        }),
      };
    }

    const gestationRecord = gestationResponse.Items[0];
    const pigId = gestationRecord.pigId;
    const currentDate = getCurrentDate();
    const farrowingId = generateId("FR");
    const farrowingStageNumber = await getNextStageNumber(pigId);

    // Create farrowing stage record
    const farrowingRecord = {
      PK: `PIG#${pigId}`,
      SK: `STAGE#${farrowingStageNumber}#farrowing#${farrowingId}`,
      pigId: pigId,
      stageName: "farrowing",
      stageNumber: farrowingStageNumber,
      recordId: farrowingId,
      inDate: currentDate, // Farrowing in date = gestation out date
      outDate: null,
      status: "active",
      pregnancyFailed: false,
      stageSpecificData: {
        gestationRecordId: gestationRecord.recordId,
        expectedFarrowingDate:
          gestationRecord.stageSpecificData?.expectedExitDate || currentDate,
        breedingRecordId: gestationRecord.stageSpecificData?.breedingRecordId,
        farrowingDate: null,
        stillBorn: 0,
        mummyBorn: 0,
        liveBorn: 0,
        deathDuringFarrowing: 0,
        atw: 0,
        totalBorn: 0,
        weaningCount: 0,
        remarks: "",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      GSI1PK: "STAGE#farrowing#active",
      GSI1SK: `DATE#${currentDate}#${pigId}`,
    };

    // Transaction to update gestation and create farrowing
    const transactCommand = new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: TABLE_NAME,
            Key: {
              PK: gestationRecord.PK,
              SK: gestationRecord.SK,
            },
            UpdateExpression:
              "SET outDate = :outDate, #status = :status, GSI1PK = :newGSI1PK, GSI2SK = :newGSI2SK, updatedAt = :updated",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
              ":outDate": currentDate,
              ":status": "completed",
              ":newGSI1PK": "STAGE#gestation#completed",
              ":newGSI2SK": `STATUS#completed#${currentDate}#${gestationRecord.recordId}`,
              ":updated": new Date().toISOString(),
            },
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: farrowingRecord,
          },
        },
        {
          Update: {
            TableName: TABLE_NAME,
            Key: { PK: `PIG#${pigId}`, SK: "PROFILE" },
            UpdateExpression: "SET currentStage = :stage, updatedAt = :updated",
            ExpressionAttributeValues: {
              ":stage": "farrowing",
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
          gestationId,
          farrowingRecord,
          targetStage: "farrowing",
        },
        message: "Successfully moved to farrowing stage",
      }),
    };
  } catch (error) {
    console.error("Error moving to farrowing:", error);
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

// Send gestation pig to fattening stage (pregnancy failed)
export const sendToFatteningHandler = async (event) => {
  try {
    const { gestationId } = event.pathParameters;
    const body = JSON.parse(event.body || "{}");
    const { stageNumber } = body;

    if (!gestationId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Gestation ID is required",
        }),
      };
    }

    // Get the current gestation stage record
    const getGestationCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      FilterExpression:
        "recordId = :recordId AND stageName = :stageName AND #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":pk": `PIG#${gestationId}`,
        ":sk": "STAGE#",
        ":recordId": gestationId,
        ":stageName": "gestation",
        ":status": "active",
      },
      Limit: 1,
    });

    const gestationResponse = await docClient.send(getGestationCommand);

    if (!gestationResponse.Items || gestationResponse.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: JSON.stringify({
          success: false,
          message: "Active gestation record not found",
        }),
      };
    }

    const gestationRecord = gestationResponse.Items[0];
    const pigId = gestationRecord.pigId;
    const currentDate = getCurrentDate();
    const fatteningId = generateId("FT");
    const fatteningStageNumber = await getNextStageNumber(pigId);

    // Create fattening stage record
    const fatteningRecord = {
      PK: `PIG#${pigId}`,
      SK: `STAGE#${fatteningStageNumber}#fattening#${fatteningId}`,
      pigId: pigId,
      stageName: "fattening",
      stageNumber: fatteningStageNumber,
      recordId: fatteningId,
      inDate: currentDate, // Fattening in date = gestation out date
      outDate: null,
      status: "active",
      pregnancyFailed: true, // Mark as pregnancy failed
      stageSpecificData: {
        gestationRecordId: gestationRecord.recordId,
        breedingRecordId: gestationRecord.stageSpecificData?.breedingRecordId,
        previousStage: "gestation",
        pregnancyFailedDate: currentDate,
        reason: "pregnancy_failed",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      GSI1PK: "STAGE#fattening#active",
      GSI1SK: `DATE#${currentDate}#${pigId}`,
    };

    // Transaction to update gestation and create fattening
    const transactCommand = new TransactWriteCommand({
      TransactItems: [
        {
          Update: {
            TableName: TABLE_NAME,
            Key: {
              PK: gestationRecord.PK,
              SK: gestationRecord.SK,
            },
            UpdateExpression:
              "SET outDate = :outDate, #status = :status, pregnancyFailed = :failed, GSI1PK = :newGSI1PK, GSI2SK = :newGSI2SK, updatedAt = :updated",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
              ":outDate": currentDate,
              ":status": "completed",
              ":failed": true,
              ":newGSI1PK": "STAGE#gestation#completed",
              ":newGSI2SK": `STATUS#completed#${currentDate}#${gestationRecord.recordId}`,
              ":updated": new Date().toISOString(),
            },
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: fatteningRecord,
          },
        },
        {
          Update: {
            TableName: TABLE_NAME,
            Key: { PK: `PIG#${pigId}`, SK: "PROFILE" },
            UpdateExpression:
              "SET currentStage = :stage, pregnancyFailed = :failed, updatedAt = :updated",
            ExpressionAttributeValues: {
              ":stage": "fattening",
              ":failed": true,
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
          gestationId,
          fatteningRecord,
          targetStage: "fattening",
          pregnancyFailed: true,
        },
        message: "Successfully moved to fattening stage (pregnancy failed)",
      }),
    };
  } catch (error) {
    console.error("Error moving to fattening:", error);
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
