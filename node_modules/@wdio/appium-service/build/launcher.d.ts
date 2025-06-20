import type { Services, Capabilities, Options } from '@wdio/types';
import type { AppiumServiceConfig } from './types.js';
export default class AppiumLauncher implements Services.ServiceInstance {
    #private;
    private _options;
    private _capabilities;
    private _config?;
    private readonly _logPath?;
    private readonly _appiumCliArgs;
    private readonly _args;
    private _process?;
    private _isShuttingDown;
    constructor(_options: AppiumServiceConfig, _capabilities: Capabilities.TestrunnerCapabilities, _config?: Options.Testrunner | undefined);
    private _getCommand;
    /**
     * update capability connection options to connect
     * to Appium server
     */
    private _setCapabilities;
    onPrepare(): Promise<void>;
    private promisifiedTreeKill;
    onComplete(): Promise<void>;
    private _startAppium;
    private _redirectLogStream;
    private static _getAppiumCommand;
}
//# sourceMappingURL=launcher.d.ts.map