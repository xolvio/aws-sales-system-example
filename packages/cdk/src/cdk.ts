#!/usr/bin/env node
/* eslint-disable no-new */
import * as cdk from "@aws-cdk/core";
import { SalesSystem } from "./SalesSystem";

const baseStackName = "SalesSystemExampleDatabases";

const app = new cdk.App();

export default new SalesSystem(app, baseStackName);
