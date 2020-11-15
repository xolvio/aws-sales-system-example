import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { heavyAndFlakyProcessing } from "./heavy-and-flaky-processing";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const {
    queryStringParameters: { userId },
  } = event;

  try {
    const res = await heavyAndFlakyProcessing(userId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: res }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: e.message }),
    };
  }
};
