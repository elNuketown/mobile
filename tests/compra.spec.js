const { expect } = require('chai');
const allure = require('@wdio/allure-reporter').default;
const { swipe } = require('../utils/swipe');
const { login } = require('../utils/login');

describe('Login Swag Labs', () => {
  it('faz compra de uma mochila', async () => {
    
    await login();

    const itemMochila = await $('(//android.view.ViewGroup[@content-desc="test-Item"])[1]/android.view.ViewGroup/android.widget.ImageView');
    await itemMochila.click();

    const botaoAddCarrinho = '//android.widget.TextView[@text="ADD TO CART"]';

    let tentativas = 0;
     while (!(await $(botaoAddCarrinho).isDisplayed()) && tentativas < 6) {
      await swipe();
      tentativas++;
    }

    if (!(await $(botaoAddCarrinho).isDisplayed())) {
      throw new Error('Não encontrado');
    }

    await $(botaoAddCarrinho).click();

    const botaoCarrinho = await $('//android.view.ViewGroup[@content-desc="test-Cart"]/android.view.ViewGroup/android.widget.ImageView');
    await botaoCarrinho.click();

    const botaoCheckout = await $('~test-CHECKOUT');
    await botaoCheckout.waitForDisplayed({ timeout: 5000 });
    await botaoCheckout.click();
    
    const campoNome = await $('~test-First Name');
    await campoNome.waitForDisplayed({ timeout: 5000 });
    await campoNome.clearValue();
    await campoNome.setValue('Vinicios');

    const campoSobreNome = await $('~test-Last Name');
    await campoSobreNome.waitForDisplayed({ timeout: 5000 });
    await campoSobreNome.clearValue();
    await campoSobreNome.setValue('Virissimo');

    const campoCep = await $('~test-Zip/Postal Code');
    await campoCep.waitForDisplayed({ timeout: 5000 });
    await campoCep.clearValue();
    await campoCep.setValue('07713110');

    const botaoContinue = await $('~test-CONTINUE');
    await botaoContinue.waitForDisplayed({ timeout: 5000 });
    await botaoContinue.click();

    const botaoFinish = '~test-FINISH';
    tentativas = 0;
     while (!(await $(botaoFinish).isDisplayed()) && tentativas < 6) {
      await swipe();
      tentativas++;
    }

    if (!(await $(botaoFinish).isDisplayed())) {
      throw new Error('Não encontrado.');
    }

    await $(botaoFinish).click();

    const TitulothankYouMsg = await $('//android.widget.TextView[@text="THANK YOU FOR YOU ORDER"]');
    await TitulothankYouMsg.waitForDisplayed({ timeout: 5000 });
    const texto = await TitulothankYouMsg.getText();
    expect(texto).to.equal('THANK YOU FOR YOU ORDER');
  });
});