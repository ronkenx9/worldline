import { Sound, Sprite, Tag } from '../constants'
import { getDirection } from '../helpers'
import type { Enemy } from '../types'
import { getPlayer, hurtPlayer } from '.'
import { game } from '.'

const SPEED = 500
const DAMAGE = 5

export function addProjectile(enemy: Enemy) {
  play(Sound.Sneeze, { detune: rand(-100, 100) })
  const direction = getDirection(enemy.screenPos()!, getPlayer()!.screenPos()!)

  const projectile = game.add([
    sprite(Sprite.Projectile),
    pos(enemy.pos),
    move(direction, SPEED),
    area(),
    offscreen({ destroy: true }),
    anchor('center'),
    scale(0.2),
    rotate(direction.angle()),
    Tag.Projectile,
  ])

  projectile.onCollide(Tag.Player, () => {
    play(Sound.Pop, { detune: rand(-100, 100) })
    projectile.destroy()
    hurtPlayer(DAMAGE)
  })

  projectile.onCollide(Tag.Enemy, (enemy) => {
    play(Sound.Pop, { detune: rand(-100, 100) })
    enemy.removeAll(Tag.ChildBubble)
    enemy.bubble = false
  })

  return projectile
}
