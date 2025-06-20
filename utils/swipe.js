export async function swipe(
  startXPercent = 0.5,
  startYPercent = 0.8,
  endXPercent   = 0.5,
  endYPercent   = 0.2,
  duration = 300) {
  const { width, height } = await driver.getWindowSize();

  const startX = Math.floor(width * startXPercent);
  const startY = Math.floor(height * startYPercent);
  const endX   = Math.floor(width * endXPercent);
  const endY   = Math.floor(height * endYPercent);

  console.log(`[SWIPE] (${startX}, ${startY}) -> (${endX}, ${endY})`);
  await driver.performActions([{
    type: 'pointer',
    id: 'finger1',
    parameters: { pointerType: 'touch' },
    actions: [
      { type: 'pointerMove', duration: 0,    x: startX, y: startY },
      { type: 'pointerDown', button: 0 },
      { type: 'pointerMove', duration,       x: endX,   y: endY },
      { type: 'pointerUp',   button: 0 },
    ]
  }]);

  await driver.releaseActions();
  await driver.pause(500);
}