const { expect } = require('chai');
const allure = require('@wdio/allure-reporter').default;
const { swipe } = require('../utils/swipe');
const { login } = require('../utils/login');

let driver;

describe('Login Swag Labs', () => {
  it('faz compra de uma mochila', async () => {
    
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

  after(async () => {
    if (driver) await driver.deleteSession();
  });

    await login(driver);

    const itemMochila = await driver.driver.$('(//android.view.ViewGroup[@content-desc="test-Item"])[1]/android.view.ViewGroup/android.widget.ImageView');
    await itemMochila.click();

    const botaoAddCarrinho = '//android.widget.TextView[@text="ADD TO CART"]';

    let tentativas = 0;
     while (!(await driver.$(botaoAddCarrinho).isDisplayed()) && tentativas < 6) {
      await swipe();
      tentativas++;
    }

    if (!(await driver.$(botaoAddCarrinho).isDisplayed())) {
      throw new Error('Não encontrado');
    }

    await driver.$(botaoAddCarrinho).click();

    const botaoCarrinho = await driver.$('//android.view.ViewGroup[@content-desc="test-Cart"]/android.view.ViewGroup/android.widget.ImageView');
    await botaoCarrinho.click();

    const botaoCheckout = await driver.$('~test-CHECKOUT');
    await botaoCheckout.waitForDisplayed({ timeout: 5000 });
    await botaoCheckout.click();
    
    const campoNome = await driver.$('~test-First Name');
    await campoNome.waitForDisplayed({ timeout: 5000 });
    await campoNome.clearValue();
    await campoNome.setValue('Vinicios');

    const campoSobreNome = await driver.$('~test-Last Name');
    await campoSobreNome.waitForDisplayed({ timeout: 5000 });
    await campoSobreNome.clearValue();
    await campoSobreNome.setValue('Virissimo');

    const campoCep = await driver.$('~test-Zip/Postal Code');
    await campoCep.waitForDisplayed({ timeout: 5000 });
    await campoCep.clearValue();
    await campoCep.setValue('07713110');

    const botaoContinue = await driver.$('~test-CONTINUE');
    await botaoContinue.waitForDisplayed({ timeout: 5000 });
    await botaoContinue.click();

    const botaoFinish = '~test-FINISH';
    tentativas = 0;
     while (!(await driver.$(botaoFinish).isDisplayed()) && tentativas < 6) {
      await swipe();
      tentativas++;
    }

    if (!(await driver.$(botaoFinish).isDisplayed())) {
      throw new Error('Não encontrado.');
    }

    await driver.$(botaoFinish).click();

    const TitulothankYouMsg = await driver.$('//android.widget.TextView[@text="THANK YOU FOR YOU ORDER"]');
    await TitulothankYouMsg.waitForDisplayed({ timeout: 5000 });
    const texto = await TitulothankYouMsg.getText();
    expect(texto).to.equal('THANK YOU FOR YOU ORDER');
  });
});