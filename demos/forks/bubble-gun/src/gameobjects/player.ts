import { Expression, Scene, Sound, Sprite, Tag } from '../constants'
import { addAttack, addCursorKeys } from '../events'
import { getAvatar, getChildBubble, music } from '../gameobjects'
import { gameState } from '../helpers'
import type { Player } from '../types'
import { recordBubbleRunEnd } from '../worldline'
import { game } from '.'
import { getScoreValue } from './score'

const HEALTH = 100

export function addPlayer(x = center().x, y = center().y) {
  const player = game.add([
    sprite(Sprite.Kiki),
    pos(x, y),
    anchor('center'),
    area({ scale: 0.7 }),
    body(),
    scale(0.75),
    health(HEALTH, HEALTH),
    Tag.Player,
    {
      attack: {
        delay: 1,
        lastFired: -1,
      },
      bubble: 0,
      speed: 320,
    },
  ])

  addCursorKeys(player)
  addAttack(player)

  player.onUpdate(() => {
    setCamPos(player.worldPos()!)
    player.flipX = !(mousePos().x > player.screenPos()!.x)
  })

  player.onCollide(Tag.Enemy, onHit(player))

  player.onCollide(Tag.Projectile, onHit(player))

  player.onDeath(() => {
    recordBubbleRunEnd(getScoreValue())
    getAvatar().play(Expression.Hurt)

    const deadPlayer = add([
      sprite(Sprite.Kiki),
      pos(player.pos),
      anchor('center'),
      scale(0.75),
      lifespan(1, { fade: 1 }),
      opacity(1),
    ])

    deadPlayer.play(Expression.Dead)
    player.destroy()

    wait(3, () => {
      music.stop()
      play(Sound.Whoosh)
      go(Scene.Lose)
    })
  })

  return player
}

export function getPlayer() {
  return game.get(Tag.Player)[0] as Player | undefined
}

export function hurtPlayer(damage: number) {
  getPlayer()?.hurt(damage * gameState.enemy.multiplier.damage)
}

function onHit(player: Player) {
  return () => {
    play(Sound.Hit, { detune: rand(-100, 100) })

    if (player.bubble) {
      getChildBubble(player)?.destroy()
      player.bubble = 0
    }

    const avatar = getAvatar()

    if (player.hp() < player.maxHP()! / 4) {
      player.play(Expression.Hurt)
      avatar.play(Expression.Hurt)
    } else {
      player.play(Expression.Hit)
      avatar.play(Expression.Hit)
    }

    wait(1, () => {
      if (player.exists()) {
        player.play(Expression.Normal)
        avatar.play(Expression.Normal)
      }
    })
  }
}
