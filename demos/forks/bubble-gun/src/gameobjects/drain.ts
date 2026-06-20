import { Sprite, Tag } from '../constants'
import { insideCoordinates } from '../helpers'
import type { Enemy } from '../types'
import { game } from '.'

enum Lifespan {
  Min = 5,
  Max = 15,
}

export function addDrain() {
  const drain = game.add([
    sprite(Sprite.Drain),
    pos(insideCoordinates()),
    area({ scale: 0.7 }),
    body({ isStatic: true }),
    anchor('center'),
    scale(0.7),
    lifespan(rand(Lifespan.Min, Lifespan.Max), { fade: 0.5 }),
    opacity(1),
    Tag.Drain,
  ])

  drain.onCollide(Tag.Enemy, (enemy) => {
    const currentEnemy = enemy as Enemy
    if (currentEnemy.bubble) {
      currentEnemy.hurt(9999)
    }
  })

  return drain
}
