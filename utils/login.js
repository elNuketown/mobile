export async function login (user = 'standard_user', pass = 'secret_sauce') {
  await $('~test-Username').setValue(user);
  await $('~test-Password').setValue(pass);
  await $('~test-LOGIN').click();
}