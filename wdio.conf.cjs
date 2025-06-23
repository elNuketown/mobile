const path = require('path');
const allure = require('@wdio/allure-reporter').default;

exports.config = {
  hostname: 'localhost',
  port: 4723,
  path: '/',
  runner: 'local',

  specs: ['./tests/**/*.spec.js'],
  maxInstances: 1,

  capabilities: [
  {
    platformName: 'Android',
    'appium:deviceName': 'emulator-5554',
    'appium:automationName': 'UiAutomator2',
    'appium:app': 'apps/SwagLabs.apk',
    'appium:autoGrantPermissions': true,
    'appium:appWaitActivity': '*',
  }
],

  logLevel: 'info',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 1,

  framework: 'mocha',
  mochaOpts: { ui: 'bdd', timeout: 60000 },
  services: ['appium'],
  args: {
      basePath: '/wd/hub',
      port: 4723
    },
  reporters: [
  'spec',
  ['allure', {
    outputDir: 'allure-results',
    disableWebdriverStepsReporting: false,
    disableWebdriverScreenshotsReporting: true,
  }]
],

  afterTest: async function (test, context, { error, passed }) {
    if (!passed) {
      const screenshot = await browser.takeScreenshot();
      allure.addAttachment('Screenshot on Failure', Buffer.from(screenshot, 'base64'), 'image/png');
    }
  }
};