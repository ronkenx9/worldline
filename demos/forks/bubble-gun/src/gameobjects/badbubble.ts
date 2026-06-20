import { Sound, Sprite, Tag } from '../constants'
import { getDirection } from '../helpers'
import type { Bubble, Enemy, Player } from '../types'
import { getChildBubble, getPlayer, hurtPlayer } from '.'
import { game } from '.'

const SPEED = 200

export function addBadBubble(enemy: Enemy) {
  play(Sound.Shoot, { detune: rand(-100, 100) })

  const badBubble = game.add([
    sprite(Sprite.BadBubble),
    pos(enemy.pos),
    move(getDirection(enemy.screenPos()!, getPlayer()!.screenPos()!), SPEED),
    area({ scale: 0.7 }),
    offscreen({ destroy: true }),
    anchor('center'),
    scale(0.1),
    Tag.BadBubble,
    { damage: 5 },
  ])

  badBubble.onCollide(Tag.Player, (player) => {
    play(Sound.Pop, { detune: rand(-100, 100) })
    badBubble.destroy()

    hurtPlayer(badBubble.damage)
    const currentPlayer = player as Player
    currentPlayer.bubble += 1
    const childBubble = getChildBubble(currentPlayer)

    if (childBubble) {
      childBubble.scaleBy(1.1)
    } else {
      currentPlayer.add([
        sprite(Sprite.BadBubble),
        anchor('center'),
        scale(0.18),
        Tag.ChildBubble,
      ])
    }
  })

  badBubble.onCollide(Tag.BadBubble, (otherBadBubble) => {
    let currentBadBubble: Bubble

    if (badBubble.scale.x >= (otherBadBubble as Bubble).scale.x) {
      currentBadBubble = badBubble
      otherBadBubble.destroy()
    } else {
      currentBadBubble = otherBadBubble as Bubble
      badBubble.destroy()
    }

    if (currentBadBubble.scale.x > 0.2) {
      currentBadBubble.destroy()
    } else {
      currentBadBubble.scaleBy(1.1)
      currentBadBubble.damage *= 1.5
    }
  })

  badBubble.onCollide(Tag.Projectile, () => {
    play(Sound.Pop, { detune: rand(-100, 100) })
    badBubble.destroy()
  })

  badBubble.onCollide(Tag.Bubble, (bubble) => {
    play(Sound.Pop, { detune: rand(-100, 100) })
    badBubble.destroy()
    bubble.destroy()
  })

  return badBubble
}
