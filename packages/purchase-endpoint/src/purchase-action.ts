import { generateId } from "@sales/shared/src/generateId";
import { PurchaseEntity } from "./domain/PurchaseEntity";
import { PurchasesHistoryRepository } from "./domain/purchases-history-table";
import { paymentCall } from "./domain/payment-call";

export const purchaseAction = async (
  userId: string,
  repository: PurchasesHistoryRepository
) => {
  const purchaseId = generateId();
  try {
    await paymentCall(userId);
    const purchase = new PurchaseEntity(userId, true, purchaseId);
    await repository.save(purchase);
    return { purchaseId };
  } catch (e) {
    const purchase = new PurchaseEntity(userId, false, purchaseId);
    await repository.save(purchase);
    throw new Error(e.message);
  }
};
