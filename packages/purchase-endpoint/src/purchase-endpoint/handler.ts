import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { returnLambdaError } from "@sales/shared/src/returnLambdaError";
import { generateId } from "@sales/shared/src/generateId";
import { lambdaInvokeAsync } from "@sales/shared/src/lambdaInvokeAsync";
import type { PurchaseEvent } from "../purchase-action/purchase-action-handler";

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
      process.env.PURCHASE_ACTION_LAMBDA,
      purchaseActionLambdaPayload
    );
    return { purchaseUrl: `${process.env.STATUS_URL}/${purchaseId}` };
  } catch (e) {
    return returnLambdaError(e.message);
  }
};
