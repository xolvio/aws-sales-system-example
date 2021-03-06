/* eslint-disable @typescript-eslint/no-use-before-define */
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as process from "process";
import * as findUp from "find-up";

import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as shelljs from "shelljs";

const getListOfNodeModules = () => {
  return shelljs
    .ls("../")
    .map((s: any) => {
      const exist = shelljs.test("-d", `../${s}/node_modules`);
      if (exist && s !== "cdk") {
        return `"../${s}/node_modules"`;
      }
      return null;
    })
    .filter((a) => a)
    .join(",");
};
/**
 * Properties for a NodejsFunction
 */
export interface NodejsFunctionProps extends lambda.FunctionOptions {
  /**
   * Path to the entry file (JavaScript or TypeScript), relative to your project root
   */
  readonly entry: string;

  /**
   * The name of the exported handler in the entry file.
   *
   * @default "handler"
   */
  readonly handler?: string;

  /**
   * The runtime environment. Only runtimes of the Node.js family are
   * supported.
   *
   * @default - `NODEJS_12_X` if `process.versions.node` >= '12.0.0',
   * `NODEJS_10_X` otherwise.
   */
  readonly runtime?: lambda.Runtime;

  /**
   * If you get "Module not found: Error: Can't resolve 'module_name'" errors, and you're not
   * actually using those modules, then it means there's a module you're using that is trying to
   * dynamically require other modules. This is the case with Knex.js. When this happens, pass all the modules
   * names found in the build error in this array.
   *
   * Example if you're only using PostgreSQL with Knex.js, use:
   *  `modulesToIgnore: ["mssql", "pg-native", "pg-query-stream", "tedious"]`
   */
  readonly modulesToIgnore?: string[];

  /**
   * Whether to automatically reuse TCP connections when working with the AWS
   * SDK for JavaScript.
   *
   * This sets the `AWS_NODEJS_CONNECTION_REUSE_ENABLED` environment variable
   * to `1`.
   *
   * @see https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-reusing-connections.html
   *
   * @default true
   */
  readonly awsSdkConnectionReuse?: boolean;
}

/**
 * A Node.js Lambda function bundled using Parcel
 */
