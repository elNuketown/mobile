// src/launcher.ts
import os from "node:os";
import fs from "node:fs";
import fsp from "node:fs/promises";
import url from "node:url";
import path from "node:path";
import { spawn } from "node:child_process";
import { promisify } from "node:util";
import logger from "@wdio/logger";
import getPort from "get-port";
import { resolve as resolve2 } from "import-meta-resolve";
import { isCloudCapability } from "@wdio/config";
import { SevereServiceError } from "webdriverio";
import { isAppiumCapability } from "@wdio/utils";

// src/utils.ts
import { basename, join, resolve } from "node:path";
import { kebabCase } from "change-case";
var FILE_EXTENSION_REGEX = /\.[0-9a-z]+$/i;
function getFilePath(filePath, defaultFilename) {
  let absolutePath = resolve(filePath);
  if (!FILE_EXTENSION_REGEX.test(basename(absolutePath))) {
    absolutePath = join(absolutePath, defaultFilename);
  }
  return absolutePath;
}
function formatCliArgs(args) {
  const cliArgs = [];
  for (const key in args) {
    const value = args[key];
    if (typeof value === "boolean" && !value || value === null) {
      continue;
    }
    if (key === "chromedriver_autodownload") {
      cliArgs.push(key);
      continue;
    }
    cliArgs.push(`--${kebabCase(key)}`);
    if (typeof value !== "boolean") {
      cliArgs.push(sanitizeCliOptionValue(value));
    }
  }
  return cliArgs;
}
function sanitizeCliOptionValue(value) {
  const valueString = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /\s/.test(valueString) ? `'${valueString}'` : valueString;
}

