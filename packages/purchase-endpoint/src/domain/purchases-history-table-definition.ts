import { CfnTableProps } from "@aws-cdk/aws-dynamodb";
import { dynamoCdkToSdk } from "@sales/cdk/src/helpers/dynamoCdkToSdk";

export const PurchasesHistoryTableDefinition: CfnTableProps = {
  attributeDefinitions: [
    {
      attributeType: "S",
      attributeName: "purchaseId",
    },
  ],
  keySchema: [
    {
      attributeName: "purchaseId",
      keyType: "HASH",
    },
  ],
  provisionedThroughput: {
    readCapacityUnits: 5,
    writeCapacityUnits: 5,
  },
};

export const PurchasesHistoryTableDefinitionSdk = dynamoCdkToSdk(
  PurchasesHistoryTableDefinition
);
