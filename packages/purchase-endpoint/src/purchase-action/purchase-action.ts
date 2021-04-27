import { PurchaseEntity } from "../domain/PurchaseEntity";
import { PurchasesHistoryRepository } from "../domain/purchases-history-table";
import { paymentCall } from "../domain/payment-call";

export const purchaseAction = async (
  userId: string,
  purchaseId: string,
  repository: PurchasesHistoryRepository
) => {
  try {
    await paymentCall(userId);
    const purchase = new PurchaseEntity(userId, true, purchaseId);
    await repository.save(purchase);
  } catch (e) {
    const purchase = new PurchaseEntity(userId, false, purchaseId);
    await repository.save(purchase);
  }
};