export class NodejsFunction extends lambda.Function {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: NodejsFunctionProps = { entry: "", modulesToIgnore: [] }
  ) {
    if (props.runtime && props.runtime.family !== lambda.RuntimeFamily.NODEJS) {
      throw new Error("Only `NODEJS` runtimes are supported.");
    }

    if (!/\.(js|ts)$/.test(props.entry)) {
      throw new Error(
        "Only JavaScript or TypeScript entry files are supported."
      );
    }

    const entryFullPath = path.resolve(props.entry);

    if (!fs.existsSync(entryFullPath)) {
      throw new Error(`Cannot find entry file at ${entryFullPath}`);
    }

    const handler = props.handler ?? "handler";
    const defaultRunTime =
      nodeMajorVersion() >= 12
        ? lambda.Runtime.NODEJS_12_X
        : lambda.Runtime.NODEJS_10_X;
    const runtime = props.runtime ?? defaultRunTime;

    const outputDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "aws-lambda-nodejs-webpack")
    );
    const webpackConfigPath = path.join(outputDir, "webpack.config.js");

    // The code below is mostly to handle cases where this module is used through
    // yarn link. I think otherwise just using require.resolve and passing just the babel plugin
    // names would have worked.

    const webpackPath = require.resolve("webpack");

    const plugins = [
      "webpack",
      "noop2",
      "tsconfig-paths-webpack-plugin",
      "terser-webpack-plugin",
    ];
    const pluginsPath = path.join(
      webpackPath.slice(0, webpackPath.lastIndexOf("/node_modules")),
      "node_modules"
    );
    const pluginsPaths: any = plugins.reduce(function (acc, pluginName) {
      return {
        [pluginName]: findUp.sync(pluginName, {
          type: "directory",
          cwd: pluginsPath,
        }),
        ...acc,
      };
    }, {});

    const moduleReplacementPluginSection = () => {
      if (props.modulesToIgnore && props.modulesToIgnore.length) {
        return `new webpack.NormalModuleReplacementPlugin(
          /${props.modulesToIgnore.join("|")}/,
          "${pluginsPaths.noop2}",
        ),`;
      }
      return "";
    };

    const nodeModulesList = getListOfNodeModules();

    const webpackConfiguration = `
    const { builtinModules } = require("module");
    const webpack = require("${pluginsPaths.webpack}");
    const TsconfigPathsPlugin = require('${
      pluginsPaths["tsconfig-paths-webpack-plugin"]
    }')
    const TerserPlugin = require('${pluginsPaths["terser-webpack-plugin"]}')


    module.exports = {
      mode: "production",
      entry: "${entryFullPath}",
      target: "node",
      stats: 'errors-only',
      resolve: {
        // we need to iterate over all packages and add the node_modules dynamically
        modules: ["../../node_modules", ${nodeModulesList}],
        extensions: [ '.mjs', '.ts', '.js' ],
        // we need to iterate over all packages and add the config dynamically
        plugins: [new TsconfigPathsPlugin({configFile: '../../tsconfig.json'})],
      },
      optimization: {
        nodeEnv: 'production',
        minimize: false,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              ecma: undefined,
              parse: {},
              compress: {},
              mangle: true, // Note \`mangle.properties\` is \`false\` by default.
              module: false,
              output: null,
              toplevel: false,
              nameCache: null,
              ie8: false,
              keep_classnames: true,
              keep_fnames: true,
              safari10: false,
            },
          }),
        ],
      },
      // devtool: "source-map",
      module: {
        rules: [
      {
        test: /\\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {onlyCompileBundledFiles: true, transpileOnly: true},
          },
        ],
        exclude: /node_modules/,
      },
        ]
      },
      externals: [...builtinModules, "aws-sdk"],
      output: {
        filename: "[name].js",
        path: "${outputDir}",
        libraryTarget: "commonjs2",
      },
      ${
        (props.modulesToIgnore &&
          `
      plugins: [
       ${moduleReplacementPluginSection()}
      ],
      `) ||
        ""
      }
    };`;

    const webpackBinPath = path.resolve(pluginsPath, ".bin/webpack");

    fs.writeFileSync(webpackConfigPath, webpackConfiguration);

    // to implement cache, create a script that uses webpack API, store cache in a file with JSON.stringify, based on entry path key then reuse it
    // const webpack = spawnSync(webpackPath, ['--config', webpackConfigPath], {
    //   cwd: process.cwd(),
    //   stdio: 'inherit',
    // })
    shelljs.exec(`node ${webpackBinPath} --config ${webpackConfigPath}`, {
      cwd: process.cwd(),
    });

    // console.log('webpackOutput.stdout', webpackOutput.stdout)
    // console.log('webpackOutput.stderr', webpackOutput.stderr)
    //
    // if (webpackOutput.stderr) {
    //   console.error('webpack had an error when bundling.')
    //   console.error('webpack configuration was:', webpackConfiguration)
    // }

    fs.unlinkSync(webpackConfigPath);

    // this is incorrectly typed in shelljs, the array returns an object
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const compiledFiles = shelljs.ls("-l", outputDir).map((a) => a.name);
    if (compiledFiles.length === 0) {
      console.error(
        `No files compiled for: ${entryFullPath}. Something probably went wrong.`
      );
    }

    super(scope, id, {
      ...props,
      runtime,
      code: lambda.Code.fromAsset(outputDir),
      handler: `main.${handler}`,
    });

    // Enable connection reuse for aws-sdk
    if (props.awsSdkConnectionReuse ?? true) {
      this.addEnvironment("AWS_NODEJS_CONNECTION_REUSE_ENABLED", "1");
    }

    this.addEnvironment("NODE_OPTIONS", "--enable-source-maps");
  }
}

function nodeMajorVersion(): number {
  return parseInt(process.versions.node.split(".")[0], 10);
}
