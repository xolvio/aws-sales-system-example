import { DynamoDB } from "aws-sdk";
import { createTable, generateRandomName } from "dynamodb-testing-tool";
import { PurchasesHistoryRepository } from "./purchases-history-table";
import { PurchaseEntity } from "./PurchaseEntity";
import { PurchasesHistoryTableDefinitionSdk } from "./purchases-history-table-definition";

let repository: PurchasesHistoryRepository;

beforeEach(async () => {
  const dynamoSchema: DynamoDB.CreateTableInput = {
    TableName: generateRandomName(),
    ...PurchasesHistoryTableDefinitionSdk,
  };
  const tableObject = await createTable(dynamoSchema);
  repository = new PurchasesHistoryRepository(
    tableObject.tableName,
    // there are some aws-sdk mismatches here, since we are in tests
    // I'm ignoring this for now.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tableObject.documentClient
  );
  const putCacheItem = ({
    isSuccess,
    purchaseId,
  }: {
    isSuccess: boolean;
    purchaseId: string;
  }) => {
    const newVar = {
      RequestItems: {
        [tableObject.tableName]: [
          {
            PutRequest: {
              Item: {
                purchaseId,
                isSuccess,
                userId: "myId",
              },
            },
          },
        ],
      },
    };
    return tableObject.documentClient.batchWrite(newVar).promise();
  };

  await Promise.all([
    putCacheItem({
      purchaseId: "successful",
      isSuccess: true,
    }),
    putCacheItem({
      purchaseId: "failed",
      isSuccess: false,
    }),
    putCacheItem({
      purchaseId: "another-success",
      isSuccess: true,
    }),
  ]);
});

test("Getting status for successful purchase", async () => {
  const result = await repository.getById("successful");

  expect(result.isSuccess).toEqual(true);
});

test("Getting status for failed purchase", async () => {
  const result = await repository.getById("failed");

  expect(result.isSuccess).toEqual(false);
});

test("Adding failed purchase", async () => {
  const purchaseId = "added-failure";
  const purchase = new PurchaseEntity("userId", false, purchaseId);
  await repository.save(purchase);
  const result = await repository.getById(purchaseId);

  expect(result.isSuccess).toEqual(false);
});

test("Adding successful purchase", async () => {
  const purchaseId = "added-success";
  const purchase = new PurchaseEntity("userId", true, purchaseId);
  await repository.save(purchase);
  const result = await repository.getById(purchaseId);

  expect(result.isSuccess).toEqual(true);
});
