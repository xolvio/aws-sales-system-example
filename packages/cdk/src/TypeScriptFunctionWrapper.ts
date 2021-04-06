/* eslint-disable no-new */
import getConfiguredTypeScriptFunction from "cdk-typescript-tooling/build/getConfiguredTypeScriptFunction";
import { AvailableLambdas, AvailableTables } from "./AvailableDependencies";

export const {
  addLambdas,
  ToolkitFunction,
  addTables,
  registerTable,
} = getConfiguredTypeScriptFunction<AvailableLambdas, AvailableTables>(
  AvailableLambdas,
  AvailableTables
);
