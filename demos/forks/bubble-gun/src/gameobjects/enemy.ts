import { Sound, Sprite, State, Tag } from '../constants'
import { addEnemyState } from '../events'
import { gameState, outsideCoordinates } from '../helpers'
import { game, getChildBubble, hurtPlayer, incrementScore } from '.'

export function addEnemy() {
  const damage = randi(1, 10)
  const hp = randi(20, 100) * gameState.enemy.multiplier.health
  const speed = randi(100, 300) * gameState.enemy.multiplier.speed
  const { sprites } = gameState.enemy

  const enemy = game.add([
    sprite(sprites[randi(sprites.length)]),
    pos(outsideCoordinates()),
    anchor('center'),
    health(hp, hp),
    area({ scale: 0.7 }),
    body(),
    scale(0.75),
    state(State.Move),
    Tag.Enemy,
    { bubble: 0, damage, speed },
  ])

  if (enemy.sprite === Sprite.Gooba) {
    play(Sound.Splash)
  }

  addEnemyState(enemy)

  enemy.onCollide(Tag.Player, () => {
    if (enemy.bubble) {
      getChildBubble(enemy)?.destroy()
      enemy.bubble = 0
      return
    }
    enemy.enterState(State.Attack)
    hurtPlayer(enemy.damage)
  })

  // @ts-expect-error Type 'void' is not assignable to type 'KEventController'.
  enemy.onCollideUpdate(Tag.Player, () => {
    if (enemy.bubble) {
      return
    }
    hurtPlayer(enemy.damage / 1000)
  })

  enemy.onHurt(() => {
    enemy.enterState(State.Stunned)
  })

  enemy.onDeath(() => {
    enemy.enterState(State.Stunned)
    incrementScore()
    play(Sound.Explode, { volume: 0.2 })
    enemy.destroy()
    addKaboom(enemy.pos)
  })

  return enemy
}