// src/launcher.ts
import treeKill from "tree-kill";
var log = logger("@wdio/appium-service");
var DEFAULT_APPIUM_PORT = 4723;
var DEFAULT_LOG_FILENAME = "wdio-appium.log";
var DEFAULT_CONNECTION = {
  protocol: "http",
  hostname: "127.0.0.1",
  path: "/"
};
var APPIUM_START_TIMEOUT = 30 * 1e3;
var AppiumLauncher = class _AppiumLauncher {
  constructor(_options, _capabilities, _config) {
    this._options = _options;
    this._capabilities = _capabilities;
    this._config = _config;
    this._args = {
      basePath: DEFAULT_CONNECTION.path,
      ...this._options.args || {}
    };
    this._logPath = _options.logPath || this._config?.outputDir;
  }
  _logPath;
  _appiumCliArgs = [];
  _args;
  _process;
  _isShuttingDown = false;
  async _getCommand(command) {
    if (!command) {
      command = "node";
      this._appiumCliArgs.unshift(await _AppiumLauncher._getAppiumCommand());
    }
    if (os.platform() === "win32") {
      this._appiumCliArgs.unshift("/c", command);
      command = "cmd";
    }
    return command;
  }
  /**
   * update capability connection options to connect
   * to Appium server
   */
  _setCapabilities(port) {
    let capabilityWasUpdated = false;
    if (!Array.isArray(this._capabilities)) {
      for (const [, capability] of Object.entries(this._capabilities)) {
        const cap = capability.capabilities || capability;
        const c = cap.alwaysMatch || cap;
        if (!isCloudCapability(c) && isAppiumCapability(c)) {
          capabilityWasUpdated = true;
          Object.assign(
            capability,
            DEFAULT_CONNECTION,
            { path: this._args.basePath, port },
            { ...capability }
          );
        }
      }
      return capabilityWasUpdated;
    }
    this._capabilities.forEach((cap) => {
      const w3cCap = cap;
      if (Object.values(cap).length > 0 && Object.values(cap).every((c) => typeof c === "object" && c.capabilities)) {
        Object.values(cap).forEach(
          (c) => {
            const capability = c.capabilities.alwaysMatch || c.capabilities || c;
            if (!isCloudCapability(capability) && isAppiumCapability(capability)) {
              capabilityWasUpdated = true;
              Object.assign(
                c,
                DEFAULT_CONNECTION,
                { path: this._args.basePath, port },
                { ...c }
              );
            }
          }
        );
      } else if (!isCloudCapability(w3cCap.alwaysMatch || cap) && isAppiumCapability(w3cCap.alwaysMatch || cap)) {
        capabilityWasUpdated = true;
        Object.assign(
          cap,
          DEFAULT_CONNECTION,
          { path: this._args.basePath, port },
          { ...cap }
        );
      }
    });
    return capabilityWasUpdated;
  }
  async onPrepare() {
    if (Array.isArray(this._options.args)) {
      throw new Error("Args should be an object");
    }
    this._args.port = typeof this._args.port === "number" ? this._args.port : await getPort({ port: DEFAULT_APPIUM_PORT });
    const capabilityWasUpdated = this._setCapabilities(this._args.port);
    if (!capabilityWasUpdated) {
      log.warn("Could not identify any capability that indicates a local Appium session, skipping Appium launch");
      return;
    }
    this._appiumCliArgs.push(...formatCliArgs({ ...this._args }));
    const command = await this._getCommand(this._options.command);
    this._process = await this._startAppium(command, this._appiumCliArgs);
    if (this._logPath) {
      this._redirectLogStream(this._logPath);
    } else {
      log.info("Appium logs written to stdout");
      this._process.stdout.on("data", this.#logStdout);
      this._process.stderr.on("data", this.#logStderr);
    }
  }
  #logStdout = (data) => {
    log.debug(data.toString());
  };
  #logStderr = (data) => {
    log.warn(data.toString());
  };
  promisifiedTreeKill = promisify(treeKill);
  async onComplete() {
    this._isShuttingDown = true;
    if (this._process && this._process.pid) {
      this._process.stdout.off("data", this.#logStdout);
      this._process.stderr.off("data", this.#logStderr);
      log.info("Killing entire Appium tree");
      try {
        await this.promisifiedTreeKill(this._process.pid, "SIGTERM").catch(async (err) => {
          log.warn("SIGTERM failed, attempting SIGKILL:", err);
          await this.promisifiedTreeKill(this._process.pid, "SIGKILL");
        });
        log.info("Process and its children successfully terminated");
      } catch (err) {
        log.error("Failed to kill Appium process tree:", err);
        try {
          this._process.kill("SIGKILL");
          log.info("Killed main process directly");
        } catch (e) {
          log.error("Failed to kill process directly:", e);
        }
      }
    }
  }
  _startAppium(command, args, timeout = APPIUM_START_TIMEOUT) {
    log.info(`Will spawn Appium process: ${command} ${args.join(" ")}`);
    const appiumProcess = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let errorCaptured = false;
    let timeoutId;
    let error;
    return new Promise((resolve3, reject) => {
      let outputBuffer = "";
      timeoutId = setTimeout(() => {
        rejectOnce(new Error("Timeout: Appium did not start within expected time"));
      }, timeout);
      const rejectOnce = (err) => {
        if (!errorCaptured) {
          errorCaptured = true;
          clearTimeout(timeoutId);
          reject(err);
        }
      };
      const onErrorMessage = (data) => {
        error = data.toString() || "Appium exited without unknown error message";
        if (!data.toString().includes("Debugger attached")) {
          log.error(error);
        }
        rejectOnce(new Error(error));
      };
      const onStdout = (data) => {
        outputBuffer += data.toString();
        if (outputBuffer.includes("Appium REST http interface listener started")) {
          outputBuffer = "";
          log.info(`Appium started with ID: ${appiumProcess.pid}`);
          clearTimeout(timeoutId);
          appiumProcess.stdout.off("data", onStdout);
          appiumProcess.stderr.off("data", onErrorMessage);
          resolve3(appiumProcess);
        }
      };
      appiumProcess.stdout.on("data", onStdout);
      appiumProcess.stderr.once("data", onErrorMessage);
      appiumProcess.once("exit", (exitCode) => {
        if (this._isShuttingDown) {
          return;
        }
        let errorMessage = `Appium exited before timeout (exit code: ${exitCode})`;
        if (exitCode === 2) {
          errorMessage += "\n" + (error?.toString() || "Check that you don't already have a running Appium service.");
        } else if (errorCaptured) {
          errorMessage += `
${error?.toString()}`;
        }
        if (exitCode !== 0) {
          log.error(errorMessage);
        }
        rejectOnce(new Error(errorMessage));
      });
    });
  }
  async _redirectLogStream(logPath) {
    if (!this._process) {
      throw Error("No Appium process to redirect log stream");
    }
    const logFile = getFilePath(logPath, DEFAULT_LOG_FILENAME);
    await fsp.mkdir(path.dirname(logFile), { recursive: true });
    log.debug(`Appium logs written to: ${logFile}`);
    const logStream = fs.createWriteStream(logFile, { flags: "w" });
    this._process.stdout.pipe(logStream);
    this._process.stderr.pipe(logStream);
  }
  static async _getAppiumCommand(command = "appium") {
    try {
      const entryPath = await resolve2(command, import.meta.url);
      return url.fileURLToPath(entryPath);
    } catch (err) {
      const errorMessage = "Appium is not installed locally. Please install via e.g. `npm i --save-dev appium`.\nIf you use globally installed appium please add: `appium: { command: 'appium' }`\nto your wdio.conf.js!\n\n" + err.stack;
      log.error(errorMessage);
      throw new SevereServiceError(errorMessage);
    }
  }
};

// src/index.ts
var AppiumService = class {
};
var launcher = AppiumLauncher;
export {
  AppiumService as default,
  launcher
};
