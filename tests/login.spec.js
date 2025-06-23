const { expect } = require('chai');
const { remote } = require('webdriverio');           // ← faltava esse import
const { login } = require('../utils/login');
const allure = require('@wdio/allure-reporter').default;

let driver;

describe('Login Swag Labs', () => {
  // 1️⃣ Hook de setup (antes dos testes)
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

  // 2️⃣ Hook de teardown (depois dos testes)
  after(async () => {
    if (driver) await driver.deleteSession();
  });

  // 3️⃣ Teste real
  it('faz login com usuário e senha válidos', async () => {
    await login(driver);

    const itemLoja = await driver.$('//android.widget.TextView[@content-desc="test-Item title" and @text="Sauce Labs Backpack"]');
    await itemLoja.waitForDisplayed({ timeout: 5000 });
    
    const texto = await itemLoja.getText();
    expect(texto).to.equal('Sauce Labs Backpack');
  });
});