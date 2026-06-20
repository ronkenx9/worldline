import { Layer } from '../constants'
import { getPlayer } from '.'

const WIDTH = 300
const HEIGHT = 30

export function addHealth() {
  const background = add([
    rect(WIDTH, HEIGHT),
    pos(30, height() - 60),
    color(0, 0, 0),
    fixed(),
    z(Layer.Foreground),
  ])

  const health = background.add([
    rect(WIDTH, HEIGHT),
    pos(0, 0),
    color(255, 0, 0),
  ])

  const player = getPlayer()!

  function updateHealth() {
    health.width = (player.hp() / player.maxHP()!) * WIDTH
  }

  player.onHurt(updateHealth)
  player.onHeal(updateHealth)

  return health
}
