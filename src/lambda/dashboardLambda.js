import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const getPigDetailsByPigIdHandler = async (event) => {
  try {
    const pigId = event?.pathParameters?.pigId;

    if (!pigId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing pigId" }),
        event: event,
      };
    }

    const command = new GetCommand({
      TableName: "SymbioticPigFarmTable",
      Key: {
        Entity: `PIG#${pigId}`,
        Type: "PROFILE",
      },
    });

    const response = await docClient.send(command);
    if (!response.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No pig available on this ID" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response.Item),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

export const getPigMedicalHistoryByPigIdHandler = async (event) => {
  try {
    const pigId = event?.pathParameters?.pigId;

    if (!pigId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing pigId" }),
      };
    }

    const command = new QueryCommand({
      TableName: "SymbioticPigFarmTable",
      KeyConditionExpression: "Entity = :pk AND begins_with(#type, :sk)",
      ExpressionAttributeNames: {
        "#type": "Type", // aliasing the reserved keyword
      },
      ExpressionAttributeValues: {
        ":pk": `PIG#${pigId}`,
        ":sk": "MEDICAL#",
      },
    });

    const response = await docClient.send(command);

    if (!response.Items || response.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "No medical records found for this pigId",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response.Items),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error }),
    };
  }
};

export const getPigStageHistoryByPigIdHandler = async (event) => {
  try {
    const pigId = event?.pathParameters?.pigid;

    if (!pigId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing pigId", event: event }),
      };
    }

    const command = new QueryCommand({
      TableName: "SymbioticPigFarmTable",
      KeyConditionExpression: "Entity = :pk AND begins_with(#type, :sk)",
      ExpressionAttributeNames: {
        "#type": "Type",
      },
      ExpressionAttributeValues: {
        ":pk": `PIG#${pigId}`,
        ":sk": "STAGE#",
      },
    });

    const response = await docClient.send(command);

    if (!response.Items || response.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "No medical records found for this pigId",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response.Items),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error }),
    };
  }
};
