async function swipe(driver) {
  const { height, width } = await driver.getWindowSize();

  const startX = width / 2;
  const startY = height * 0.8;
  const endY   = height * 0.2;

  await driver.touchPerform([
    { action: 'press', options: { x: startX, y: startY } },
    { action: 'wait',  options: { ms: 300 } },
    { action: 'moveTo', options: { x: startX, y: endY } },
    { action: 'release' }
  ]);
  await driver.pause(500); 
}

module.exports = { swipe };