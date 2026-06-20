import { Scene } from '../constants'
import {
  addAvatar,
  addDrain,
  addEnemy,
  addGame,
  addHealth,
  addMusic,
  addPause,
  addPlayer,
  addScore,
  addText,
  game,
  music,
} from '../gameobjects'
import { gameState, levels, resetGameState } from '../helpers'
import { recordBubbleRunStart } from '../worldline'

scene(Scene.Game, () => {
  resetGameState()
  recordBubbleRunStart()

  addMusic()
  music.play()

  // No WORLDLINE overlay in-game. Briefing lives on the title (before play) and
  // the post-run summary (after play). During play, the game just plays.
  addText({
    width: Math.min(width() - 40, 760),
    height: 100,
    x: center().x,
    y: 80,
    text: `Move: WASD/arrows. Shoot: click.`,
    fontSize: 16,
  })

  addScore()
  addGame()
  addPause()

  addPlayer()
  addHealth()
  addAvatar()

  levels.forEach((level) => {
    game.wait(level.start, () => {
      gameState.enemy.multiplier.damage = level.multiplier.damage
      gameState.enemy.multiplier.health = level.multiplier.health
      gameState.enemy.multiplier.speed = level.multiplier.speed
      gameState.enemy.sprites = level.enemies
      const duration = level.end && level.end - level.start

      game.loop(
        level.loop.enemy,
        addEnemy,
        duration && Math.ceil(duration / level.loop.enemy),
        true,
      )

      game.loop(
        level.loop.drain,
        addDrain,
        duration && Math.ceil(duration / level.loop.drain),
        true,
      )
    })
  })
})
