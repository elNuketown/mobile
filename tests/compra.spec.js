const { expect } = require('chai');
const { remote } = require('webdriverio');
const { swipe }  = require('../utils/swipe');
const { login }  = require('../utils/login');

let driver;

describe('Realizar uma compra com sucesso', function () {
  this.timeout(120_000); 

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

  it('Compra de mochila', async () => {

    await login(driver);

    const itemMochila = await driver.$('(//android.view.ViewGroup[@content-desc="test-Item"])[1]/android.view.ViewGroup/android.widget.ImageView');
    await itemMochila.click();

    const botaoAddCarrinho = '//android.widget.TextView[@text="ADD TO CART"]';

    let tentativas = 0;
    while (!(await driver.$(botaoAddCarrinho).isDisplayed()) && tentativas < 6) {
      await swipe(driver);
      tentativas++;
    }

    if (!(await driver.$(botaoAddCarrinho).isDisplayed())) {
      throw new Error('ADD TO CART não encontrado');
    }
    await driver.$(botaoAddCarrinho).click();

    const botaoCarrinho = await driver.$('//android.view.ViewGroup[@content-desc="test-Cart"]/android.view.ViewGroup/android.widget.ImageView');
    await botaoCarrinho.click();

    const botaoCheckout = await driver.$('~test-CHECKOUT');
    await botaoCheckout.waitForDisplayed({ timeout: 5000 });
    await botaoCheckout.click();

    await driver.$('~test-First Name').setValue('Vinicios');
    await driver.$('~test-Last Name').setValue('Virissimo');
    await driver.$('~test-Zip/Postal Code').setValue('07713110');
    await driver.$('~test-CONTINUE').click();

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

    const thankYou = await driver.$('//android.widget.TextView[@text="THANK YOU FOR YOU ORDER"]');
    await thankYou.waitForDisplayed({ timeout: 5000 });
    expect(await thankYou.getText()).to.equal('THANK YOU FOR YOU ORDER');
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