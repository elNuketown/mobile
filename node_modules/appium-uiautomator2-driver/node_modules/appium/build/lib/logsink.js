"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clear = exports.init = void 0;
const npmlog_1 = __importDefault(require("npmlog"));
const winston_1 = require("winston");
const support_1 = require("@appium/support");
const logger_1 = require("./logger");
const lodash_1 = __importDefault(require("lodash"));
// set up distributed logging before everything else
support_1.logger.patchLogger(npmlog_1.default);
global._global_npmlog = npmlog_1.default;
// npmlog is used only for emitting, we use winston for output
npmlog_1.default.level = 'info';
const levels = {
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
};
const colors = {
    info: 'cyan',
    debug: 'grey',
    warn: 'yellow',
    error: 'red',
};
const npmToWinstonLevels = {
    silly: 'debug',
    verbose: 'debug',
    debug: 'debug',
    info: 'info',
    http: 'info',
    warn: 'warn',
    error: 'error',
};
const encounteredPrefixes = [];
let log = null;
let useLocalTimeZone = false;
// add the timestamp in the correct format to the log info object
const timestampFormat = winston_1.format.timestamp({
    format() {
        let date = new Date();
        if (useLocalTimeZone) {
            date = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
        }
        // '2012-11-04T14:51:06.157Z' -> '2012-11-04 14:51:06:157'
        return date.toISOString().replace(/[TZ]/g, ' ').replace(/\./g, ':').trim();
    },
});
// set the custom colors
const colorizeFormat = winston_1.format.colorize({
    colors,
});
// Strip the color marking within messages
const stripColorFormat = (0, winston_1.format)(function stripColor(info) {
    const code = /\u001b\[(\d+(;\d+)*)?m/g; // eslint-disable-line no-control-regex
    info.message = info.message.replace(code, '');
    return info;
})();
function createConsoleTransport(args, logLvl) {
    return new winston_1.transports.Console({
        // @ts-expect-error The 'name' property should exist
        name: 'console',
        handleExceptions: true,
        exitOnError: false,
        json: false,
        level: logLvl,
        stderrLevels: ['error'],
        format: winston_1.format.combine(timestampFormat, args.logNoColors ? stripColorFormat : colorizeFormat, winston_1.format.printf(function printInfo(info) {
            return `${args.logTimestamp ? `${info.timestamp} - ` : ''}${info.message}`;
        })),
    });
}
function createFileTransport(args, logLvl) {
    return new winston_1.transports.File({
        // @ts-expect-error The 'name' property should exist
        name: 'file',
        filename: args.logFile,
        maxFiles: 1,
        handleExceptions: true,
        exitOnError: false,
        json: false,
        level: logLvl,
        format: winston_1.format.combine(stripColorFormat, timestampFormat, winston_1.format.printf(function printInfo(info) {
            return `${info.timestamp} ${info.message}`;
        })),
    });
}
function createHttpTransport(args, logLvl) {
    let host = '127.0.0.1';
    let port = 9003;
    if (args.webhook.match(':')) {
        const hostAndPort = args.webhook.split(':');
        host = hostAndPort[0];
        port = parseInt(hostAndPort[1], 10);
    }
    return new winston_1.transports.Http({
        // @ts-expect-error The 'name' property should exist
        name: 'http',
        host,
        port,
        path: '/',
        handleExceptions: true,
        exitOnError: false,
        json: false,
        level: logLvl,
        format: winston_1.format.combine(stripColorFormat, winston_1.format.printf(function printInfo(info) {
            return `${info.timestamp} ${info.message}`;
        })),
    });
}
async function createTransports(args) {
    let transports = [];
    let consoleLogLevel = null;
    let fileLogLevel = null;
    if (args.loglevel && args.loglevel.match(':')) {
        // --log-level arg can optionally provide diff logging levels for console and file, separated by a colon
        const lvlPair = args.loglevel.split(':');
        consoleLogLevel = lvlPair[0] || consoleLogLevel;
        fileLogLevel = lvlPair[1] || fileLogLevel;
    }
    else {
        consoleLogLevel = fileLogLevel = args.loglevel;
    }
    transports.push(createConsoleTransport(args, consoleLogLevel));
    if (args.logFile) {
        try {
            // if we don't delete the log file, winston will always append and it will grow infinitely large;
            // winston allows for limiting log file size, but as of 9.2.14 there's a serious bug when using
            // maxFiles and maxSize together. https://github.com/flatiron/winston/issues/397
            if (await support_1.fs.exists(args.logFile)) {
                await support_1.fs.unlink(args.logFile);
            }
            transports.push(createFileTransport(args, fileLogLevel));
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.log(`Tried to attach logging to file '${args.logFile}' but an error ` + `occurred: ${e.message}`);
        }
    }
    if (args.webhook) {
        try {
            transports.push(createHttpTransport(args, fileLogLevel));
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.log(`Tried to attach logging to Http at ${args.webhook} but ` +
                `an error occurred: ${e.message}`);
        }
    }
    return transports;
}
function getColorizedPrefix(prefix) {
    let prefixId = prefix.split('@')[0].trim();
    prefixId = prefixId.split(' (')[0].trim();
    if (encounteredPrefixes.indexOf(prefixId) < 0) {
        encounteredPrefixes.push(prefixId);
    }
    // using a multiple of 16 should cause 16 colors to be created
    const colorNumber = encounteredPrefixes.indexOf(prefixId) * 16;
    // use the modulus to cycle around color wheel
    return `\x1b[38;5;${colorNumber % 256}m${prefix}\x1b[0m`;
}
async function init(args) {
    npmlog_1.default.level = 'silent';
    // set de facto param passed to timestamp function
    useLocalTimeZone = args.localTimezone;
    // clean up in case we have initiated before since npmlog is a global object
    clear();
    log = (0, winston_1.createLogger)({
        transports: await createTransports(args),
        levels,
    });
    // Capture logs emitted via npmlog and pass them through winston
    npmlog_1.default.on('log', ({ level, message, prefix }) => {
        const winstonLevel = npmToWinstonLevels[level] || 'info';
        let msg = message;
        if (prefix) {
            const decoratedPrefix = `[${prefix}]`;
            const toColorizedDecoratedPrefix = () => prefix === logger_1.APPIUM_LOGGER_NAME
                ? decoratedPrefix.magenta
                : getColorizedPrefix(decoratedPrefix);
            msg = `${args.logNoColors ? decoratedPrefix : toColorizedDecoratedPrefix()} ${msg}`;
        }
        log[winstonLevel](msg);
        if (args.logHandler && lodash_1.default.isFunction(args.logHandler)) {
            args.logHandler(level, msg);
        }
    });
}
exports.init = init;
function clear() {
    if (log) {
        for (let transport of lodash_1.default.keys(log.transports)) {
            log.remove(transport);
        }
    }
    npmlog_1.default.removeAllListeners('log');
}
exports.clear = clear;
exports.default = init;
//# sourceMappingURL=logsink.js.map