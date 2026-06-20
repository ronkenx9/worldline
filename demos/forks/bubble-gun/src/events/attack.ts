import { Sound } from '../constants'
import { addBubble, game } from '../gameobjects'
import type { Player } from '../types'

export function addAttack(player: Player) {
  onClick(() => {
    if (canAttack(player)) {
      player.attack.lastFired = time()
      addBubble(player)
      play(Sound.Hit, { detune: rand(-100, 100) })
    }
  })
}

function canAttack(player: Player) {
  return (
    !game.paused && time() - player.attack.lastFired - player.attack.delay > 0
  )
}
