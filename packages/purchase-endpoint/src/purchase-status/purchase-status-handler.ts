import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { returnLambdaError } from "@sales/shared/src/returnLambdaError";
import { PurchasesHistoryRepository } from "../domain/purchases-history-table";
import {
  AvailableTables,
  getDynamoTableName,
} from "@sales/cdk/src/AvailableDependencies";

type StatusResponse = {
  finished: boolean;
  isSuccess?: boolean;
};
export const handler: APIGatewayProxyHandlerV2<StatusResponse> = async (
  event
) => {
  console.log(
    "GOZDECKI process.env.PURCHASES_HISTORY",
    getDynamoTableName(AvailableTables.PURCHASES_HISTORY)
  );
  const repository = new PurchasesHistoryRepository(
    getDynamoTableName(AvailableTables.PURCHASES_HISTORY)
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
