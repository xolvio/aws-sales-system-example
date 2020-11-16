import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { returnLambdaError } from "@sales/shared/src/returnLambdaError";
import { purchaseAction } from "./purchase-action";
import { PurchasesHistoryRepository } from "./domain/purchases-history-table";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    return await purchaseAction(
      event.queryStringParameters.userId,
      new PurchasesHistoryRepository(process.env.PURCHASES_HISTORY)
    );
  } catch (e) {
    return returnLambdaError(e.message);
  }
};
