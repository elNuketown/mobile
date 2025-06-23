const { expect } = require('chai');
const allure = require('@wdio/allure-reporter').default;
const { login } = require('../utils/login');

describe('Login Swag Labs', () => {
  it('faz login com usuário e senha válidos', async () => {
    await login();

    const itemLoja =  await $('//android.widget.TextView[@content-desc="test-Item title" and @text="Sauce Labs Backpack"]')
    await itemLoja.waitForDisplayed({ timeout: 5000 });
    const texto = await itemLoja.getText();
    expect(texto).to.equal('Sauce Labs Backpack');
  });
});