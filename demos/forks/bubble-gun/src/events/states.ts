import { Animation, Sprite, State } from '../constants'
import { addBadBubble, addProjectile, getPlayer } from '../gameobjects'
import { gameState } from '../helpers'
import type { Enemy } from '../types'

export function addEnemyState(enemy: Enemy) {
  enemy.onStateEnter(State.Idle, () => {
    enemy.play(Animation.Idle)
    const seconds = rand(0.3, 1)
    wait(seconds, () => enemy.enterState(State.Move))
  })

  enemy.onStateEnter(State.Move, () => {
    enemy.play(Animation.Move)
  })

  enemy.onStateEnter(State.Attack, () => {
    const player = getPlayer()

    if (!player?.exists()) {
      return
    }

    enemy.play(Animation.Attack)

    switch (enemy.sprite) {
      case Sprite.Bubbie:
        addBadBubble(enemy)
        break

      case Sprite.Pokey:
        addProjectile(enemy)
        break
    }

    wait(0.2, () => enemy.enterState(State.Cooldown))
  })

  enemy.onStateEnter(State.Cooldown, () => {
    enemy.play(Animation.Cooldown)
    const seconds = rand(1, 3)
    wait(seconds, () => enemy.enterState(State.Move))
  })

  enemy.onStateEnter(State.Stunned, () => {
    enemy.play(Animation.Stunned)
    const seconds = rand(0.3, 1) * gameState.player.bubble.stun
    wait(seconds, () => enemy.enterState(State.Move))
  })

  enemy.onStateUpdate(State.Move, () => {
    const player = getPlayer()

    if (!player?.exists()) {
      return
    }

    if (
      [Sprite.Bubbie, Sprite.Pokey].includes(enemy.sprite as Sprite) &&
      Number(rand()) < 0.005
    ) {
      return enemy.enterState(State.Attack)
    }

    const direction = player.pos.sub(enemy.pos).unit()
    enemy.move(direction.scale(enemy.speed - enemy.bubble * 20))
  })
}
