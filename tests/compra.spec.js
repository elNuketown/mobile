const { expect } = require('chai');
const { remote } = require('webdriverio');
const { swipe }  = require('../utils/swipe');
const { login }  = require('../utils/login');
const { createDriver } = require('../utils/driver');

let driver;

describe('Realizar uma compra com sucesso', function () {
  this.timeout(120_000); 

  before(async () => { driver = await createDriver(); });
  after(async  () => { await driver?.deleteSession(); });

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
});