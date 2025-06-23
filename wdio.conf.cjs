exports.config = {
  runner: 'local',
  path: '/wd/hub',
  specs: ['./tests/**/*.spec.js'],
  maxInstances: 1,

  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  capabilities: [{
    'platformName': 'Android',
    'appium:deviceName': 'Google Pixel 7',
    'appium:platformVersion': '13.0',
    'appium:app': 'bs://b7ee0761bb5fc977050358540241ea89c5147553',
    'appium:automationName': 'UiAutomator2'
  }],

  logLevel: 'info',
  waitforTimeout: 10000,
  framework: 'mocha',
  mochaOpts: {
    timeout: 60000
  },
  reporters: ['spec', ['mochawesome', {
    outputDir: './reports',
    reportFilename: 'index',
    quiet: true,
    html: true,
    json: false,
  }]],
};