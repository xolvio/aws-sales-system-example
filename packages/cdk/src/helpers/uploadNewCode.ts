import * as shelljs from "shelljs";
import path from "path";

const webpackPath = require.resolve("webpack");

const webpackBinPath = path.resolve(
  path.join(
    webpackPath.slice(0, webpackPath.lastIndexOf("/node_modules")),
    "node_modules"
  ),
  ".bin/webpack"
);
const webpackConfigPath =
  "/var/folders/7v/29ngnq_17w34ccmb2dftljb00000gn/T/aws-lambda-nodejs-webpackVi0kVq/webpack.config.js";
const outputDir =
  "/var/folders/7v/29ngnq_17w34ccmb2dftljb00000gn/T/aws-lambda-nodejs-webpackVi0kVq/";

shelljs.exec(`node ${webpackBinPath} --config ${webpackConfigPath}`, {
  cwd: "/Volumes/fast/Projects/aws-sales-system-example/packages/cdk",
});

const functionName = `SalesSystemExample-PurchaseEndpoint321B1702-IKYULFRNR9VJ`;

const zippedFunctionPath = `${outputDir}function.zip`;
const zipCommand = `zip function.zip main.js`;
console.log("GOZDECKI zipCommand", zipCommand);
shelljs.exec(zipCommand, { cwd: outputDir });

const updateCommand = `aws lambda update-function-code --function-name ${functionName} --zip-file fileb://${zippedFunctionPath}`;
console.log("GOZDECKI updateCommand", updateCommand);
shelljs.exec(updateCommand);
