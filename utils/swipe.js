// swipe.js
async function swipe(driver, startX, startY, endX, endY) {
  await driver.touchPerform([
    { action: 'press', options: { x: startX, y: startY }},
    { action: 'wait', options: { ms: 1000 }},
    { action: 'moveTo', options: { x: endX, y: endY }},
    { action: 'release' }
  ]);
}

module.exports = { swipe };