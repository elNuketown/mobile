const { expect } = require('chai');
const allure = require('@wdio/allure-reporter').default;
const { login } = require('../utils/login');

let driver;

describe('Login Swag Labs', () => {
  it('faz login com usuário e senha válidos', async () => {

     before(async () => {
    driver = await remote({
      path: '/wd/hub',
      port: 4723,
      capabilities: {
        platformName: 'Android',
        deviceName: 'emulator-5554',
        app: process.cwd() + '/apps/seu-apk.apk',
        automationName: 'UiAutomator2'
      }
    });
  });

    await login(driver);

    const itemLoja =  await driver.$('//android.widget.TextView[@content-desc="test-Item title" and @text="Sauce Labs Backpack"]')
    await itemLoja.waitForDisplayed({ timeout: 5000 });
    const texto = await itemLoja.getText();
    expect(texto).to.equal('Sauce Labs Backpack');
  });

  after(async () => {
    if (driver) await driver.deleteSession();
  });
});