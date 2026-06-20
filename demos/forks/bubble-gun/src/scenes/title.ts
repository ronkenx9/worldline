import { Scene, Sound } from '../constants'
import { addButton, addText } from '../gameobjects'
import { primeWorldlineBriefing, worldlineBriefing } from '../worldline'

scene(Scene.Title, () => {
  const { x, y } = center()
  const buttonHeight = 80

  // Pull the latest briefing each time we land on the title (handles cross-game
  // updates, e.g. memory written from You're the OS). It primes a cache; the
  // visible text refreshes once the fetch resolves (briefingText below).
  void primeWorldlineBriefing()

  addText({
    width: 400,
    height: 100,
    x,
    y: y - buttonHeight * 2,
    text: 'Bubble Gun',
    fontSize: 48,
  })

  const briefingText = addText({
    width: Math.min(width() - 40, 720),
    height: 90,
    x,
    y: y - buttonHeight,
    text: worldlineBriefing(),
    fontSize: 18,
  })
  window.addEventListener('worldline:briefing', () => {
    briefingText.text = worldlineBriefing()
  })

  addButton({
    width: 220,
    height: buttonHeight,
    radius: 8,
    x,
    y: y + buttonHeight,
    text: 'Play',
    onClick() {
      play(Sound.Hit)
      go(Scene.Game)
    },
  })

  addButton({
    width: 220,
    height: buttonHeight,
    radius: 8,
    x,
    y: y + buttonHeight * 2 + 20,
    text: 'Tutorial',
    onClick() {
      play(Sound.Hit)
      go(Scene.Tutorial)
    },
  })
})
