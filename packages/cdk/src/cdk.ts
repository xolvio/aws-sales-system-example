#!/usr/bin/env node
/* eslint-disable no-new */
import * as cdk from "@aws-cdk/core";
import { SalesSystem } from "./SalesSystem";

const baseStackName = "SalesSystemExample";

const app = new cdk.App();

new SalesSystem(app, baseStackName);
