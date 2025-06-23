const { expect } = require('chai');
const { remote } = require('webdriverio');
const { login } = require('../utils/login');
const { createDriver } = require('../utils/driver');
const allure = require('@wdio/allure-reporter').default;

let driver;

describe('Login com sucesso', () => {
  before(async () => { driver = await createDriver(); });
  after(async  () => { await driver?.deleteSession(); });

  it('faz login com usuário e senha válidos', async () => {
    await login(driver);

    const itemLoja = await driver.$('//android.widget.TextView[@content-desc="test-Item title" and @text="Sauce Labs Backpack"]');
    await itemLoja.waitForDisplayed({ timeout: 5000 });
    
    const texto = await itemLoja.getText();
    expect(texto).to.equal('Sauce Labs Backpack');
  });
});