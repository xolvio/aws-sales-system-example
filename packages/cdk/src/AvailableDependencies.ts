export enum AvailableTables {
  PURCHASES_HISTORY,
}

export enum AvailableLambdas {
  PURCHASE_ACTION,
  PAYMENT_SERVICE,
  STATUS,
  PURCHASE_ENDPOINT,
}

export const getLambdaFunctionName = (lambdaName: AvailableLambdas) =>
  process.env[`LAMBDA_${AvailableLambdas[lambdaName]}`];

export const getLambdaUrl = (lambdaName: AvailableLambdas) =>
  process.env[`LAMBDA_${AvailableLambdas[lambdaName]}_URL`];

export const getDynamoTableName = (tableName: AvailableTables) =>
  process.env[`DYNAMODB_${AvailableTables[tableName]}`];
