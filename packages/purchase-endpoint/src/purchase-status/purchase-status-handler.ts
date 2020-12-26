import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { returnLambdaError } from "@sales/shared/src/returnLambdaError";
import { PurchasesHistoryRepository } from "../domain/purchases-history-table";

type StatusResponse = {
  finished: boolean;
  isSuccess?: boolean;
};
export const handler: APIGatewayProxyHandlerV2<StatusResponse> = async (
  event
) => {
  const repository = new PurchasesHistoryRepository(
    process.env.PURCHASES_HISTORY
  );
  try {
    const purchase = await repository.getById(
      event.queryStringParameters.purchaseId
    );
    if (purchase) {
      return { finished: true, isSuccess: purchase.isSuccess };
    }
    return { finished: false };
  } catch (e) {
    return returnLambdaError(e.message);
  }
};
