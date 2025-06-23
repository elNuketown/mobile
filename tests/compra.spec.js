// tests/compra.spec.js
const { expect } = require('chai');
const { remote } = require('webdriverio');           // ← faltava o import
const { swipe }  = require('../utils/swipe');
const { login }  = require('../utils/login');

let driver;                                          // precisa estar no escopo do arquivo

describe('Login Swag Labs – compra de mochila', function () {
  this.timeout(120_000);                             // aumenta o timeout global do describe

  // 1️⃣  Hook BEFORE: cria a sessão Appium
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
    'appium:app': 'bs://<ID-do-apk-subido>',
    'appium:automationName': 'UiAutomator2'
  }
});
    });

  // 2️⃣  Hook AFTER: encerra a sessão
  after(async () => {
    if (driver) await driver.deleteSession();
  });

  // 3️⃣  TESTE
  it('faz compra de uma mochila', async () => {

    // login util RECEBE o driver
    await login(driver);

    // elemento da mochila
    const itemMochila = await driver.$('(//android.view.ViewGroup[@content-desc="test-Item"])[1]/android.view.ViewGroup/android.widget.ImageView');
    await itemMochila.click();

    // botão ADD TO CART
    const botaoAddCarrinho = '//android.widget.TextView[@text="ADD TO CART"]';

    let tentativas = 0;
    while (!(await driver.$(botaoAddCarrinho).isDisplayed()) && tentativas < 6) {
      await swipe(driver);                           // se o util swipe precisar do driver
      tentativas++;
    }

    if (!(await driver.$(botaoAddCarrinho).isDisplayed())) {
      throw new Error('ADD TO CART não encontrado');
    }
    await driver.$(botaoAddCarrinho).click();

    // restante do fluxo…
    const botaoCarrinho = await driver.$('//android.view.ViewGroup[@content-desc="test-Cart"]/android.view.ViewGroup/android.widget.ImageView');
    await botaoCarrinho.click();

    const botaoCheckout = await driver.$('~test-CHECKOUT');
    await botaoCheckout.waitForDisplayed({ timeout: 5000 });
    await botaoCheckout.click();

    // preenche formulário
    await driver.$('~test-First Name').setValue('Vinicios');
    await driver.$('~test-Last Name').setValue('Virissimo');
    await driver.$('~test-Zip/Postal Code').setValue('07713110');
    await driver.$('~test-CONTINUE').click();

    // finaliza compra
    const botaoFinish = '~test-FINISH';
    tentativas = 0;
    while (!(await driver.$(botaoFinish).isDisplayed()) && tentativas < 6) {
      await swipe(driver);
      tentativas++;
    }
    if (!(await driver.$(botaoFinish).isDisplayed())) {
      throw new Error('FINISH não encontrado');
    }
    await driver.$(botaoFinish).click();

    // validação
    const thankYou = await driver.$('//android.widget.TextView[@text="THANK YOU FOR YOU ORDER"]');
    await thankYou.waitForDisplayed({ timeout: 5000 });
    expect(await thankYou.getText()).to.equal('THANK YOU FOR YOU ORDER');
  });
});