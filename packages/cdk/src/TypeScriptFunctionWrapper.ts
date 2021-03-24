import getConfiguredTypeScriptFunction, {
  registerTable,
} from "cdk-typescript-tooling/build/getConfiguredTypeScriptFunction";
import { AvailableLambdas, AvailableTables } from "./AvailableDependencies";

export const {
  addLambdas,
  TypeScriptFunctionWithLambdas,
  addTables,
} = getConfiguredTypeScriptFunction<AvailableLambdas, AvailableTables>(
  AvailableLambdas,
  AvailableTables
);

export { registerTable };

// MOVE THE getLambdaFunctionName etc
