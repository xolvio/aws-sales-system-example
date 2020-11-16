import { PurchaseEntity } from "./domain/PurchaseEntity";
import { PurchasesHistoryRepository } from "./domain/purchases-history-table";
import { paymentCall } from "./domain/payment-call";

export const purchaseAction = async (
  userId: string,
  repository: PurchasesHistoryRepository
) => {
  try {
    const res = await paymentCall(userId);
    const purchase = new PurchaseEntity(userId, true);
    await repository.save(purchase);
    return res;
  } catch (e) {
    const purchase = new PurchaseEntity(userId, false);
    await repository.save(purchase);
    throw new Error(e.message);
  }
};
