// utils/login.js
async function login(driver, user = 'standard_user', pass = 'secret_sauce') {
  await driver.$('~test-Username').setValue(user);
  await driver.$('~test-Password').setValue(pass);
  await driver.$('~test-LOGIN').click();
}

module.exports = { login };