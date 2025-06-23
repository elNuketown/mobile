exports.config = {
  path: '/wd/hub',
  user: process.env.BROWSERSTACK_USERNAME,
  key:  process.env.BROWSERSTACK_ACCESS_KEY,
  specs: ['./tests/**/*.spec.js'],
  maxInstances: 1,
  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'Google Pixel 7',
    'appium:automationName': 'UiAutomator2',
    'appium:app': 'bs://b7ee0761bb5fc977050358540241ea89c5147553'
  }],
  logLevel: 'info',
  framework: 'mocha',
  reporters: ['spec', ['mochawesome', {
    outputDir: './reports',
    reportFilename: 'index',
    html: true
  }]],
  mochaOpts: { timeout: 60000 }
};