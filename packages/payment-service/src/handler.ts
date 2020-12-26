import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { returnLambdaError } from "@sales/shared/src/returnLambdaError";
import { heavyAndFlakyProcessing } from "./heavy-and-flaky-processing";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    return await heavyAndFlakyProcessing(event.queryStringParameters.userId);
  } catch (e) {
    return returnLambdaError(e.message);
  }
};
