const { expect } = require('chai');
const { remote } = require('webdriverio');
const { login } = require('../utils/login');
const allure = require('@wdio/allure-reporter').default;

let driver;

describe('Login com sucesso', () => {
  before(async () => {
   driver = await remote({
  protocol: 'https',
  hostname: 'hub.browserstack.com',
  port: 443,
  path: '/wd/hub',
  capabilities: {
    'platformName': 'Android',
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
  });

  after(async () => {
    if (driver) await driver.deleteSession();
  });

  it('faz login com usuário e senha válidos', async () => {
    await login(driver);

    const itemLoja = await driver.$('//android.widget.TextView[@content-desc="test-Item title" and @text="Sauce Labs Backpack"]');
    await itemLoja.waitForDisplayed({ timeout: 5000 });
    
    const texto = await itemLoja.getText();
    expect(texto).to.equal('Sauce Labs Backpack');
  });

   afterEach(async function () {
    const safeName = this.currentTest.title.replace(/\s+/g, '_');
    const filePath = `./reports/mochawesome/screenshots/${safeName}.png`;

    try {
      await driver.saveScreenshot(filePath);
      // attach no contexto
      this.currentTest.context = {
        title: 'Screenshot',
        value: filePath
      };
    } catch (e) {
      console.warn('Falha ao capturar screenshot', e);
    }
  });
});