import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { purchaseAction } from "./purchase-action";
import { PurchasesHistoryRepository } from "./domain/purchases-history-table";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const { queryStringParameters } = event;
  console.log("queryStringParameters.userId", queryStringParameters.userId);
  try {
    const res = await purchaseAction(
      queryStringParameters.userId,
      new PurchasesHistoryRepository(process.env.PURCHASES_HISTORY)
    );
    return { statusCode: 200, body: JSON.stringify(res) };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: e?.message }),
    };
  }
};
