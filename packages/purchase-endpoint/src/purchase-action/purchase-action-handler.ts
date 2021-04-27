import { Handler } from "aws-lambda";
import { PurchasesHistoryRepository } from "../domain/purchases-history-table";
import { purchaseAction } from "./purchase-action";

export type PurchaseEvent = {
  userId: string;
  purchaseId: string;
};

export const handler: Handler<PurchaseEvent> = async (event) => {
  return purchaseAction(
    event.userId,
    event.purchaseId,
    new PurchasesHistoryRepository(process.env.PURCHASES_HISTORY)
  );
};
