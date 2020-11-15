import { DynamoDB } from "aws-sdk";
import { PurchaseEntity } from "./PurchaseEntity";

export class PurchasesHistoryRepository {
  constructor(
    private tableName: string,
    private documentClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient()
  ) {}

  async getById(purchaseId: string) {
    const result = await this.documentClient
      .get({ TableName: this.tableName, Key: { purchaseId } })
      .promise();
    if (result.Item) {
      return new PurchaseEntity(
        result.Item.userId,
        result.Item.isSuccess,
        result.Item.purchaseId
      );
    }
    return undefined;
  }

  async save(purchase: PurchaseEntity) {
    await this.documentClient
      .put({
        TableName: this.tableName,
        Item: { ...purchase },
      })
      .promise();
  }
}
