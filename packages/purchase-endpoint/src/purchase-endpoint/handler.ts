import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { returnLambdaError } from "@sales/shared/src/returnLambdaError";
import { generateId } from "@sales/shared/src/generateId";
import { lambdaInvokeAsync } from "@sales/shared/src/lambdaInvokeAsync";
import type { PurchaseEvent } from "../purchase-action/purchase-action-handler";
import {
  AvailableLambdas,
  getLambdaFunctionName,
  getLambdaUrl,
} from "../../../cdk/src/AvailableDependencies";

type PurchaseResponse = {
  purchaseUrl: string;
};
export const handler: APIGatewayProxyHandlerV2<PurchaseResponse> = async (
  event
) => {
  const purchaseId = generateId();

  const purchaseActionLambdaPayload: PurchaseEvent = {
    purchaseId,
    userId: event.queryStringParameters.userId,
  };

  try {
    await lambdaInvokeAsync(
      getLambdaFunctionName(AvailableLambdas.PURCHASE_ACTION),
      purchaseActionLambdaPayload
    );
    return {
      purchaseUrl: `${getLambdaUrl(
        AvailableLambdas.STATUS
      )}?purchaseId=${purchaseId}`,
    };
  } catch (e) {
    return returnLambdaError(e.message);
  }
};
