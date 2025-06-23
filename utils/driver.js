const { remote } = require('webdriverio');

async function createDriver () {
  return remote({
    protocol: 'https',
    hostname: 'hub.browserstack.com',
    port: 443,
    path: '/wd/hub',
    capabilities: {
      platformName: 'Android',
      'bstack:options': {
        deviceName: 'Google Pixel 7',
        osVersion: '13.0',
        userName: process.env.BROWSERSTACK_USERNAME,
        accessKey: process.env.BROWSERSTACK_ACCESS_KEY
      },
      'appium:app': 'bs://b7ee0761bb5fc977050358540241ea89c5147553',
      'appium:automationName': 'UiAutomator2'
    }
  });
}

module.exports = { createDriver };