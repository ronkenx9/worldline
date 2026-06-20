import { game } from '../gameobjects'
import type { Player } from '../types'

export function addCursorKeys(player: Player) {
  onKeyDown((key) => {
    if (game.paused) {
      return
    }

    const speed = player.speed - player.bubble * 20

    switch (key) {
      case 'left':
      case 'a':
        player.move(-speed, 0)
        break

      case 'right':
      case 'd':
        player.move(speed, 0)
        break

      case 'up':
      case 'w':
        player.move(0, -speed)
        break

      case 'down':
      case 's':
        player.move(0, speed)
        break
    }
  })
}
