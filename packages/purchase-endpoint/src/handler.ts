import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { returnLambdaError } from "@sales/shared/src/returnLambdaError";
import { purchaseAction } from "./purchase-action";
import { PurchasesHistoryRepository } from "./domain/purchases-history-table";

type PurchaseResponse = {
  purchaseId: string;
};
export const handler: APIGatewayProxyHandlerV2<PurchaseResponse> = async (
  event
) => {
  try {
    return await purchaseAction(
      event.queryStringParameters.userId,
      new PurchasesHistoryRepository(process.env.PURCHASES_HISTORY)
    );
  } catch (e) {
    return returnLambdaError(e.message);
  }
};
